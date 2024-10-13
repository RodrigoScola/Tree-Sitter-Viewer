import * as vscode from 'vscode';
import { VIEW_FILE_NAME } from '../extension';

export class TreeViewProvider implements vscode.TextDocumentContentProvider {
	didchangeEmitter: vscode.EventEmitter<vscode.Uri> =
		new vscode.EventEmitter<vscode.Uri>();
	onDidChange: vscode.Event<vscode.Uri> | undefined =
		this.didchangeEmitter.event;

	private text: string = '';

	setText(str: string) {
		this.text = str;
		assert(this.onDidChange, 'change events shuld be defined');
		this.didchangeEmitter.fire(vscode.Uri.parse(VIEW_FILE_NAME));
	}

	provideTextDocumentContent(
		uri: vscode.Uri,
		token: vscode.CancellationToken
	): vscode.ProviderResult<string> {
		return this.text;
	}
}
