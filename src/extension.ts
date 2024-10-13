import * as vscode from 'vscode';
import winston from 'winston';
import { initAssert } from './assert';
import { Logger } from './log';
import { LanguageParser } from './parsing/parser';

function makeName(str: string) {
	return 'tree-viewer.' + str;
}

global.logger = new Logger(
	winston.createLogger({
		level: 'debug',
		format: winston.format.simple(),
		transports: [
			new winston.transports.File({
				filename: 'error.log',
				level: 'error',
			}),
			new winston.transports.File({ filename: './combined.log' }),

			new winston.transports.Console({
				format: winston.format.simple(),
			}),
		],
	})
);
global.assert = initAssert();

class TreeViewProvider implements vscode.TextDocumentContentProvider {
	didchangeEmitter: vscode.EventEmitter<vscode.Uri> =
		new vscode.EventEmitter<vscode.Uri>();
	onDidChange: vscode.Event<vscode.Uri> | undefined =
		this.didchangeEmitter.event;

	private text: string = '';

	setText(str: string) {
		this.text = str;
		assert(this.onDidChange, 'change events shuld be defined');
		this.didchangeEmitter.fire(
			vscode.Uri.parse('readonly:ReadOnlyDocument')
		);
	}

	provideTextDocumentContent(
		uri: vscode.Uri,
		token: vscode.CancellationToken
	): vscode.ProviderResult<string> {
		return this.text;
	}
}

function formatText(str: string): string {
	let indent = 0;
	const words = str.split(' ');
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		if (word.includes('(')) {
			indent++;
		} else if (word.includes(')')) {
			indent--;
		}
		if (i > 0 && !words[i - 1].includes(':')) {
			words[i - 1] += '\n' + ' '.repeat(indent);
			indent = 0;
		}
	}

	return words.join('');
}

function getLanguage() {}

export function activate(context: vscode.ExtensionContext) {
	LanguageParser.init();

	const provider = new TreeViewProvider();

	vscode.workspace.registerTextDocumentContentProvider('readonly', provider);

	const command = vscode.commands.registerCommand(
		makeName('lexical_view'),
		async () => {
			const currentEditor = vscode.window.activeTextEditor;
			if (!currentEditor) {
				logger.debug('user does not have text editor open');
				return;
			}

			const Parsing = await LanguageParser.get(
				currentEditor.document.languageId
			);
			assert(
				Parsing,
				`parser for ${currentEditor.document.languageId} was not found`
			);

			const selection = currentEditor.selection;

			let text = currentEditor.document.getText();
			if (!selection.start.isEqual(selection.end)) {
				text = currentEditor.document.getText(selection);
			}

			const nodes = Parsing.parser.parse(text);

			const toparse = nodes.rootNode.toString();

			provider.setText(formatText(toparse));

			const uri = vscode.Uri.parse(`readonly:ReadOnlyDocument`);
			const doc = await vscode.workspace.openTextDocument(uri);

			await vscode.window.showTextDocument(doc, {
				preview: true,
				preserveFocus: true,
				viewColumn: vscode.ViewColumn.Two,
			});
		}
	);

	context.subscriptions.push(command);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export function visualize(range: vscode.Range): void {
	const editor = vscode.window.activeTextEditor;
	assert(editor, 'editor is invalid for this operation');

	editor.revealRange(range);
	editor.selection = new vscode.Selection(range.start, range.end); // Move cursor to that position
}

