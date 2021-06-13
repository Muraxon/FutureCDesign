/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	MarkupKind,
	Location,
	DiagnosticRelatedInformation
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { CDesignParser } from './CDesignParser';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that this server supports code completion.
			completionProvider: {},
			signatureHelpProvider: {
				triggerCharacters: ["."]
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();
	const diagnostics: Diagnostic[] = [];
	let pos = -1;
	pos = text.indexOf("\n", pos + 1);
	let line = text.substring(0, pos);
	line = line.trim();

	let m = line.match(/^ELEMENTLEVEL:(-1|[0-9]+)/gm);
	if(!m) {
		diagnostics.push({
			message: "First thing in this file must be 'ELEMENTLEVEL:(-1|[0-9]+)'" ,
			range: {
				end: textDocument.positionAt(0),
				start: textDocument.positionAt(0),
			}
		})
	}

	diagnostics.push(...CDesignParser.CheckDuplicateDesignEntries(/^CHANGEDIALOGELEMENT:([0-9]+);([1-9]+);/gm, text, textDocument));
	diagnostics.push(...CDesignParser.CheckDuplicateDesignEntries(/^ADDDIALOGELEMENT:([0-9]+);([1-9]+);/gm, text, textDocument));
	diagnostics.push(...CDesignParser.CheckDuplicateDesignEntriesSingle(/^ADDDIALOGINFO:([0-9]+);/gm, text, textDocument));
	
	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		let completionItems :CompletionItem[] = [];
		let completionText = [
			"CHANGEDIALOGELEMENT",
			"ADDDIALOGINFO",
			"CHANGEDIALOG",
			"ADDDIALOGELEMENT",
			"PAGE=",
			"XPOS=",
			"YPOS=",
			"WIDTH=",
			"HEIGHT=",
			"NAMEPOSITION",
			"NEXTTABPOS=",
			"TYPE=",
			"VISIBLE=",
			"READONLY=",
			"NAME=",
			"PARAMETER1=",
			"PARAMETER2=",
			"PARAMETER3=",
			"PARAMETER4=",
			"PARAMETER5=",
			"PARAMETER6=",
			"PARAMETER7=",
			"PARAMETER8=",
			"PARAMETER9=",
			"SCRIPTNEW=",
			"DIRECTORY=",
			"SCRIPTS=",
			"DIRECTORY=",
			"COPYIMPORT=",
			"ALL_EXCEPT:",
			"TABLELINK="
		]

		completionText.forEach((text) => {
			completionItems.push({
				label: text,
				kind: CompletionItemKind.Keyword
			})
		})

		return completionItems;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

connection.onSignatureHelp((params, token, workdoen, resultProgress) => {
	return {
		signatures: [{
			label: "HALLO",
			activeParameter: 0,
			documentation: {
				kind: MarkupKind.Markdown,
				value: "`Ich bin ein test` hallo"
			}
		}],
		activeSignature: 0,
		activeParameter: 0
	}
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
