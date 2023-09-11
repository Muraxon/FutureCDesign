import * as vscode from 'vscode';
import * as path from 'path';

function createWebViewLink(extension_path :string, panel :vscode.WebviewPanel, ...paths :string[]) {
	// Get path to resource on disk
	const onDiskPathtemp = vscode.Uri.file(
		path.join(extension_path, ...paths)
	);

	return panel.webview.asWebviewUri(onDiskPathtemp);
}

function escape_HTML(html_str :string) {
	var encodedStr = html_str.replace(/[\u00A0-\u9999<>\&\"]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });
	 return encodedStr;
}

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class ImportRecordsEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new ImportRecordsEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(ImportRecordsEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'MarcelSotiropoulos.Importrecords';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel, document);
		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'add':
					
					return;

				case 'delete':
					return;
			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.WebviewPanel, textdocument :vscode.TextDocument): string {

		let columns = 0;
		let html = "";
		for (let index = 0; index < textdocument.lineCount; index++) {
			let line = textdocument.lineAt(index);
			if(line.text.trim().length > 0) {
				let splittedLine = line.text.split(/\t/gm)
				let temp_columns = splittedLine.length;
				if(temp_columns > columns) {
					columns = temp_columns;
				}
			}
		}

		for (let index = 0; index < textdocument.lineCount; index++) {
			let line = textdocument.lineAt(index);
			if(line.text.trim().length > 0) {


				let splittedLine = line.text.split(/\t/gm)
	
				html += "<tr>"
				let current_column = 0;
				splittedLine.forEach((value) => {
					if(value.trim().length > 0) {
						html += `<td id="${current_column++}">${escape_HTML(value)}</td>`
					} else {
						html += `<td id="${current_column++}"></td>`
					}
				});
				while(current_column < columns) {
					html += `<td id="${current_column++}"></td>`
				}
				html += "</tr>"

			}
		}

		let columnsHtml = ""
		for (let index = 0; index < columns; index++) {
			columnsHtml += `<th>Spalte ${"" + (index + 1)}</th>`;
		}

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<link rel="stylesheet" href="${createWebViewLink(this.context.extensionPath, webview, "webview", "css", "main importrecords.css")}">
				<link rel="stylesheet" href="${createWebViewLink(this.context.extensionPath, webview, "webview", "css", "jquery.datatables.css")}">
				
			</head>
			<body>
			
			<table id="myTable" class="display">
			<thead>
			<tr>
			${columnsHtml}
			</tr>
			</thead>
			<tbody>
			${html}
			</tbody>
			</table>

				
			<script src="${createWebViewLink(this.context.extensionPath, webview, "webview", "js", "jquery.js")}"></script>
			</body>
			</html>`;
	}

	
}