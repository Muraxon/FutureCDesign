/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { readFileSync } from 'fs';
import * as path from 'path';
import { workspace, ExtensionContext, window, commands, ViewColumn, env, Uri, TextEdit, Range, Position, TextEditorRevealType, Selection } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { CDesign } from './CDesignWebConstructor';

let client: LanguageClient;

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
};

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'futurecdesign' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		workspaceFolder: workspace.workspaceFolders[0]
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'FutureC Design LanguageServer',
		'Language Server für FutureC Designs',
		serverOptions,
		clientOptions
	);

	context.subscriptions.push(
		commands.registerCommand("open.futurec.designer", async () => {

			let tablenumer = await window.showInputBox({
				prompt: "Welche Tabellennummer?",
				ignoreFocusOut: true,
				placeHolder: "e.g.: 200",
				validateInput: (val) => {
					if (!val.match(/[0-9]+/)) {
						return "Wert muss [0-9]+ entsprechen!";
					}
					return null;
				}
			});

			let page = "a";
			if (tablenumer.length <= 0 || page.length <= 0) {
				return;
			}

			const panel = window.createWebviewPanel(
				'designWebview',
				'Test',
				ViewColumn.Beside,
				{
					enableScripts: true,
					retainContextWhenHidden: true
				}
			);

			// Get path to resource on disk
			const onDiskPathtemp = Uri.file(
				path.join(context.extensionPath, 'webview', 'js', 'dragmove.js')
			);

			const jquery_path_temp = Uri.file(
				path.join(context.extensionPath, 'webview', 'js', 'jquery.js')
			);

			const onDiskPath = panel.webview.asWebviewUri(onDiskPathtemp);
			const jquery_path = panel.webview.asWebviewUri(jquery_path_temp);

			let editor = window.activeTextEditor;
			let obj = CDesign.CreateElements(editor.document, tablenumer, page);
			
			let html_text = readFileSync(path.join(context.extensionPath, "webview", "html", "index.html")).toString("utf-8");
			html_text = html_text.replace("DIALOG_HTML", obj.html);
			html_text = html_text.replace("DIALOG_CSS", obj.css);
			html_text = html_text.replace("ONDISKPATH", onDiskPath.toString());
			html_text = html_text.replace("TABLE_NUMBER", tablenumer);
			html_text = html_text.replace("JQUERY_PATH", jquery_path.toString());
			
			panel.webview.html = html_text;

			panel.webview.onDidReceiveMessage(async (messages) => {

				for(let y = 0; y < messages.length; y++) {
					switch (messages[y].command) {
						case "removeElement":
							let new_editor_ = await window.showTextDocument(editor.document, ViewColumn.One);
							let text = new_editor_.document.getText();

							let indexFound = text.indexOf("CHANGEDIALOGELEMENT:" + messages[y].table + ";" + messages[y].column + ";");
							
							if(indexFound >= 0) {
								let endofLine = text.indexOf("\n", indexFound + 1);
								new_editor_.edit((editBuilder) => {
									let pos = new_editor_.document.positionAt(indexFound);
									let pos_end = new_editor_.document.positionAt(endofLine);
									let range = new Range(pos, pos_end);
									editBuilder.delete(range);
									new_editor_.revealRange(range, TextEditorRevealType.InCenter);
								});
							}
							break;
						case "askColumn":
							let input = await window.showInputBox({
								ignoreFocusOut: true,
								prompt: "Bitt geben Sie die Spalte ein:"
							});

							panel.webview.postMessage({ command: 'setColumnOfNewElement', id: messages[y].id, newid: input });
							break;
						case "saveChanges":
							let new_editor = await window.showTextDocument(editor.document, ViewColumn.One);
	
							for(let x = 0; x < messages[y].values.length; x++) {
								let text = new_editor.document.getText();
								let index = text.lastIndexOf("CHANGEDIALOGELEMENT:" + messages[y].table + ";" + messages[y].column + ";");
								if(messages[y].type == 45) {
									index = text.lastIndexOf("CHANGEDIALOGELEMENT:" + messages[y].table + ";0;" + messages[y].name);
								}

								if(index >= 0) {
									let endofLine = text.indexOf("\n", index + 1);
									let endofLineTemp = text.indexOf("//", index + 1);
									if(endofLineTemp < endofLine) {
										endofLine = endofLineTemp;
									}

									let indexStart = text.indexOf(messages[y].values[x].type, index + 1);
									if(messages[y].values[x].text.length > 0) {
	
										if(indexStart >= 0 && indexStart < endofLine) {
											indexStart += messages[y].values[x].type.length;
											let indexEnd = text.indexOf(";", indexStart);
	
											if(messages[y].values[x].type == "ONCHANGE=") {
												let onchangeIndeces = CDesign.GetOnChangeStartAndEnd(text, indexStart);
												indexEnd = onchangeIndeces.end;
											}
	
											if(indexEnd >= 0 && indexEnd < endofLine) {
												await new_editor.edit((editBuilder) => {
													let pos = new_editor.document.positionAt(indexStart);
													let pos_end = new_editor.document.positionAt(indexEnd);
			
													let rangeStart = new Range(pos, pos_end);
													rangeStart = editor.document.validateRange(rangeStart);
													
													try {
												
														messages[y].values[x].text = CDesign.FromBrowserToFutureFormat(messages[y].values[x].type, messages[y].values[x].text);
														editBuilder.replace(rangeStart, messages[y].values[x].text);
														new_editor.selection = new Selection(pos, pos);
														new_editor.revealRange(rangeStart, TextEditorRevealType.InCenter);
													} catch (error) {
														console.log(error);
													}
													
												}).then((fulfilled) => {
													console.log(fulfilled);
												}, (reason) => {
													
												})
											}
										} else {
											await new_editor.edit((editBuilder) => {
												let pos = new_editor.document.positionAt(endofLine - 1);
		
												

												messages[y].values[x].text = CDesign.FromBrowserToFutureFormat(messages[y].values[x].type, messages[y].values[x].text);
												
		
												let text =  messages[y].values[x].type + messages[y].values[x].text + ";";
												editBuilder.insert(pos, text);
												new_editor.selection = new Selection(pos, pos);
												new_editor.revealRange(new Range(pos, pos), TextEditorRevealType.InCenter);
											}).then((ful) => {
												console.log(ful);
											})
										}
									} else {
										if(indexStart >= 0 && indexStart < endofLine) {
											let tempindexStart = indexStart + messages[y].values[x].type.length;
											let indexEnd = text.indexOf(";", tempindexStart);
	
											if(messages[y].values[x].type == "ONCHANGE=") {
												let onchangeIndeces = CDesign.GetOnChangeStartAndEnd(text, tempindexStart);
												indexEnd = onchangeIndeces.end;
											}
	
											await new_editor.edit((editBuilder) => {
												let pos = new_editor.document.positionAt(indexStart);
												let pos_end = new_editor.document.positionAt(indexEnd + 1);
												let range = new Range(pos, pos_end);
	
												editBuilder.delete(range);
												new_editor.selection = new Selection(pos, pos);
												new_editor.revealRange(range, TextEditorRevealType.InCenter);
											}).then((ful) => {
												console.log(ful);
											})
										}
									}
								} else {
									let searchColumn = parseInt(messages[y].column) - 1;
									let index = -1;
									while(index < 0) {
										index = text.search("CHANGEDIALOGELEMENT:" + messages[y].table + ";" + searchColumn + ";");
										searchColumn--;
									}

									messages[y].values[x].text = CDesign.FromBrowserToFutureFormat(messages[y].values[x].type, messages[y].values[x].text);

									let endofLine = text.indexOf("\n", index + 4);
									endofLine++;
									await new_editor.edit((editBuilder) => {
										let pos = new_editor.document.positionAt(endofLine);
										let text = "CHANGEDIALOGELEMENT:" + messages[y].table + ";" + messages[y].column + ";" + messages[y].values[x].type + messages[y].values[x].text + ";\n";
										editBuilder.insert(pos, text);
										new_editor.revealRange(new Range(pos, pos), TextEditorRevealType.InCenter);
									});
								}
							}
							
							break;
					
						default:
							break;
					}
				}
			})

				
			panel.onDidDispose(
				() => {
					// When the panel is closed, cancel any future updates to the webview content
					window.showErrorMessage("disposed");
				},
				null,
				context.subscriptions
			);
		})
	);

	// Start the client. This will also launch the server
	client.start();
	window.showInformationMessage("Activation finished");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

