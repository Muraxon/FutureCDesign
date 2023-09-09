import { isBuffer } from 'util';
import { TextDocument, TextLine, window, workspace } from 'vscode';
import { doc } from './test/helper';


class DlgElement {
	m_Type :string;
	m_Name :string;
	m_Xpos :string;
	m_XposFuture :string;
	m_YPos :string;
	m_YPosFuture :string;
	m_Visible :string;
	m_Readonly :string;
	m_NextTabPos :string;
	m_Page :string;
	m_NamePosition :string;
	m_FutureHeight :string;
	m_BrowserHeight :string;
	m_FutureWidth :string;
	m_BrowserWidth :string;
	m_Column :string;
	m_Table :string;
	m_OnChange :string;
	m_Module1 :string;
	m_Module2 :string;

	constructor(Type :string,
				Name :string,
				Xpos :string,
				XposFuture :string,
				YPos :string,
				YPosFuture :string,
				Visible :string,
				Readonly :string,
				NextTabPos :string,
				Page :string,
				NamePosition :string,
				FutureHeight :string,
				BrowserHeight :string,
				FutureWidth :string,
				BrowserWidth :string,
				Column :string,
				Table :string,
				OnChange :string,
				module1 :string,
				module2 :string) {
		this.m_Type = Type;
		this.m_Name = Name;
		this.m_Xpos = Xpos;
		this.m_XposFuture = XposFuture;
		this.m_YPos = YPos;
		this.m_YPosFuture = YPosFuture;
		this.m_Visible = Visible;
		this.m_Readonly = Readonly;
		this.m_NextTabPos = NextTabPos;
		this.m_Page = Page;
		this.m_NamePosition = NamePosition;
		this.m_FutureHeight = FutureHeight;
		this.m_BrowserHeight = BrowserHeight;
		this.m_FutureWidth = FutureWidth;
		this.m_BrowserWidth = BrowserWidth;
		this.m_Column = Column;
		this.m_Table = Table;
		this.m_OnChange = OnChange;
		this.m_Module1 = module1;
		this.m_Module2 = module2;
	}

	public updateElement(new_element :DlgElement) {
		if(this.m_Table == new_element.m_Table && this.m_Column == new_element.m_Column) {
			if(new_element.m_Type.length > 0) {
				this.m_Type = new_element.m_Type;
			}
			if(new_element.m_Name.length > 0) {
				this.m_Name = new_element.m_Name;
			}
			if(new_element.m_Xpos.length > 0) {
				this.m_Xpos = new_element.m_Xpos;
			}
			if(new_element.m_YPos.length > 0) {
				this.m_YPos = new_element.m_YPos;
			}
			if(new_element.m_XposFuture.length > 0) {
				this.m_XposFuture = new_element.m_XposFuture;
			}
			if(new_element.m_YPosFuture.length > 0) {
				this.m_YPosFuture = new_element.m_YPosFuture;
			}

			if(new_element.m_Visible.length > 0) {
				this.m_Visible = new_element.m_Visible;
			}
			if(new_element.m_Readonly.length > 0) {
				this.m_Readonly = new_element.m_Readonly;
			}
			if(new_element.m_NextTabPos.length > 0) {
				this.m_NextTabPos = new_element.m_NextTabPos;
			}
			if(new_element.m_Page.length > 0) {
				this.m_Page = new_element.m_Page;
			}
			if(new_element.m_NamePosition.length > 0) {
				this.m_NamePosition = new_element.m_NamePosition;
			}
			if(new_element.m_FutureHeight.length > 0) {
				this.m_FutureHeight = new_element.m_FutureHeight;
			}
			if(new_element.m_BrowserHeight.length > 0) {
				this.m_BrowserHeight = new_element.m_BrowserHeight;
			}
			if(new_element.m_FutureWidth.length > 0) {
				this.m_FutureWidth = new_element.m_FutureWidth;
			}
			if(new_element.m_BrowserWidth.length > 0) {
				this.m_BrowserWidth = new_element.m_BrowserWidth;
			}
			if(new_element.m_Column.length > 0) {
				this.m_Column = new_element.m_Column;
			}
			if(new_element.m_Table.length > 0) {
				this.m_Table = new_element.m_Table;
			}
			if(new_element.m_OnChange.length > 0) {
				this.m_OnChange = new_element.m_OnChange;
			}
			this.m_Module1 = new_element.m_Module1;
			this.m_Module2 = new_element.m_Module2;
		}
	}

	isModuleActive(module_list :string[]) {
		if(this.m_Name == "Art des Geschäfts (Intrastat)") {
			console.log(")");
		}
		let moduleFound1 = true;
		let moduleFound2 = true;
		if(this.m_Module1.length > 0 && this.m_Module2.length > 0) {
			moduleFound1 = (module_list.indexOf(this.m_Module1) >= 0);
			moduleFound2 = (module_list.indexOf(this.m_Module2) >= 0);
		}
		if(this.m_Module1.length > 0 && this.m_Module2.length <= 0) {
			moduleFound1 = (module_list.indexOf(this.m_Module1) >= 0);
			moduleFound2 = false;
		}

		if(this.m_Module1.length <= 0 && this.m_Module2.length > 0) {
			moduleFound1 = false;
			moduleFound2 = (module_list.indexOf(this.m_Module2) >= 0);
		}
		
		return moduleFound1 || moduleFound2;
	}
}

function escape_HTML(html_str :string) {
	var encodedStr = html_str.replace(/[\u00A0-\u9999<>\&\"]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });
	 return encodedStr;
}

export class CDesign {
	public static get xfactor() { return (145/29); }
	public static get yfactor() { return 40; }
	public static get heightfactor() { return 23/1.2; }

	constructor() {

	}

	static GetOnChangeStartAndEnd(value :string, start :number) {
		let tempindexStart = start + value.length;
		let indexEnd = tempindexStart;
		let endofLine = value.indexOf("\n", 1);

		let isInString = false;
		indexEnd = start;
		while(indexEnd < endofLine) {
			let char = value.charAt(indexEnd);
			if(char == "\"") {
				isInString = !isInString;
			}
			if(isInString) {
				indexEnd++;
				continue;
			}
			if(char == ";") {
				break;
			}
			indexEnd++;
		}

		return {
			end: indexEnd,
			start: tempindexStart
		}
	}

	static ToRightFormat(format : "FromFutureToBrowserFormat" | "FromBrowserToFutureFormat") {
		if(format === "FromFutureToBrowserFormat") {
			return (number :number, factor :number) => (number * factor).toString();
		} else {
			return (number :number, factor :number) => (number / factor).toFixed(1);
		}
	}

	static FromFutureToBrowserFormat() {

	}

	static FromBrowserToFutureFormat(type :string, value :string) {

		let toCorrectFormat = CDesign.ToRightFormat("FromBrowserToFutureFormat");

		if(type == "ONCHANGE=") {
			if(value.indexOf("\"") != 0) {
				value = "\"" + value + "\"";
			}

		} else if(type == "XPOS=") {
			value = "" + toCorrectFormat(parseFloat(value), CDesign.xfactor);
		} else if(type == "YPOS=") {
			value = "" + toCorrectFormat(parseFloat(value), CDesign.yfactor);
		} else if(type == "WIDTH=") {
			value = "" + toCorrectFormat(parseFloat(value), CDesign.xfactor);
		} else if(type == "HEIGHT=") {
			value = "" + toCorrectFormat(parseFloat(value), CDesign.heightfactor);
		}
		return value;
	}

	static CreateElements(docs :TextDocument[], tablenumber :string, page:string, module :string[]) {
		let i = 0;
		let html_text = "";
		let css_text = "";

		let pages_text :Map<string, string> = new Map();
		let dlgElementsMap :Map<string, DlgElement> = new Map();

		let search = ["ADDDIALOGELEMENT:", "CHANGEDIALOGELEMENT:"];
		let prevKey = "";

		for(let doc_idx = 0; doc_idx < docs.length; doc_idx++) {
			let importAttributesFile = docs[doc_idx].fileName.indexOf("importattributes") >= 0;
			if(!importAttributesFile) {
				for(let index = 0; index < search.length; index++) {
					i = 0;
					while(i < docs[doc_idx].lineCount) {
						let linetext = docs[doc_idx].lineAt(i);


						if(linetext.text.search(search[index] + tablenumber) >= 0) {
							let reg = /XPOS=([0-9.%B+-]+);/gm;
							let m = reg.exec(linetext.text);
			
							let regY = /YPOS=([0-9.%B+-]+);/gm;
							let mY = regY.exec(linetext.text);
			
							let regPage = new RegExp("PAGE=([0-9]+)", "gm");
							let mPage = regPage.exec(linetext.text);
							
							if(mPage) {
								if(!pages_text.has(mPage[1])) {
									pages_text.set(mPage[1], "");
								}
							}
			
							let regHidden = /VISIBLE=(1|0)/gm;
							let mHidden = regHidden.exec(linetext.text);
							
							let regName = /NAME=([a-zA-Z öäüÖÄÜß0-9€()\/\\%\.\-\<\>]+);/gm;
							let mName = regName.exec(linetext.text);
							
							let regWidth = /WIDTH=([0-9.%B]+);/gm;
							let mWidth = regWidth.exec(linetext.text);
			
							let regType = /TYPE=([0-9]+);/gm;
							let mType = regType.exec(linetext.text);
							
							let regHeight = /HEIGHT=([0-9.%B]+);/gm;
							let mHeight = regHeight.exec(linetext.text);
							
							let regOnchangeCompleteScript = /ONCHANGECOMPLETESCRIPT=([0-9]+);/gm;
							let mOnchangeCompleteScript = regOnchangeCompleteScript.exec(linetext.text);
							
							let regNameposition = /NAMEPOSITION=([0-9]+);?/gm;
							let mNameposition : RegExpExecArray|string = regNameposition.exec(linetext.text);
							if(mNameposition) {
								mNameposition = mNameposition[1];
							} else {
								mNameposition = "";
							}
							
							let regNEXTTABPOS = /NEXTTABPOS=([0-9]+);?/gm;
							let mNEXTTABPOS : RegExpExecArray|string = regNEXTTABPOS.exec(linetext.text);
							if(mNEXTTABPOS) {
								mNEXTTABPOS = mNEXTTABPOS[1];
							} else {
								mNEXTTABPOS = "";
							}
							
							let regREADONLY = /READONLY=([0-9]+);?/gm;
							let mREADONLY : RegExpExecArray|string = regREADONLY.exec(linetext.text);
							if(mREADONLY) {
								mREADONLY = mREADONLY[1];
							} else {
								mREADONLY = "";
							}
							
	
							let regColumn = new RegExp(":" + tablenumber + ";([0-9]+);", "gm");
							let mColumn = regColumn.exec(linetext.text);
							if(mColumn && mColumn[1] && mColumn[1] == "0") {
								let regNameWithoutColumn = new RegExp(":" + tablenumber + ";[0-9]+;([a-zA-Z öäüÖÄÜß0-9€()\/\\%\.\-\<\>]+);", "gm");
								let mNameWithoutColumn = regNameWithoutColumn.exec(linetext.text);
								if(mNameWithoutColumn && mNameWithoutColumn[1]) {
									mName = mNameWithoutColumn;
								}
							}
			
							let onchangeOffset = linetext.text.indexOf("ONCHANGE=");
							let onchangeText = "";
							if(onchangeOffset >= 0) {
								onchangeOffset += 9;
								let startOnChange = onchangeOffset;
								let isInString = false;
								while(onchangeOffset < linetext.text.length) {
									let char = linetext.text.charAt(onchangeOffset);
									if(char == "\"") {
										isInString = !isInString;
									}
									if(isInString) {
										onchangeOffset++;
										continue;
									}
									if(char == ";") {
										break;
									}
									onchangeOffset++;
								}
			
								onchangeText = linetext.text.substring(startOnChange, onchangeOffset);
							}
			
	
							// m && mColumn && moduleFound && mY && mPage && mHidden && mWidth && mType && mHeight &&
							let name = "";
							let elementName = "";
							if(mName && mName[1]) {
								name = "" + mName[1] + mColumn[1];
								elementName = mName[1];
							}
		
							let key = tablenumber+"-"+mColumn[1];
							if(mColumn[1] == "0") {
								key += "-" + elementName;
							}
							let oldElement : null | DlgElement = null;
							if(dlgElementsMap.has(key)) {
								oldElement = dlgElementsMap.get(key);
							}
							console.log(key);
							if(key == "150-75") {
								console.log("TEST");
							}
							let mModule1 = CDesign.MatchModule("1",linetext);
							let mModule2 = CDesign.MatchModule("2",linetext);

							let futuretobrowser = CDesign.ToRightFormat("FromFutureToBrowserFormat");
							let heightFuture = CDesign.getSetValue(mHeight, oldElement?.m_FutureHeight, "1.2");
							let widthFuture = CDesign.getSetValue(mWidth, oldElement?.m_FutureWidth, "29");
	
							let xposFuture = CDesign.getSetValue(m, oldElement?.m_XposFuture, "0");
							let yposFuture = CDesign.getSetValue(mY, oldElement?.m_YPosFuture, "0");
	
							let typeFuture = CDesign.getSetValue(mType, oldElement?.m_Type, "1");
							let visibleFuture =  CDesign.getSetValue(mHidden, oldElement?.m_Visible, "1");
							let pageFuture = CDesign.getSetValue(mPage, oldElement?.m_Page, "1");
							let module1Future = CDesign.getSetValue(mModule1, oldElement?.m_Module1, "");
							let module2Future = CDesign.getSetValue(mModule2, oldElement?.m_Module2, "");
	
							if(xposFuture.charAt(0) == "+") {
								let prevElement = dlgElementsMap.has(prevKey) ? dlgElementsMap.get(prevKey) : null;
								if(prevElement) {
									xposFuture = "" + (parseFloat(prevElement.m_XposFuture) + parseFloat(prevElement.m_FutureWidth) + parseFloat(xposFuture.substring(1)));
									if(prevElement.m_FutureWidth.charAt(prevElement.m_FutureWidth.length - 1) == "%") {
										xposFuture += "%";
									}
								}
							}
							
							if(yposFuture.charAt(0) == "+") {
								let prevElement = dlgElementsMap.has(prevKey) ? dlgElementsMap.get(prevKey) : null;
								if(prevElement) {
									yposFuture = "" + (parseFloat(prevElement.m_YPosFuture) + parseFloat(prevElement.m_FutureHeight) + parseFloat(yposFuture.substring(1)));
	
									if(prevElement.m_FutureHeight.charAt(prevElement.m_FutureHeight.length - 1) == "%") {
										yposFuture += "%";
									}
								}
							}
	
	
	
	
							let xpos :string = futuretobrowser(parseFloat(xposFuture), CDesign.xfactor);
		
							let xposlabel :string|number = xpos;
							let xposTextlabel :string|number = xpos;
		
		
							if(xposFuture.search("%") >= 0) {
								xpos = xposFuture; 
								xposlabel = xposFuture; 
								xposTextlabel = xposFuture;
							} else {
								if(parseInt(typeFuture) == 15) {
									xposlabel = parseFloat(xposlabel) + 20;
									xposlabel = "" + xposlabel + "px";
								}
								xposTextlabel = parseFloat(xposTextlabel) - (9 + (7 * name.length));
								xposTextlabel = xposTextlabel + "px";
								xpos = "" + xpos + "px";
							}
	
	
							let ypos :string = futuretobrowser(parseFloat(yposFuture), CDesign.yfactor);
							if(yposFuture.search("%") >= 0) {
								ypos = yposFuture; 
							} else {
								ypos = "" + ypos + "px";
							}
							if(yposFuture.charAt(yposFuture.length - 1) == "B") {
								if(yposFuture.substring(0, yposFuture.length - 1) != "0" && yposFuture.substring(0, yposFuture.length - 1) != "1") {
									ypos = ((100 - parseFloat(yposFuture.substring(0, yposFuture.length - 1)) * 10))  + "vw";
								} else {
									ypos = "97vw";
								}
							}
							
							let width :string = futuretobrowser(parseFloat(widthFuture), CDesign.xfactor);
							if(widthFuture.search("%") >= 0) {
								width = widthFuture;
							} else {
								width = "" + width + "px";
							}
		
							if(widthFuture.charAt(widthFuture.length - 1) == "B") {
								if(widthFuture.substring(0, widthFuture.length - 1) != "0" && widthFuture.substring(0, widthFuture.length - 1) != "1") {
									width = (parseFloat(widthFuture.substring(0, widthFuture.length - 1)) * 10)  + "vw";
								} else {
									width = "97vw";
								}
							}
							
							let height :string = futuretobrowser(parseFloat(heightFuture), CDesign.heightfactor);
							//height--;
							if(heightFuture.search("%") >= 0) {
								height = heightFuture;
							} else {
								height = "" + height + "px";
							}
							if(heightFuture.charAt(heightFuture.length - 1) == "B") {
								if(heightFuture.substring(0, heightFuture.length - 1) != "0" && heightFuture.substring(0, heightFuture.length - 1) != "1") {
									height = (parseFloat(heightFuture.substring(0, heightFuture.length - 1)) * 10)  + "vw";
								} else {
									height = "97vw";
								}
							}
	
	
							
							/*
								x:0 - y:0 -> x:0 - y:0
								x:307 - y:21.5 -> x:1920 - y:1080
								y:1 == 50,23
								x:1 == 6,25
		
								${"x:" + xpos + " y:" + ypos}
							*/
	
							
							let newElement = new DlgElement(typeFuture, elementName, xpos, xposFuture, ypos, yposFuture, visibleFuture, mREADONLY, mNEXTTABPOS, pageFuture, mNameposition, heightFuture, height, widthFuture, width, mColumn[1], tablenumber, onchangeText, module1Future, module2Future);
							if(dlgElementsMap.has(key)) {
								dlgElementsMap.get(key).updateElement(newElement);
							} else {
								dlgElementsMap.set(key, newElement);
							}
							prevKey = key;
						}
						i++;
					}
				}
			} else {

				i = 0;
				while(i < docs[doc_idx].lineCount) {
					let linetext = docs[doc_idx].lineAt(i);	

					let regTableColumn = new RegExp("^" + tablenumber + "\t([0-9]+)\t[0-9]+\t", "gm");

					let mColumn = regTableColumn.exec(linetext.text);
					if(mColumn) {

						let key = tablenumber+"-"+mColumn[1];
						let element : null | DlgElement = null;
						if(dlgElementsMap.has(key)) {
							element = dlgElementsMap.get(key);
						} else {
							if(key == "150-75") {
								console.log(key);
							}
							let regModule1 = CDesign.MatchModule("1", linetext);
							let module1 = "";
							if(regModule1 && regModule1[1]) {
								module1 = regModule1[1];
							}
							let regModule2 = CDesign.MatchModule("2", linetext);
							let module2 = "";
							if(regModule2 && regModule2[1]) {
								module2 = regModule2[1];
							}


							element = new DlgElement("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", mColumn[1], tablenumber, "", module1, module2);
							dlgElementsMap.set(key, element);
						}
						
					}

					i++;
				}
			}
		}

		dlgElementsMap.forEach((element, key) => {	

			let styleTextField = `style="cursor:pointer; resize:none; background-color: <BACKGROUNDCOLOR>; height: ${element.m_BrowserHeight}; top: ${element.m_YPos}; left: ${element.m_Xpos}; width: ${element.m_BrowserWidth}; position: absolute;"`;
			let styleCheckboxDiv = `style="cursor:pointer; top: ${element.m_YPos}; left: ${element.m_Xpos}; position: absolute;"`;
			let styleCheckbox = `style="cursor:pointer; background-color: <BACKGROUNDCOLOR>;"`;
			let styleSeperator = `style="cursor:pointer; top: ${element.m_YPos}; left: ${element.m_Xpos}; width: ${element.m_BrowserWidth}; height: 0px; position: absolute; border: 1px solid black;"`;
			
			if(element.m_Readonly == "1") {
				styleTextField = styleTextField.replace("<BACKGROUNDCOLOR>", "black");
				styleCheckbox = styleCheckbox.replace("<BACKGROUNDCOLOR>", "black");
				styleCheckboxDiv = styleCheckboxDiv.replace("<BACKGROUNDCOLOR>", "black");
				styleSeperator = styleSeperator.replace("<BACKGROUNDCOLOR>", "black");
			} else {
				styleTextField = styleTextField.replace("<BACKGROUNDCOLOR>", "white");
				styleCheckbox = styleCheckbox.replace("<BACKGROUNDCOLOR>", "white");
				styleCheckboxDiv = styleCheckboxDiv.replace("<BACKGROUNDCOLOR>", "white");
				styleSeperator = styleSeperator.replace("<BACKGROUNDCOLOR>", "white");
			}

			let visible_class = `class="UI_VISIBLE Draggable"`;
			if(element.m_Visible == "0") {
				visible_class = `class="UI_INVISIBLE Draggable"`;
			}


			let html_text = "";
			let element_type = parseInt(element.m_Type);
			if(element_type == 15) {
				html_text = `<div 
					${styleCheckboxDiv}
					${visible_class}
					DATA_TO_SET_IN_ELEMENT
					>
					<input class=" text_of_element" style="float: left !important;" type="checkbox">${element.m_Name}
				</div>`;
				
			} else if(element_type == 4) {
				html_text = `<div ${styleSeperator}
					 ${visible_class}
					DATA_TO_SET_IN_ELEMENT>
					<div class=" text_of_element">${element.m_Name}</div>
				</div>`;


			} else {

				let fieldPNG = "";
				let table_html = "";

				if(element_type == 70 || element_type == 81 || element_type == 31) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/DropDownDesigner.png" alt="">`
				} else if(element_type == 72) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/LinkSearchDesigner.png" alt="">`
				} else if(element_type == 22) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/NumberElementDesigner.png" alt="">`
				} else if(element_type == 29) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/PercentElementDesigner.png" alt="">`
				} else if(element_type == 28) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/DateTimeElementDesigner.png" alt="">`
				} else if(element_type == 25) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/DateElementDesigner.png" alt="">`
				} else if(element_type == 24) {
					fieldPNG = `<img class="element_image" src="MEDIA_PATH/MoneyElementDesigner.png" alt="">`
				} else if(element_type == 45) {
					fieldPNG = `<img class="element_image_linked_table" src="MEDIA_PATH/LinkedTableElementDesigner.png" alt="">`
				}

				
				if(element_type == 45 || element_type == 42) {
					
				}

				html_text = `<div ${styleTextField} 
					${visible_class}
					DATA_TO_SET_IN_ELEMENT>
					<div class="text_of_element">${element.m_Name}</div>
					${table_html}
					${fieldPNG}
				</div>
				`;
			
			}

			html_text = html_text.replace("DATA_TO_SET_IN_ELEMENT", 
			`
				onClick="showElementDialog(event)"
				data-saved="1" 
				data-column="${element.m_Column}" 
				data-onchange="${escape_HTML(element.m_OnChange)}" 
				data-nexttab="${element.m_NextTabPos}" 
				data-page="${element.m_Page}" 
				data-type="${element.m_Type}" 
				data-nameposition="${element.m_NamePosition}" 
				data-visible="${element.m_Visible}" 
				data-readonly="${element.m_Readonly}" 
				data-name="${element.m_Name}" 
				data-height="${element.m_FutureHeight}" 
				data-width="${element.m_FutureWidth}" 
				id="${tablenumber+"-"+element.m_Column}"
			`);

			let moduleFound = element.isModuleActive(module);

			if(moduleFound && element.m_Type != "200" && element.m_Type != "1") {
				let newHtml = pages_text.get(element.m_Page) + html_text;
				pages_text.set(element.m_Page, newHtml);
			}
		})
		
		let button_html = "";
		i = 0;

		let aktiveKey = -1;
		pages_text.forEach((val, key) => {
			button_html += `<button style="top: -22px; position: absolute; left: ${((parseInt(key) + 1) * 25)}px" class="w3-bar-item w3-button" onclick="openOtherTab('${key}')">${key}</button>`
			html_text = html_text + `<div id="${key}" class="w3-container Tabs"`
			if((aktiveKey < 0) || (aktiveKey > 0 && aktiveKey > parseInt(key))) {
				aktiveKey = parseInt(key);
			}
			if(i > 0) {
				html_text = html_text + ` style="display:none"; >`
			} else {
				html_text = html_text + ` >`
			}
			
			html_text = html_text + val + `</div>`;
			i++;
		});

		button_html += `<div style="top: -22px; position: absolute; left: ${((i + 5) * 25)}px"><input type="checkbox" id="showHiddenElementsCheckbox"  class="w3-bar-item w3-button" onclick="showHiddenElements(this);">Versteckte Elemente anzeigen</div>`;
		button_html = `<div class="w3-bar w3-black">` + button_html + `</div>`;
		
		
		// 
		// 
		// <div id="Paris" class="w3-container Tabs" style="display:none">
		// </div>
		// <div id="Tokyo" class="w3-container Tabs" style="display:none">
		// </div>
		html_text += button_html;
		return {
			activeindex: aktiveKey,
			html: html_text,
			css: css_text
		};

	}

	private static getSetValue(reg :RegExpExecArray, element_value :string | null, default_return :string) :string {
		if(reg) {
			return reg[1]
		}
		if(element_value) {
			if(element_value.length > 0) {
				return element_value;
			}
		}

		return default_return;
	}

	private static MatchModule(ModuleIndex :string, linetext: TextLine) {

		let regModule1 = new RegExp(`MODULE${ModuleIndex}[=:]([0-9]*)`, "gm");
		let mModule1: RegExpExecArray | string = regModule1.exec(linetext.text);
		return mModule1
	}
}