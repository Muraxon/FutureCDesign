/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { readFile, readFileSync } from 'fs';
import * as path from 'path';
import { workspace, ExtensionContext, window, commands, ViewColumn, env, Uri, TextEdit, Range, Position, TextEditorRevealType, Selection, WebviewPanel, Webview, Location, LocationLink, Definition, EndOfLine } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { CDesign } from './CDesignWebConstructor';

let client: LanguageClient;
let extension_path :string;
function createWebViewLink(panel :WebviewPanel, ...paths :string[]) {
	// Get path to resource on disk
	const onDiskPathtemp = Uri.file(
		path.join(extension_path, ...paths)
	);

	return panel.webview.asWebviewUri(onDiskPathtemp);
}


function column_type_to_number(column_type :string) {
	if(column_type == "TYPE_BOOL") {
		return "1";
	}
	if(column_type == "TYPE_BYTE") {
		return "2";
	}
	if(column_type == "TYPE_SHORT") {
		return "3";
	}
	if(column_type == "TYPE_INT") {
		return "4";
	}
	if(column_type == "TYPE_PERCENT") {
		return "5";
	}
	if(column_type == "TYPE_DOUBLE") {
		return "6";
	}
	if(column_type == "TYPE_FIXSTRING") {
		return "10";
	}
	if(column_type == "TYPE_DATETIME") {
		return "11";
	}
	if(column_type == "TYPE_MONEY") {
		return "12";
	}
	if(column_type == "TYPE_LINK") {
		return "21";
	}
	if(column_type == "TYPE_VARSTRING") {
		return "30";
	}
	if(column_type == "TYPE_PICTURE") {
		return "31";
	}
	if(column_type == "TYPE_VARDATA") {
		return "32";
	}
	if(column_type == "TYPE_SUBTABLE") {
		return "33";
	}
	if(column_type == "TYPE_LINKTABLE") {
		return "34";
	}
	if(column_type == "TYPE_CTABLE") {
		return "35";
	}
	if(column_type == "TYPE_CSTRING") {
		return "40";
	}
	if(column_type == "TYPE_CSTRINGARRAY") {
		return "42";
	}
	if(column_type == "TYPE_CGRAPHIC") {
		return "43";
	}
	if(column_type == "TYPE_CALCULATION") {
		return "44";
	}
	if(column_type == "TYPE_SCRIPT_CALCULATION") {
		return "45";
	}
	if(column_type == "TYPE_FLOAT") {
		return "50";
	}
	if(column_type == "TYPE_CDIALOG") {
		return "50";
	}
	if(column_type == "TYPE_CCHAT") {
		return "51";
	}
	if(column_type == "TYPE_CPRINTER") {
		return "52";
	}
	if(column_type == "TYPE_CHELPER") {
		return "53";
	}
	if(column_type == "TYPE_CFILE") {
		return "54";
	}
}

export async function activate(context: ExtensionContext) {
	extension_path = context.extensionPath;
	let FilesImportattributes = await workspace.findFiles("**/*importattributes*");
	

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
		workspaceFolder: workspace.workspaceFolders[0],
		middleware: {
			provideDefinition: async (doc, pos, token, next) => {
				
				let loc :LocationLink[]|Definition = await next(doc, pos, token);
				if(loc && loc[0] && loc[0].range && loc[0].range.start) {
					for (let index = 0; index < FilesImportattributes.length; index++) {
						const element = FilesImportattributes[index];
						let importattributesFile = await workspace.openTextDocument(element);
						let text = importattributesFile.getText();
						let searchText = new RegExp("^" + loc[0].range.start.character + "\\t" + loc[0].range.start.line + "\\t", "gm");

						let found = text.search(searchText);
						if(found >= 0) {
							let pos = importattributesFile.positionAt(found);
							return new Location(importattributesFile.uri, pos);
						}
					}
				}
				return [];
			}
		}
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
			let editor = window.activeTextEditor;

			let filename = editor.document.fileName;
			let backslash = filename.lastIndexOf("\\");

			let config = workspace.getConfiguration();
			let designzuordnung = config.get<Object>("FutureCDesign.Designzuordnung");
			let showHelp = config.get<boolean>("FutureCDesign.ShowHelpFirstTime");

			filename = filename.replace(workspace.workspaceFolders[0].uri.fsPath + "\\", "");

			let module = designzuordnung[filename + ":MODULE"]
			if(designzuordnung[filename] && module) {

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
					ViewColumn.Active,
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				);
	
			
				createWebViewLink(panel, 'webview', 'js', 'dragmove.js');
				createWebViewLink(panel, "webview", "js", "jquery.js");
				createWebViewLink(panel, "webview", "html", "help.png");
				createWebViewLink(panel, "webview", "js", "custom.js");
				createWebViewLink(panel, "webview", "css", "main.css");
	
			
				const onDiskPath = createWebViewLink(panel, 'webview', 'js', 'dragmove.js');
				const jquery_path = createWebViewLink(panel, "webview", "js", "jquery.js");
				const help_pic = createWebViewLink(panel, "webview", "html", "help.png");
				const custom_js_path = createWebViewLink(panel, "webview", "js", "custom.js");
				const custom_css_path = createWebViewLink(panel, "webview", "css", "main.css");
				const drag_drop_video = createWebViewLink(panel, "webview", "media", "Drag_Drop_Multiple_elements.gif");
				const media_path = createWebViewLink(panel, "webview", "media");

				let docs = [];

				for (let index = 0; index < FilesImportattributes.length; index++) {
					const element = FilesImportattributes[index];
					let doc = await workspace.openTextDocument(element);
					docs.push(doc);
				}

				for(let x = 0; x < designzuordnung[filename].length; x++) {
					let new_file = workspace.workspaceFolders[0].uri.fsPath + "\\" +  designzuordnung[filename][x];
					let doc = await workspace.openTextDocument(new_file);
					docs.push(doc);
				}
				docs.push(editor.document);
				
				let obj = CDesign.CreateElements(docs, tablenumer, page, module);
				
				let html_text = readFileSync(path.join(context.extensionPath, "webview", "html", "index.html")).toString("utf-8");
				html_text = html_text.replace("DIALOG_HTML", obj.html);
				html_text = html_text.replace("DIALOG_CSS", obj.css);
				html_text = html_text.replace("ONDISKPATH", onDiskPath.toString());
				html_text = html_text.replace("TABLE_NUMBER", tablenumer);
				html_text = html_text.replace("ACTIVE_INDEX", obj.activeindex.toString());
				html_text = html_text.replace("JQUERY_PATH", jquery_path.toString());
				html_text = html_text.replace("HELP_PNG_PATH", help_pic.toString());

				html_text = html_text.replace("CUSTOM_JS_PATH", custom_js_path.toString());

				html_text = html_text.replace("MAIN_STYLES_PATH", custom_css_path.toString());
				html_text = html_text.replace("DRAG_DROP_VIDEO", drag_drop_video.toString());
				html_text = html_text.replace("VERSION_NUMBER", context.extension.packageJSON.version);
				while(html_text.indexOf("MEDIA_PATH") >= 0) {
					html_text = html_text.replace("MEDIA_PATH", media_path.toString());
				}

			
				panel.webview.html = html_text;
				panel.webview.onDidReceiveMessage(async (messages) => {
	
					for(let y = 0; y < messages.length; y++) {
						switch (messages[y].command) {
							case "removeElement":
								let new_editor_ = await window.showTextDocument(editor.document, ViewColumn.Active);
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
	
								panel.webview.postMessage({ command: 'createNewElement', new_id: input, offsetX: messages[y].offsetX, offsetY: messages[y].offsetY });
								break;
							case "saveChanges":
								let new_editor = await window.showTextDocument(editor.document, ViewColumn.Active);
		
								messages[y].values.sort((a, b) => {
									return a.order - b.order
								})

								for(let x = 0; x < messages[y].values.length; x++) {
									let text = new_editor.document.getText();
									let index = text.lastIndexOf("CHANGEDIALOGELEMENT:" + messages[y].table + ";" + messages[y].column + ";");
									if(messages[y].type == 45 || messages[y].type == 4) {
										index = text.lastIndexOf("CHANGEDIALOGELEMENT:" + messages[y].table + ";0;" + messages[y].name);
									}
	
									if(index >= 0) {
										let endofLine = text.indexOf("\n", index + 1);
										let endofLineTemp = text.indexOf("//", index + 1);
										if(endofLineTemp >= 0 && endofLineTemp < endofLine) {
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
										let tabletoSearch = parseInt(messages[y].table);
										let index = -1;

										let value_no_columns = "";
										let increment = false;
										if(messages[y].type == 45 || messages[y].type == 4) {
											value_no_columns = messages[y].name + ";";
											increment = true;
											searchColumn = 1;
										}

										while(index < 0 && searchColumn >= 1 && searchColumn < 1000 && tabletoSearch > 0 && tabletoSearch < 1000) {
											index = text.search("CHANGEDIALOGELEMENT:" + tabletoSearch + ";" + searchColumn + ";");
											if(!increment) {
												searchColumn--;
												if(searchColumn <= 1) {
													tabletoSearch--;
													searchColumn = 1000;
												}
											} else {
												searchColumn++;
												if(searchColumn > 1000) {
													tabletoSearch++;
													searchColumn = 0;
												}
											}

										}

										if(index < 0) {
											index = 0;
										}
	
										messages[y].values[x].text = CDesign.FromBrowserToFutureFormat(messages[y].values[x].type, messages[y].values[x].text);

										let endofLine = text.indexOf("\n", index + 4);
										endofLine++;
										if(increment) {
											endofLine = index;
										}
										await new_editor.edit((editBuilder) => {
											let pos = new_editor.document.positionAt(endofLine);
											let text = "CHANGEDIALOGELEMENT:" + messages[y].table + ";" + messages[y].column + ";" + value_no_columns + messages[y].values[x].type + messages[y].values[x].text + ";\n";
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
				setTimeout(() => {
					panel.webview.postMessage({
						command: "showHelp",
						showHelp: showHelp
					});
				}, 4000);
				panel.onDidDispose(
					() => {
						// When the panel is closed, cancel any future updates to the webview content
						window.showErrorMessage("disposed");
					},
					null,
					context.subscriptions
				);
			} else {
				window.showErrorMessage(
				`ACHTUNG!!!
				Für die Datei ${editor.document.fileName} wurde keine Designzuordnung oder Module gefunden. Bitte gehen Sie in die Einstellung und hinterlegen sie eine passende Zuordnung.
				Diese könnte wiefolgt aufgebaut sein:
				"Standard\\auftrag - design.txt": [
					"Tempordner\\Testdesign.txt"
				]
				"Standard\\auftrag - design.txt:MODULE": ["30","20","40","20"]
				Diese Einstellung bedeutet: Für die Datei "auftrag - design.txt" wird die Datei "Testdesign.txt" vorher durchsucht und dann erst die Datei "auftrag - design.txt"
				`, {
					modal: true
				}, "Einstellung öffnen").then((value) => {
					if(value == "Einstellung öffnen") {
						commands.executeCommand("workbench.action.openWorkspaceSettings", {openToSide: false, query: "FutureCDesign.Designzuordnung"});
					}
				})
			}
		})
	);

	context.subscriptions.push(commands.registerCommand("open.condition.selector", async () => {

		let condition_panel = window.createWebviewPanel("Condition Selector", "Condition Selector", ViewColumn.Active, {
			enableScripts: true
		});

		const custom_css_path = createWebViewLink(condition_panel, "webview", "css", "condition_selector.css");
		const background_image = createWebViewLink(condition_panel, "webview", "media", "background_complete.png");

		
		let html_text = readFileSync(path.join(context.extensionPath, "webview", "html", "condition_selector.html"), "utf-8");
		html_text = html_text.replace("DIALOG_CSS_PATH", custom_css_path.toString());

		while(html_text.indexOf("BACKGROUND_IMAGE_PATH") >= 0) {
			html_text = html_text.replace("BACKGROUND_IMAGE_PATH", background_image.toString());
		}


		condition_panel.webview.html = html_text;
		await commands.executeCommand("workbench.action.toggleZenMode");
		condition_panel.onDidDispose(() => {
			commands.executeCommand("workbench.action.exitZenMode");
		}, null, context.subscriptions);
	}));

	context.subscriptions.push(commands.registerCommand("create.database.column", async () => {

		let tablenumbers = [];
		let strTablenumber = await window.showInputBox({
			ignoreFocusOut: true,
			prompt: "Bitte geben Sie die Tabelle an, in der sie die Spalte erstellen wollen.",
			title: "Tabellennummer"
		});
		
		let nTablenumber = parseInt(strTablenumber);
		if(nTablenumber >= 150 && nTablenumber <= 157) {
			if(nTablenumber % 2 == 0) {
				tablenumbers.push("150");
				tablenumbers.push("152");
				tablenumbers.push("154");
				tablenumbers.push("156");
			} else {
				tablenumbers.push("151");
				tablenumbers.push("153");
				tablenumbers.push("155");
				tablenumbers.push("157");
			}
		} else if(nTablenumber >= 185 && nTablenumber <= 189) {
			if(nTablenumber % 2 == 0) {
				tablenumbers.push("186");
				tablenumbers.push("188");
				tablenumbers.push("190");
			} else {
				tablenumbers.push("185");
				tablenumbers.push("187");
				tablenumbers.push("189");
			}
		} else {
			tablenumbers.push(strTablenumber);
		}

		let strColumnName = await window.showInputBox({
			ignoreFocusOut: true,
			prompt: "Bitte geben Sie den Namen der Spalte ein.",
			title: "Spaltenname"
		});

		let column_type = await window.showQuickPick([
			"TYPE_BOOL",
			"TYPE_BYTE",
			"TYPE_SHORT",
			"TYPE_INT",
			"TYPE_PERCENT",
			"TYPE_DOUBLE",
			"TYPE_FIXSTRING",
			"TYPE_DATETIME",
			"TYPE_MONEY",
			"TYPE_LINK",
			"TYPE_VARSTRING",
			"TYPE_PICTURE",
			"TYPE_VARDATA",
			"TYPE_SUBTABLE",
			"TYPE_LINKTABLE",
			"TYPE_CTABLE",
			"TYPE_CSTRING",
			"TYPE_CSTRINGARRAY",
			"TYPE_CGRAPHIC",
			"TYPE_CALCULATION",
			"TYPE_SCRIPT_CALCULATION",
			"TYPE_FLOAT",
			"TYPE_CDIALOG",
			"TYPE_CCHAT",
			"TYPE_CPRINTER",
			"TYPE_CHELPER",
			"TYPE_CFILE"
		], {
			ignoreFocusOut: true,
			canPickMany: false,
			title: "Bitte wählen sie die Art der Spalte"
		});

		column_type = column_type_to_number(column_type);
		let docText = window.activeTextEditor.document.getText()
		let reg = new RegExp("^" + tablenumbers[0] + ".*?" + strColumnName, "gm");
		let m = reg.exec(docText);
		if(m) {
			window.activeTextEditor.revealRange(new Range(window.activeTextEditor.document.positionAt(m.index), window.activeTextEditor.document.positionAt(m.index)), TextEditorRevealType.InCenter);
			let answer = await window.showErrorMessage("Spaltenname in der Tabelle existiert bereits. Wollen Sie dennoch fortfahren?", "Ja", "Nein");
			if(answer == "Nein") {
				return;
			}
		}
		
		for(let x = 0; x < tablenumbers.length; x++) {
			docText = window.activeTextEditor.document.getText()

		
			let m :RegExpExecArray | null = null;
			let mFinal :RegExpExecArray | null = null;
			let i = 5;
			while(m || i == 5) {
				let regex = new RegExp("^" + tablenumbers[x] + "\\t" + i.toString(), "gm");
				mFinal = m;
				m = regex.exec(docText);
				i++;
			}
	
			let start = mFinal.index;
			start = docText.indexOf("\n", start + 1);
			i--;
	
			await window.activeTextEditor.edit((editor) => {
				let pos = new Position(window.activeTextEditor.document.positionAt(start).line + 1, 0);
				editor.insert(pos, tablenumbers[x] + "\t"+i.toString()+"\t0\t"+strColumnName+"\t"+column_type+"\n");
				window.activeTextEditor.revealRange(new Range(pos, pos), TextEditorRevealType.InCenter);
			});

		}
	}));

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

