import { TextDocument } from 'vscode';

function escape_HTML(html_str :string) {
	var encodedStr = html_str.replace(/[\u00A0-\u9999<>\&\"]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	 });
	 return encodedStr;
}

export class CDesignWebConstructor {
	constructor() {

	}

	static CreateElements(text :TextDocument, tablenumber :string, page:string) {
		let i = 0;
		let html_text = "";
		let css_text = "";
		const xFactor = (150/30);
		const widthFactor = (150/30);
		const yFactor = (1080/28);

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
				
				let regName = /NAME=([a-zA-Z öäüÖÄÜß0-9()/\\%]+);?/gm;
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
					let xpos :string|number = (parseFloat(m[1]) * xFactor);
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
							xposlabel += 20;
							xposlabel = "" + xposlabel + "px";
						}
						xposTextlabel -= (9 + (7 * name.length));
						xposTextlabel = xposTextlabel + "px";
						xpos = "" + xpos + "px";
					}
					let ypos = "" + (parseFloat(mY[1]) * yFactor);
					if(mY[1].search("%") >= 0) {
						ypos = mY[1]; 
					} else {
						ypos = "" + ypos + "px";
					}
					if(mY[1].charAt(mY[1].length - 1) == "B") {
						ypos = (parseFloat(mY[1].substring(0, mY[1].length - 1)) * 100)  + "%";
					}
					
					let width :string|number = (parseFloat(mWidth[1]) * xFactor);
					if(mWidth[1].search("%") >= 0) {
						width = mWidth[1];
					} else {
						width = "" + width + "px";
					}

					if(mWidth[1].charAt(mWidth[1].length - 1) == "B") {
						width = (parseFloat(mWidth[1].substring(0, mWidth[1].length - 1)) * 100)  + "%";
					}
					
					let height :string|number = (parseFloat(mHeight[1]) * (20/1.2));
					height--;
					if(mHeight[1].search("%") >= 0) {
						height = mHeight[1];
					} else {
						height = "" + height + "px";
					}
					if(mHeight[1].charAt(mHeight[1].length - 1) == "B") {
						height = (parseFloat(mHeight[1].substring(0, mHeight[1].length - 1)) * 100)  + "%";
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

					if(parseInt(mType[1]) == 15) {
						let html_text = `<div onClick="showElementDialog(event)" 
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
						class="Testungen" ${styleCheckbox}
						id="${tablenumber+"-"+mColumn[1]}"
						><input type="checkbox">${name}</div>`;
						pages_text.set(mPage[1], pages_text.get(mPage[1]) + html_text);
					} else if(parseInt(mType[1]) == 4) {
						let html_text = `<div 
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
						class="Testungen" id="${tablenumber+"-"+mColumn[1]}" ${styleSeperator}>${name}</div>`;
						pages_text.set(mPage[1], pages_text.get(mPage[1]) + html_text);
					} else {
						let class_name = name.replace(" ", "");
						let html_text = `<div 
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
						class="Testungen ${class_name}" ${styleTextField} id="${tablenumber+"-"+mColumn[1]}">${name}</div>`;

						let newHtml = pages_text.get(mPage[1]) + html_text;
						pages_text.set(mPage[1], newHtml);
					}
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