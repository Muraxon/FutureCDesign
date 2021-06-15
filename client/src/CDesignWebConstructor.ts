import { TextDocument } from 'vscode';

function escape_HTML(html_str :string) {
	var encodedStr = html_str.replace(/[\u00A0-\u9999<>\&\"]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });
	 return encodedStr;
}

export class CDesign {
	public static get xfactor() { return (150/30); }
	public static get yfactor() { return 40; }

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
			value = "" + toCorrectFormat(parseFloat(value), CDesign.yfactor);
		}
		return value;
	}

	static CreateElements(text :TextDocument, tablenumber :string, page:string) {
		let i = 0;
		let html_text = "";
		let css_text = "";

		let pages_text :Map<string, string> = new Map();

		while(i < text.lineCount) {
			let linetext = text.lineAt(i);
			
			if(linetext.text.search("CHANGEDIALOGELEMENT:" + tablenumber) >= 0) {
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

				let regHidden = /VISIBLE=(1)/gm;
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
					//if(xpos % 5 == 4) { xpos = xpos + 1; }
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
					
					let width :string|number = (parseFloat(mWidth[1]) * CDesign.xfactor);
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
					
					let height :string|number = (parseFloat(mHeight[1]) * 20);
					height--;
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


					let styleTextField = `style="cursor:pointer; resize:none; background-color: white; height: ${height}; top: ${ypos}; left: ${xpos}; width: ${width}; position: absolute; border: 1px solid #7a7a7a;"`;
					let styleCheckbox = `style="cursor:pointer; top: ${ypos}; left: ${xpos}; position: absolute;"`;
					let styleSeperator = `style="cursor:pointer; top: ${ypos}; left: ${xpos}; width: ${width}; height: 0px; position: absolute; border: 1px solid black;"`;
					let styleLabelCheckbox = `style="cursor:pointer; top: ${ypos}; left: ${xposlabel}; width: 1000px; position: absolute;"`;
					let styleLabelTextfield = `style="cursor:pointer; top: ${ypos}; left: ${xposTextlabel}; position: absolute;"`;

					let html_text = "";
					if(parseInt(mType[1]) == 15) {
						html_text = `<div 
							${styleCheckbox}
							DATA_TO_SET_IN_ELEMENT
							>
							<input class="text_of_element" type="checkbox">${name}
						</div>`;
						
					} else if(parseInt(mType[1]) == 4) {
						html_text = `<div ${styleSeperator}
							DATA_TO_SET_IN_ELEMENT>
							<div class="text_of_element">${name}</div>
						</div>`;


					} else {
						html_text = `<div ${styleTextField} 
							DATA_TO_SET_IN_ELEMENT>
							<div class="text_of_element">${elementName}</div>
						</div>
						`;
					
					}
					html_text = html_text.replace("DATA_TO_SET_IN_ELEMENT", 
					`
						onClick="showElementDialog(event)"
						data-saved="1" 
						data-column="${mColumn[1]}" 
						data-onchange="${escape_HTML(onchangeText)}" 
						data-nexttab="${mNEXTTABPOS}" 
						data-page="${mPage[1]}" 
						data-type="${mType[1]}" 
						data-nameposition="${mNameposition}" 
						data-visible="${mHidden[1]}" 
						data-readonly="${mREADONLY}" 
						data-name="${elementName}" 
						class="Testungen" id="${tablenumber+"-"+mColumn[1]}"</div>
					`);

					let newHtml = pages_text.get(mPage[1]) + html_text;
					pages_text.set(mPage[1], newHtml);
				}
			}
			i++;
		}

		let button_html = "";
		i = 0;

		let aktiveKey = -1;
		pages_text.forEach((val, key) => {
			button_html += `<button style="top: -22px; position: absolute; left: ${((i + 1) * 25)}px" class="w3-bar-item w3-button" onclick="openCity('${key}')">${key}</button>`
			html_text = html_text + `<div id="${key}" class="w3-container city"`
			if(aktiveKey < 0) {
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
		}
		</script>
		`;
		return {
			html: html_text,
			css: css_text
		};
	}
}