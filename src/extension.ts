import * as vscode from 'vscode';
import { initAssert } from './assert';
import { createLogger, Logger } from './log';
import { LanguageParser } from './parsing/parser';
import { TreeViewProvider } from './providers/treeProvider';

function newCommandName(str: string) {
	return 'tree-viewer.' + str;
}

global.logger = new Logger(createLogger());
global.assert = initAssert();

export const VIEW_FILE_NAME = 'readonly:ReadOnlyDocument' as const;

function formatText(str: string): string {
	console.log(str);
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
			words[i - 1] += '\n' + ' '.repeat(Math.max(indent, 0));
			indent = 0;
		}
	}

	console.log(words.length);

	return words.join('');
}

export function activate(context: vscode.ExtensionContext) {
	LanguageParser.init();

	const provider = new TreeViewProvider();

	vscode.workspace.registerTextDocumentContentProvider('readonly', provider);

	const command = vscode.commands.registerCommand(newCommandName('tree_view'), async () => {
		const currentEditor = vscode.window.activeTextEditor;
		if (!currentEditor) {
			logger.debug('user does not have text editor open');
			return;
		}

		const Parsing = await LanguageParser.get(currentEditor.document.languageId);
		assert(Parsing, `parser for ${currentEditor.document.languageId} was not found`);

		const selection = currentEditor.selection;

		let text = currentEditor.document.getText();
		if (!selection.start.isEqual(selection.end)) {
			text = currentEditor.document.getText(selection);
		}

		const nodes = Parsing.parser.parse(text);

		const str = nodes.rootNode.toString();

		let formatted = '';
		try {
			formatted = formatText(str);
		} catch (err) {
			console.error('error in formatting text?', err);
		}

		provider.setText(formatted);

		const uri = vscode.Uri.parse(VIEW_FILE_NAME);
		const doc = await vscode.workspace.openTextDocument(uri);

		await vscode.window.showTextDocument(doc, {
			preview: true,
			preserveFocus: true,
			viewColumn: vscode.ViewColumn.Two,
		});
	});

	context.subscriptions.push(command);
}

// This method is called when your extension is deactivated
export function deactivate() {}
