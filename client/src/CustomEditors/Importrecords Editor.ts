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

	private static m_TableInfo :Map<number,{columns: Map<number,string>, table_name :string}> = new Map();


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
		webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel, document);
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

	async CollectProgramTables(FilesImportattributes :vscode.Uri[]) {

		for (let index = 0; index < FilesImportattributes.length; index++) {
			const element = FilesImportattributes[index];
			let document = await vscode.workspace.openTextDocument(element);
			let document_text = document.getText();

			let table_start_reg = new RegExp("^([0-9]+)\\t[0-9]+\\t", "gm");
			let foundTable = table_start_reg.exec(document_text);
			while(foundTable &&  foundTable[1]) {
				let startColumn = 1;
				let failures_columns = 0;

				let table_name_reg = new RegExp("" + foundTable[1] + "\\tTABLE\\t([a-zA-ZöäüÖÄÜ_ \\-0-9€\\/]+)", "gm");
				let table_name = table_name_reg.exec(document_text);
				
				while(startColumn < 1000 && failures_columns < 10) {
					let column_start_reg = new RegExp("^" + foundTable[1] + "\\t" + startColumn + "\\t[0-9]+\\t([a-zA-ZöäüÖÄÜ_ \\-0-9€\\/]+)", "gm");
					let column_reg = column_start_reg.exec(document_text);
					if(column_reg && column_reg[1]) {
						failures_columns = 0;

						if(ImportRecordsEditorProvider.m_TableInfo.has(parseInt(foundTable[1]))) {
							let table = ImportRecordsEditorProvider.m_TableInfo.get(parseInt(foundTable[1]))
							table.columns.set(startColumn, column_reg[1]);
						} else {
							let table_columns :Map<number,string> = new Map();
							table_columns.set(startColumn, column_reg[1]);

							let table_name_string = ""
							if(table_name && table_name[1]) {
								table_name_string = table_name[1];
							}

							ImportRecordsEditorProvider.m_TableInfo.set(parseInt(foundTable[1]), {columns: table_columns, table_name: table_name_string});
						}
						if(table_start_reg.lastIndex < column_reg.index) {
							table_start_reg.lastIndex = column_reg.index + 1;
						}
					} else {
						failures_columns++;
					}
					startColumn++;
				}					
				if(failures_columns >= 10) {
					table_start_reg.lastIndex = table_start_reg.lastIndex + 10;
				}

				foundTable = table_start_reg.exec(document_text);
			}
		}
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private async getHtmlForWebview(webview: vscode.WebviewPanel, textdocument :vscode.TextDocument): Promise<string> {
		let FilesImportattributes = await vscode.workspace.findFiles("Standard/*importattributes*");
		if(ImportRecordsEditorProvider.m_TableInfo.size <= 0) {
			await this.CollectProgramTables(FilesImportattributes);
		}
		let document_text = textdocument.getText();
		
		let html_complete = "";
		let navigation_buttons = "";
		
		let import_table_reg = new RegExp("^TABLE:([0-9]+)", "gm");
		let import_table = import_table_reg.exec(document_text);
		while(import_table && import_table[1]) {
			let html = "";
			let line_number = textdocument.positionAt(import_table.index + 1).line;

			let line = textdocument.lineAt(line_number);
			let line_text = line.text.trim();
			if(line_text.indexOf("//") > 0) {
				line_text = line_text.substring(0, line_text.indexOf("//"));
			}

			let strSpaltenzuweisung :string[] = [];

			while(line_text.length > 0) {


				if(line_text.startsWith("COLS:")) {
					strSpaltenzuweisung = line_text.substring(5).split(",");
				} else if(line_text.search(/^[0-9]+/gm) == 0) {
					let line_splitted = line_text.split("\t");
					html += "<tr>";
					line_splitted.forEach((value, index) => {
						if(value.trim().length > 0) {
							html += `<td id=${import_table[1] + "-" + index}>${escape_HTML(value)}</td>`
						} else {
							html += `<td></td>`
						}
					});
					html += "</tr>";
				}

				line_number++;
				if(line_number < textdocument.lineCount) {
					line = textdocument.lineAt(line_number);
					line_text = line.text.trim();
					if(line_text.indexOf("//") > 0) {
						line_text = line_text.substring(0, line_text.indexOf("//"));
					}
				} else {
					line_text = "";
				}
			}
			
			let column_header = "<tr>";

			
			let table = "";
			strSpaltenzuweisung.forEach((value) => {
				let column_number = parseInt(value);
				let table_number = parseInt(import_table[1]);




				let column_name = "";
				if(ImportRecordsEditorProvider.m_TableInfo.has(table_number)) {
					if(column_number == 1) {
						column_name = "ID";
					} else if(column_number == 2){
						column_name = "Aktiv";
					} else {
 						table = ImportRecordsEditorProvider.m_TableInfo.get(table_number).table_name;


						if(ImportRecordsEditorProvider.m_TableInfo.get(table_number).columns.has(column_number)) {
							column_name = ImportRecordsEditorProvider.m_TableInfo.get(table_number).columns.get(column_number);
						}
					}
				}

				column_header += `<th>${column_name}</th>`;
			})
			column_header += "</tr>";
			
			navigation_buttons += `<button data-id="${import_table[1]}">${table} (${import_table[1]})</button>`

			html = `
			<table id="${import_table[1]}">
			<thead>
			${column_header}
			</thead>
			<tbody>
			${html}
			</tbody>
			</table>`;

			html_complete += html;

			import_table = import_table_reg.exec(document_text);
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
			<div>${navigation_buttons}</div>
			
			<br>
			<br>
			
			${html_complete}

				
			<script src="${createWebViewLink(this.context.extensionPath, webview, "webview", "js", "jquery.js")}"></script>
			<script src="${createWebViewLink(this.context.extensionPath, webview, "webview", "js", "importrecords.js")}"></script>
			</body>
			</html>`;
	}

	
}