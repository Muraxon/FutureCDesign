import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticRelatedInformation, DiagnosticSeverity, Location } from 'vscode-languageserver/node';

class Token {

}

export class CDesignParser {
	constructor() {

	}

	static parseText(doc :TextDocument) {
		let text = doc.getText();
		let pos = 0;
		let tokens :Token[] = [];

		while(pos < text.length) {
			let char = text.charAt(pos);
			if(char.match(/[\r\t\n ]/)) {
				
			}
		}
		return this.parseTokens(tokens);
	}

	static parseTokens(tokens :Token) {

	}

	static CheckDuplicateDesignEntries(regex :RegExp, text :string, textDocument :TextDocument) {
		let diagnostics :Diagnostic[] = [];
		let matches :Map<number, {number:number, index:number}[]> = new Map();
		while(true) {
			let m :RegExpExecArray|null = regex.exec(text);
			if(m) {
				let table = matches.get(parseInt(m[1]));
				if(table) {
					let relatedInfo :DiagnosticRelatedInformation[] = [];
					let vorhanden = false;
					for(let x = 0; x < table.length; x++) {
						if(table[x].number == parseInt(m[2])){
							vorhanden = true;
							relatedInfo.push({
								location: Location.create(textDocument.uri, {end: textDocument.positionAt(table[x].index), start: textDocument.positionAt(table[x].index)}),
								message: "Duplicate Entry detected. Make sure one entry for every column is available"
							});
						}
					}
					table.push({
						number:	parseInt(m[2]),
						index: m.index
					});
	
					if(vorhanden) {
						diagnostics.push({
							message: "Duplicate entry "+m[0]+" detected",
							range: {
								end: textDocument.positionAt(m.index),
								start: textDocument.positionAt(m.index)
							},
							relatedInformation: relatedInfo,
							severity: DiagnosticSeverity.Information
						})
					}
				} else {
					matches.set(parseInt(m[1]), [{
						number:	parseInt(m[2]),
						index: m.index
					}])
				}
			} else {
				break;
			}
		}
		return diagnostics;
	}

	static CheckDuplicateDesignEntriesSingle(regex :RegExp, text :string, textDocument :TextDocument) {
		let diagnostics :Diagnostic[] = [];
		let matches :{number:number,index:number}[] = [];
		while(true) {
			let m :RegExpExecArray|null = regex.exec(text);
			if(m) {
				let relatedInfo :DiagnosticRelatedInformation[] = [];
				let vorhanden = false;
				for(let x = 0; x < matches.length; x++) {
					if(matches[x].number == parseInt(m[1])){
						vorhanden = true;
						relatedInfo.push({
							location: Location.create(textDocument.uri, {end: textDocument.positionAt(matches[x].index), start: textDocument.positionAt(matches[x].index)}),
							message: "Duplicate Entry detected. Make sure one entry for every column is available"
						});
					}
				}
				matches.push({
					number:	parseInt(m[1]),
					index: m.index
				});

				if(vorhanden) {
					diagnostics.push({
						message: "Duplicate entry "+m[0]+" detected",
						range: {
							end: textDocument.positionAt(m.index),
							start: textDocument.positionAt(m.index)
						},
						relatedInformation: relatedInfo,
						severity: DiagnosticSeverity.Information
					})
				}
			} else {
				break;
			}
		}
		return diagnostics;
	}
}