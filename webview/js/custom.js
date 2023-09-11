// @ts-nocheck
import { dragmove } from './dragmove.js';

const xFactor = 5;
const yFactor = 40;
const heightFactor = 19.16666666;

const yfactorB = 40 / 1173;		// 1173
const heightfactorB = 20;


const vscode = acquireVsCodeApi();
let table = document.getElementById("tablenumber").content;
let activeIndex = document.getElementById("activeindex").content;

export function openOtherTab(newActiveIndex) {
  let i = 0;
  let x = document.getElementsByClassName("Tabs");
  for (i = 0; i < x.length; i++) {
	x[i].style.display = "none";  
  }
  activeIndex = newActiveIndex;
  document.getElementById(newActiveIndex).style.display = "block";

  let v = document.querySelectorAll(".Draggable");
  v.forEach(value => {
	let temp = value.style.width;
	value.style.width = "10000px";

	// if(value.getAttribute("data-ypos").indexOf("B") >= 0) {
	// 	let futureYPOS = value.getAttribute("data-ypos");
	// 	futureYPOS = parseFloat(futureYPOS.substring(0, futureYPOS.length - 1));
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	futureYPOS += parseFloat(value.getAttribute("data-height"));
	// 	futureYPOS = futureYPOS * (document.documentElement.clientHeight * yfactorB);
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	futureYPOS = document.documentElement.clientHeight - futureYPOS;
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	value.style.top = "" + futureYPOS + "px";
	// }
	// if(value.getAttribute("data-height").indexOf("B") >= 0) {
	// 	let futureYPOS = value.getAttribute("data-height");
	// 	futureYPOS = parseFloat(futureYPOS.substring(0, futureYPOS.length - 1));
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	futureYPOS = futureYPOS * (document.documentElement.clientHeight * yfactorB);
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	futureYPOS = document.documentElement.clientHeight - futureYPOS;
	// 	console.log(futureYPOS, document.documentElement.clientHeight);
	// 	value.style.height = "" + futureYPOS + "px";
	// }

	if((value.getAttribute("data-nameposition") == 1 && value.getAttribute("data-type") != 15) || value.getAttribute("data-type") == 45 || value.getAttribute("data-type") == 232) {
		value.children[0].style.left = "0px";
		value.children[0].style.position = "absolute";
		value.children[0].style.top = "-15px";
	} else {
		if(value.children) {
			let i = 0;



			while(value.children[i] && value.children[i].innerHTML && value.children[i].innerHTML.length > 0) {
				value.children[i].style.width = "fit-content";
				if(value.getAttribute("data-type") != 4) {
					value.children[i].style.left = "-" + (value.children[i].offsetWidth + 6) + "px";
				} else {
					value.children[i].style.left = "+40px";

					value.children[i].style.backgroundColor = "#c7d5e6"
				}
				value.children[i].style.width = "" + (value.children[i].offsetWidth + 5) + "px";
				value.children[i].style.position = "relative";
				value.children[i].style.top = "50%";
				value.children[i].style.transform = "translateY(-50%)";
				i++;
			}
		}
	}
	value.style.width = temp;
  });
}
openOtherTab(activeIndex);


export function showHelp() {
	document.getElementById('helpDiv').style.display = 'block';
}

export function Postmessage(saveAll) {
	document.getElementById('id01').style.display = 'none';
	$('linkedtable_info').fadeOut(1);

	let arr = [];
	let elements = [];

	if (!saveAll) {
		let element = document.getElementById("" + table + "-" + document.getElementById("column").value);
		elements.push(element);

	} else {
		elements = document.querySelectorAll(".notsaved");
	}

	let allElementsChange = [];
	elements.forEach((element) => {
		let column = "";
		let onchange = "";
		let nexttab = "";
		let page = "";
		let type = "";
		let nameposition = "";
		let visible = "";
		let readonly = "";
		let name = "";
		let elementwidth = "";
		let elementheight = "";
		if (saveAll) {
			column = element.getAttribute("data-column");
			onchange = element.getAttribute("data-onchange");
			nexttab = element.getAttribute("data-nexttab");
			page = element.getAttribute("data-page");
			type = element.getAttribute("data-type");
			nameposition = element.getAttribute("data-nameposition");
			visible = element.getAttribute("data-visible");
			readonly = element.getAttribute("data-readonly");
			name = element.getAttribute("data-name");
			elementheight = element.getAttribute("data-height");
			elementwidth = element.getAttribute("data-width");
		} else {
			column = document.getElementById("column").value;
			onchange = document.getElementById("onchange").value;
			nexttab = document.getElementById("nexttab").value;
			page = document.getElementById("page").value;
			type = document.getElementById("type").value;
			nameposition = document.getElementById("nameposition").value;
			visible = document.getElementById("visible").value;
			readonly = document.getElementById("readonly").value;
			name = document.getElementById("name").value;
			elementheight = document.getElementById("elementheight").value;
			elementwidth = document.getElementById("elementwidth").value;

			let old_visible = element.getAttribute("data-visible");

			element.setAttribute("data-column", column);
			element.setAttribute("data-onchange", onchange);
			element.setAttribute("data-nexttab", nexttab);
			element.setAttribute("data-page", page);
			element.setAttribute("data-type", type);
			element.setAttribute("data-nameposition", nameposition);
			element.setAttribute("data-visible", visible);
			element.setAttribute("data-readonly", readonly);
			element.setAttribute("data-name", name);
			element.setAttribute("data-height", elementheight);
			element.setAttribute("data-width", elementwidth);
			if (type != "15") {
				element.children[0].innerHTML = name;
				if (element.children[0].innerHTML && element.children[0].innerHTML.length > 0) {


					if (nameposition == 1 && type != "15") {
						element.children[0].style.left = "0px";
						element.children[0].style.position = "relative";
						element.children[0].style.top = "-15px";
					} else {
						element.children[0].style.top = "0px";
						element.children[0].style.left = "-" + (element.children[0].width + 6) + "px";
						element.children[0].style.position = "relative";
						element.children[0].style.top = "50%";
						element.children[0].style.transform = "translateY(-50%)";
					}

				}

				if (readonly == 0) {
					element.style.backgroundColor = "white";
				} else {
					element.style.backgroundColor = "black";
				}

			} else {
				let style = `style="background-color: <BACKGROUNDCOLOR>;"`;
				if (readonly == 0) {
					style.replace("<BACKGROUNDCOLOR>", "white");
				} else {
					style.replace("<BACKGROUNDCOLOR>", "black");
				}

				element.innerHTML = `<input ${style} type="checkbox">` + name;
			}

			let showHidden = document.getElementById("showHiddenElementsCheckbox");
			if (visible == 0 && old_visible == 1) {
				while(element.className.indexOf("UI_VISIBLE") >= 0) {
					element.className = element.className.replace("UI_VISIBLE", "");
				} 
				element.className += " UI_INVISIBLE";
			} else if(visible == 1 && old_visible == 0){
				while(element.className.indexOf("UI_INVISIBLE") >= 0) {
					element.className = element.className.replace("UI_INVISIBLE", "");
				} 
				element.className += " UI_VISIBLE";
			}

			let width = "" + (parseFloat(elementwidth) * xFactor).toFixed(1) + "px";
			element.style.width = width;
			element.style.height = "" + (parseFloat(elementheight) * heightFactor).toFixed(1) + "px";
		}

		element.className = element.className.replace(" notsaved", "");
		let elHeight = element.style.height;
		let elWidth = element.style.width;
		if(type == "15") {
			elHeight = elementheight;
			elWidth = elementwidth;
		}
		
		let index = 0;
		arr = [];
		arr.push({
			type: "TYPE=",
			text: type,
			order: index++
		});
		arr.push({
			type: "PAGE=",
			text: page,
			order: index++
		});
		arr.push({
			type: "XPOS=",
			text: element.style.left,
			order: index++
		});
		arr.push({
			type: "YPOS=",
			text: element.style.top,
			order: index++
		});
		arr.push({
			type: "WIDTH=",
			text: elWidth,
			order: index++
		});
		arr.push({
			type: "HEIGHT=",
			text: elHeight,
			order: index++
		});

		arr.push({
			type: "NEXTTABPOS=",
			text: nexttab,
			order: index++
		});
		arr.push({
			type: "NAMEPOSITION=",
			text: nameposition,
			order: index++
		});

		arr.push({
			type: "VISIBLE=",
			text: visible,
			order: index++
		});

		arr.push({
			type: "READONLY=",
			text: readonly,
			order: index++
		});
		arr.push({
			type: "NAME=",
			text: name,
			order: index++
		});
		arr.push({
			type: "ONCHANGE=",
			text: onchange,
			order: index++
		});

		allElementsChange.push({
			column: column,
			command: 'saveChanges',
			table: table,
			values: arr,
			type: type,
			name: name
		});
	});

	if (document.querySelectorAll(".notsaved").length <= 0) {
		document.getElementById("saveAllButton").style.display = "none";
	}

	vscode.postMessage(allElementsChange);
}

// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
		$('linkedtable_info').fadeOut(1);
	}
};

export function showElementDialog(event) {
	if (event.ctrlKey && !event.altKey && !event.shiftKey) {
		let target = event.target;
		if (target.className.search("text_of_element") >= 0) {
			target = event.target.parentElement;
		}
		if (target.className.search("element_image") >= 0) {
			target = event.target.parentElement;
		}
		
		document.getElementById("column").value = target.getAttribute("data-column");
		document.getElementById("column_info").innerHTML = "Spalte: " + target.getAttribute("data-column");
		document.getElementById("onchange").value = target.getAttribute("data-onchange");
		document.getElementById("nexttab").value = target.getAttribute("data-nexttab");
		document.getElementById("page").value = target.getAttribute("data-page");
		document.getElementById("type").value = target.getAttribute("data-type");
		document.getElementById("nameposition").value = target.getAttribute("data-nameposition");
		document.getElementById("visible").value = target.getAttribute("data-visible");
		document.getElementById("readonly").value = target.getAttribute("data-readonly");
		document.getElementById("name").value = target.getAttribute("data-name");
		document.getElementById("elementheight").value = target.getAttribute("data-height");
		document.getElementById("elementwidth").value = target.getAttribute("data-width");


		

		document.getElementById('id01').style.display = 'block';

		if (target.getAttribute("data-type") == 45) {
			document.getElementById("linkedtable_info").style.display = "block";
		} else {
			document.getElementById("linkedtable_info").style.display = "none";
		}

	} else if (event.ctrlKey && event.altKey && event.shiftKey) {

		if (document.getElementById('showWarningAgain').checked == false) {
			document.getElementById('AusblendenWarnung').style.display = "block";
		}

		vscode.postMessage([{
			command: "removeElement",
			table: table,
			type: "" + event.target.getAttribute("data-type"),
			name: "" + event.target.getAttribute("data-name"),
			column: "" + event.target.getAttribute("data-column")
		}]);
		document.getElementById(activeIndex).removeChild(event.target);
	}
}

export function OnChangeSelectType(event) {
	if (event.target.value == 45) {
		$("#linkedtable_info").fadeIn(600);
	}
	else {
		$("#linkedtable_info").fadeOut(600);
	}
}


export function onStart(el, x, y) {
	// On drag start, remove the fixed bottom style to prevent the bottom
	// from sticking on the screen.
	el.style.top = el.offsetTop + "px";
	el.style.bottom = "auto";

}

export function onEnd(el, x, y) {

	if (el.className.search("notsaved") < 0) {
		el.className += " notsaved";
	}


	document.getElementById("saveAllButton").style.display = "block";
	// Automatically snap to corners.
	console.log(el.style.top);
	if (parseFloat(el.style.top) <= 0) {
		el.style.top = "0px";
	}
	// if (window.innerWidth - (el.offsetLeft + el.offsetWidth) < snapThreshold) {
	// 	el.style.left = "auto"
	// 	el.style.right = "0px"
	// }
	// if (el.offsetTop < snapThreshold) {
	// 	el.style.top = "0px"
	// }
	// if (el.offsetLeft < snapThreshold) {
	// 	el.style.left = "0px"
	// }
}

export function showHiddenElements(event) {

	// versteckte element anzeigen und visible elemente ausblenden
	let v = document.querySelectorAll(".UI_VISIBLE");
	let v_invisible = document.querySelectorAll(".UI_INVISIBLE");
	v.forEach((element) => {
		while(element.className.indexOf("UI_VISIBLE") >= 0) {
			element.className = element.className.replace("UI_VISIBLE", "");
		}
		element.className += " UI_INVISIBLE";
	});
	
	v_invisible.forEach((element) => {
		while(element.className.indexOf("UI_INVISIBLE") >= 0) {
			element.className = element.className.replace("UI_INVISIBLE", "");
			
		}
		element.className += " UI_VISIBLE";
	});
	openOtherTab(activeIndex);

}

$(document).ready(() => {

	let v = document.querySelectorAll(".Draggable");
	v.forEach((value) => {
		// if (value.getAttribute("data-type") != 4 && value.getAttribute("data-type") != 15) {
		// 	if (value.children && value.children[0] && value.children[0].innerHTML && value.children[0].innerHTML.length > 0) {
		// 		value.children[0].style.left = "-" + (value.children[0].offsetWidth + 5) + "px";
		// 		value.children[0].style.position = "relative";
		// 	}
		// }
	
		if (value.getAttribute("data-nameposition") == 1 && value.getAttribute("data-type") != 15) {
			value.children[0].style.left = "0px";
			value.children[0].style.position = "relative";
			value.children[0].style.top = "-15px";
		}
	
		dragmove(value, value, onStart, onEnd);
	});
	
	let x_pos_start = undefined;
	let y_pos_start = undefined;
	
	let x_pos_offset = undefined;
	let y_pos_offset = undefined;
	
	let is_dragging_area = undefined;
	window.addEventListener("mousedown", (event) => {
		let el = document.createElement("div");
		el.id = "DRAG_AREA";
		el.className += " DRAG_AREA";
		el.style.position = "absolute";
		el.style.top = "" + event.offsetY + "px";
		el.style.left = "" + event.offsetX + "px";
		document.getElementById(activeIndex).appendChild(el);
	
		
		let elements = document.querySelectorAll(".Draggable");
		elements.forEach((el) => {
			while(el.className.indexOf(" marked_for_group_drag") >= 0) {
				el.className = el.className.replace(" marked_for_group_drag", "");
			}
		});
	
		x_pos_start = event.clientX;
		y_pos_start = event.clientY;
		x_pos_offset = event.offsetX;
		y_pos_offset = event.offsetY;
		is_dragging_area = true;
	});
	
	window.addEventListener("mousemove", (event)=> {
		let el = document.getElementById("DRAG_AREA");
		if(el && is_dragging_area && x_pos_start && y_pos_start) {
			let width = (event.clientX - x_pos_start);
	
			let y_real_offset = y_pos_offset;
			let x_real_offset = x_pos_offset;
	
			if(width < 0) {
				width = width * -1;
				x_real_offset -= width;
			}
			let height = (event.clientY - y_pos_start);
			if(height < 0) {
				height = height * -1;
				y_real_offset -= height;
			}
	
			el.style.width = "" + width + "px";
			el.style.height = "" + height + "px";
	
			el.style.top = "" + y_real_offset + "px";
			el.style.left = "" + x_real_offset + "px";
		}
	
	});
		
	
	window.addEventListener("mouseup", (event) => {
		x_pos_start = undefined;
		y_pos_start = undefined;
		is_dragging_area = undefined;
		while(document.getElementById("DRAG_AREA")) {
			let dragArea = document.getElementById("DRAG_AREA");
	
			let elements = document.getElementById(activeIndex).querySelectorAll(".Draggable");
			elements.forEach((el) => {

				if(el.getAttribute("data-visible") == 1) {

					//if(el.style.width
					//el.style.height
					let x_pos_top_left_element = parseFloat(el.style.left);
					let y_pos_top_left_element = parseFloat(el.style.top);
		
					let x_pos_bottom_right_element = x_pos_top_left_element + parseFloat(el.style.width);
					let y_pos_bottom_right_element = y_pos_top_left_element + parseFloat(el.style.height);
					
					
					let x_pos_top_left_dragArea = parseFloat(dragArea.style.left);
					let y_pos_top_left_dragArea = parseFloat(dragArea.style.top);
					
					let x_pos_bottom_right_dragArea = x_pos_top_left_dragArea + parseFloat(dragArea.style.width);
					let y_pos_bottom_right_dragArea = y_pos_top_left_dragArea + parseFloat(dragArea.style.height);
		
		
					if(((x_pos_top_left_element > x_pos_top_left_dragArea &&
						x_pos_top_left_element < x_pos_bottom_right_dragArea)
						||
						(x_pos_bottom_right_element > x_pos_top_left_dragArea &&
						x_pos_bottom_right_element < x_pos_bottom_right_dragArea)
						||
						(x_pos_top_left_dragArea > x_pos_top_left_element && 
						x_pos_top_left_dragArea < x_pos_bottom_right_element))
						&&
						((y_pos_top_left_element > y_pos_top_left_dragArea &&
						y_pos_top_left_element < y_pos_bottom_right_dragArea)
						||
						(y_pos_bottom_right_element > y_pos_top_left_dragArea &&
						y_pos_bottom_right_element < y_pos_bottom_right_dragArea)
						||
						(y_pos_top_left_dragArea > y_pos_top_left_element && 
						y_pos_top_left_dragArea < y_pos_bottom_right_element))
						) {
		
						if(el.className.indexOf("marked_for_group_drag") < 0) {
							el.className += " marked_for_group_drag";
						}
					}
				}
			})
	
			document.getElementById(activeIndex).removeChild(document.getElementById("DRAG_AREA"));
		}

		if (event.ctrlKey && event.altKey && !event.shiftKey) {
			vscode.postMessage([{
				command: "askColumn",
				offsetY: event.offsetY,
				offsetX: event.offsetX
			}]);
		}
	});


	window.addEventListener("keydown", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		
		if(ev.key == "ArrowDown") {
			let elements = document.getElementsByClassName("marked_for_group_drag");
			for (let index = 0; index < elements.length; index++) {
				let elementToMove = elements[index];
				let top = elementToMove.style.top;
				top = parseFloat(top);
				top += 4
				elementToMove.style.top = "" + top + "px";
				if (elementToMove.className.search("notsaved") < 0) {
					elementToMove.className += " notsaved";
				}
				document.getElementById("saveAllButton").style.display = "block";
			}
		}
		if(ev.key == "ArrowUp") {
			let elements = document.getElementsByClassName("marked_for_group_drag");
			for (let index = 0; index < elements.length; index++) {
				let elementToMove = elements[index];
				let top = elementToMove.style.top;
				top = parseFloat(top);
				top -= 4
				elementToMove.style.top = "" + top + "px";
				if (elementToMove.className.search("notsaved") < 0) {
					elementToMove.className += " notsaved";
				}
				document.getElementById("saveAllButton").style.display = "block";
			}
		}
		if(ev.key == "ArrowLeft") {
			let elements = document.getElementsByClassName("marked_for_group_drag");
			for (let index = 0; index < elements.length; index++) {
				let elementToMove = elements[index];
				let left = elementToMove.style.left;
				left = parseFloat(left);
				left -= 5
				elementToMove.style.left = "" + left + "px";
				if (elementToMove.className.search("notsaved") < 0) {
					elementToMove.className += " notsaved";
				}
				document.getElementById("saveAllButton").style.display = "block";
			}
		}
		if(ev.key == "ArrowRight") {
			let elements = document.getElementsByClassName("marked_for_group_drag");
			for (let index = 0; index < elements.length; index++) {
				let elementToMove = elements[index];
				let left = elementToMove.style.left;
				left = parseFloat(left);
				left += 5;
				elementToMove.style.left = "" + left + "px";
				if (elementToMove.className.search("notsaved") < 0) {
					elementToMove.className += " notsaved";
				}
				document.getElementById("saveAllButton").style.display = "block";
			}
		}
	});

	
	// Handle the message inside the webview
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent
		switch (message.command) {
			case 'createNewElement':

				let newElement = document.createElement("div");
				newElement.style.backgroundColor = "white";
				newElement.style.resize = "none";
				newElement.style.height = `${1.2 * heightFactor}px`;
				newElement.style.top = "" + message.offsetY + "px";
				newElement.style.left = "" + message.offsetX + "px";
				newElement.style.width = `${(25 * xFactor)}px`;
				newElement.style.position = "absolute";
				newElement.style.border = " 1px solid #7a7a7a";
		
				newElement.onclick = showElementDialog;
				newElement.setAttribute("data-column", "" + message.new_id);
				newElement.setAttribute("data-onchange", "");
				newElement.setAttribute("data-nexttab", "0");
				newElement.setAttribute("data-page", activeIndex);
				newElement.setAttribute("data-type", "25");
				newElement.setAttribute("data-nameposition", "4");
				newElement.setAttribute("data-visible", "1");
				newElement.setAttribute("data-readonly", "0");
				newElement.setAttribute("data-name", "Neues Element");
				newElement.setAttribute("data-saved", "1");
				newElement.setAttribute("data-height", "1.2");
				newElement.setAttribute("data-width", "25");
				newElement.className += " Draggable notsaved";
				newElement.innerHTML = "<div class='text_of_element'>Neues Element</div>";
				newElement.id = "" + table + "-" + message.new_id;
		
				document.getElementById(activeIndex).appendChild(newElement);
				dragmove(newElement, newElement, onStart, onEnd);

				openOtherTab(activeIndex);
				break;
			case "showHelp":
				if (message.showHelp) {
					document.getElementById("helpGreetings").style.display = "block";
					showHelp();
				}
				break;
		}
	});

})	

