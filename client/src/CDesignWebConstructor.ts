import { isBuffer } from 'util';
import { TextDocument } from 'vscode';


class DlgElement {
	m_Type :string;
	m_Name :string;
	m_Xpos :string;
	m_YPos :string;
	m_Visible :string;
	m_Readonly :string;
	m_NextTabPos :string;
	m_Page :string;
	m_NamePosition :string;
	m_Height :string;
	m_Width :string;
	m_Column :string;
	m_Table :string;
	m_OnChange :string;

	constructor(Type :string,
				Name :string,
				Xpos :string,
				YPos :string,
				Visible :string,
				Readonly :string,
				NextTabPos :string,
				Page :string,
				NamePosition :string,
				Height :string,
				Width :string,
				Column :string,
				Table :string,
				OnChange :string) {
		this.m_Type = Type;
		this.m_Name = Name;
		this.m_Xpos = Xpos;
		this.m_YPos = YPos;
		this.m_Visible = Visible;
		this.m_Readonly = Readonly;
		this.m_NextTabPos = NextTabPos;
		this.m_Page = Page;
		this.m_NamePosition = NamePosition;
		this.m_Height = Height;
		this.m_Width = Width;
		this.m_Column = Column;
		this.m_Table = Table;
		this.m_OnChange = OnChange;
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
			if(new_element.m_Visible.length > 0) {
				this.m_Visible = new_element.m_Visible;
			}
			if(new_element.m_Readonly.length > 0) {
				this.m_Readonly = new_element.m_Readonly;
			}
			if(new_element.m_NextTabPos.length > 0) {
				this.m_NextTabPos = new_element.m_NextTabPos;
			}
			if(new_element.m_Height.length > 0) {
				this.m_Height = new_element.m_Height;
			}
			if(new_element.m_Width.length > 0) {
				this.m_Width = new_element.m_Width;
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
		}
	}
}

function escape_HTML(html_str :string) {
	var encodedStr = html_str.replace(/[\u00A0-\u9999<>\&\"]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });
	 return encodedStr;
}

export class CDesign {
	public static get xfactor() { return (150/30); }
	public static get yfactor() { return 40; }
	public static get heightfactor() { return 20; }

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

	static CreateElements(text :TextDocument, tablenumber :string, page:string) {
		let i = 0;
		let html_text = "";
		let css_text = "";

		let pages_text :Map<string, string> = new Map();
		let dlgElementsMap :Map<string, DlgElement> = new Map();

		let search = ["ADDDIALOGELEMENT:", "CHANGEDIALOGELEMENT:"];
		for(let index = 0; index < search.length; index++) {
			i = 0;
			while(i < text.lineCount) {
				let linetext = text.lineAt(i);

				if(linetext.text.search(search[index] + tablenumber) >= 0) {
					let reg = /XPOS=([0-9.%B]+);/gm;
					let m = reg.exec(linetext.text);
	
					let regY = /YPOS=([0-9.%B]+);/gm;
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
					
					let regName = /NAME=([a-zA-Z öäüÖÄÜß0-9()\/\\%\.\-\<\>]+);/gm;
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
	
					if(m && mY && mPage && mHidden && mWidth && mType && mHeight && mColumn) {
						let futuretobrowser = CDesign.ToRightFormat("FromFutureToBrowserFormat");
						
						let xpos :string|number = futuretobrowser(parseFloat(m[1]), CDesign.xfactor);
	
						let xposlabel :string|number = xpos;
						let xposTextlabel :string|number = xpos;
	
						let name = "";
						let elementName = "";
						if(mName && mName[1]) {
							name = "" + mName[1] + mColumn[1];
							elementName = mName[1];
						}
	
						if(m[1].search("%") >= 0) {
							xpos = m[1]; 
							xposlabel = m[1]; 
							xposTextlabel = m[1];
						} else {
							if(parseInt(mType[1]) == 15) {
								xposlabel = parseFloat(xposlabel) + 20;
								xposlabel = "" + xposlabel + "px";
							}
							xposTextlabel = parseFloat(xposTextlabel) - (9 + (7 * name.length));
							xposTextlabel = xposTextlabel + "px";
							xpos = "" + xpos + "px";
						}
						let ypos :string|number = futuretobrowser(parseFloat(mY[1]), CDesign.yfactor);
						if(mY[1].search("%") >= 0) {
							ypos = mY[1]; 
						} else {
							ypos = "" + ypos + "px";
						}
						if(mY[1].charAt(mY[1].length - 1) == "B") {
							ypos = (parseFloat(mY[1].substring(0, mY[1].length - 1)) * 100)  + "vw";
						}
						
						let width :string|number = futuretobrowser(parseFloat(mWidth[1]), CDesign.xfactor);
						if(mWidth[1].search("%") >= 0) {
							width = mWidth[1];
						} else {
							width = "" + width + "px";
						}
	
						if(mWidth[1].charAt(mWidth[1].length - 1) == "B") {
							if(mWidth[1].substring(0, mWidth[1].length - 1) != "0") {
								width = (parseFloat(mWidth[1].substring(0, mWidth[1].length - 1)) * 100)  + "vw";
							} else {
								width = "100vw";
							}
						}
						
						let height :string|number = futuretobrowser(parseFloat(mHeight[1]), CDesign.heightfactor);
						//height--;
						if(mHeight[1].search("%") >= 0) {
							height = mHeight[1];
						} else {
							height = "" + height + "px";
						}
						if(mHeight[1].charAt(mHeight[1].length - 1) == "B") {
							height = (parseFloat(mHeight[1].substring(0, mHeight[1].length - 1)) * 100)  + "vw";
						}
						/*
							x:0 - y:0 -> x:0 - y:0
							x:307 - y:21.5 -> x:1920 - y:1080
							y:1 == 50,23
							x:1 == 6,25
	
							${"x:" + xpos + " y:" + ypos}
						*/
		
						let newElement = new DlgElement(mType[1], elementName, xpos, ypos, mHidden[1], mREADONLY, mNEXTTABPOS, mPage[1], mNameposition, height, width, mColumn[1], tablenumber, onchangeText);
						let key = tablenumber+"-"+mColumn[1] + elementName;
						if(dlgElementsMap.has(key)) {
							dlgElementsMap.get(key).updateElement(newElement);
						} else {
							dlgElementsMap.set(key, newElement);
						}
					}
				}
				i++;
			}
		}

		dlgElementsMap.forEach((element, key) => {	
			let styleTextField = `style="cursor:pointer; resize:none; background-color: <BACKGROUNDCOLOR>; height: ${element.m_Height}; top: ${element.m_YPos}; left: ${element.m_Xpos}; width: ${element.m_Width}; position: absolute; border: 1px solid #7a7a7a; opacity: <OPACITY>;"`;
			let styleCheckboxDiv = `style="cursor:pointer; top: ${element.m_YPos}; left: ${element.m_Xpos}; position: absolute; opacity: <OPACITY>;"`;
			let styleCheckbox = `style="cursor:pointer; background-color: <BACKGROUNDCOLOR>;"`;
			let styleSeperator = `style="cursor:pointer; top: ${element.m_YPos}; left: ${element.m_Xpos}; width: ${element.m_Width}; height: 0px; position: absolute; border: 1px solid black; opacity: <OPACITY>;"`;
			
			if(element.m_Visible == "0") {
				styleTextField = styleTextField.replace("<OPACITY>", "0.5");
				styleCheckbox = styleCheckbox.replace("<OPACITY>", "0.5");
				styleCheckboxDiv = styleCheckboxDiv.replace("<OPACITY>", "0.5");
				styleSeperator = styleSeperator.replace("<OPACITY>", "0.5");
			}
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


			let html_text = "";
			if(parseInt(element.m_Type) == 15) {
				html_text = `<div 
					${styleCheckboxDiv}
					DATA_TO_SET_IN_ELEMENT
					>
					<input class="text_of_element" type="checkbox">${element.m_Name}
				</div>`;
				
			} else if(parseInt(element.m_Type) == 4) {
				html_text = `<div ${styleSeperator}
					DATA_TO_SET_IN_ELEMENT>
					<div class="text_of_element">${element.m_Name}</div>
				</div>`;


			} else {
				html_text = `<div ${styleTextField} 
					DATA_TO_SET_IN_ELEMENT>
					<div class="text_of_element">${element.m_Name}</div>
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
				data-height="${element.m_Height}" 
				data-width="${element.m_Width}" 
				class="Testungen" id="${tablenumber+"-"+element.m_Column}"
			`);

			let newHtml = pages_text.get(element.m_Page) + html_text;
			pages_text.set(element.m_Page, newHtml);

		})
		
		let button_html = "";
		i = 0;

		let aktiveKey = -1;
		pages_text.forEach((val, key) => {
			button_html += `<button style="top: -22px; position: absolute; left: ${((i + 1) * 25)}px" class="w3-bar-item w3-button" onclick="openCity('${key}')">${key}</button>`
			html_text = html_text + `<div id="${key}" class="w3-container city"`
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

		button_html = `<div class="w3-bar w3-black">` + button_html + `</div>`;
		
		
		// 
		// 
		// <div id="Paris" class="w3-container city" style="display:none">
		// </div>
		// <div id="Tokyo" class="w3-container city" style="display:none">
		// </div>
		html_text += button_html;

		html_text += `
		<script>
		var activeIndex = ${aktiveKey};
		function openCity(cityName) {
		  var i;
		  var x = document.getElementsByClassName("city");
		  for (i = 0; i < x.length; i++) {
			x[i].style.display = "none";  
		  }
		  activeIndex = cityName;
		  document.getElementById(cityName).style.display = "block";

		  let v = document.querySelectorAll(".Testungen");
		  v.forEach(value => {
			let temp = value.style.width;
			value.style.width = "10000px";

			if(value.getAttribute("data-nameposition") == 1) {
				value.children[0].style.left = "0px";
				value.children[0].style.position = "relative";
				value.children[0].style.top = "-20px";
			} else {
				if(value.children && value.children[0] && value.children[0].innerHTML && value.children[0].innerHTML.length > 0) {
					value.children[0].style.width = "fit-content";
					value.children[0].style.left = "-" + (value.children[0].offsetWidth + 5) + "px";
					value.children[0].style.width = "" + (value.children[0].offsetWidth + 5) + "px";
					value.children[0].style.position = "relative";
				}
			}
			value.style.width = temp;
		  });
		}
		openCity(activeIndex);
		openCity(activeIndex);
		</script>
		`;
		return {
			html: html_text,
			css: css_text
		};
	}
}