// @ts-nocheck
import { dragmove } from './dragmove.js';

const xFactor = 5;
const yFactor = 40;
const heightFactor = 20;

const vscode = acquireVsCodeApi();
let table = document.getElementById("tablenumber").content;

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
			if (type != 15) {
				element.children[0].innerHTML = name;
				if (element.children[0].innerHTML && element.children[0].innerHTML.length > 0) {


					if (nameposition == 1) {
						element.children[0].style.left = "0px";
						element.children[0].style.position = "relative";
						element.children[0].style.top = "-20px";
					} else {
						element.children[0].style.top = "0px";
						element.children[0].style.left = "-" + (element.children[0].width + 5) + "px";
						element.children[0].style.position = "relative";
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

			if (visible == 0) {
				element.style.display = "none";
			} else {
				element.style.opacity = "1";
			}

			let width = "" + (parseFloat(elementwidth) * xFactor).toFixed(1) + "px";
			element.style.width = width;
			element.style.height = "" + (parseFloat(elementheight) * heightFactor).toFixed(1) + "px";
		}

		element.className = element.className.replace(" notsaved", "");

		arr = [];
		if (!saveAll) {

			arr.push({
				type: "TYPE=",
				text: type
			});
			arr.push({
				type: "PAGE=",
				text: page
			});
		}

		arr.push({
			type: "XPOS=",
			text: element.style.left
		});
		arr.push({
			type: "YPOS=",
			text: element.style.top
		});
		arr.push({
			type: "WIDTH=",
			text: element.style.width
		});
		arr.push({
			type: "HEIGHT=",
			text: element.style.height
		});

		if (!saveAll) {
			arr.push({
				type: "NEXTTABPOS=",
				text: nexttab
			});
			arr.push({
				type: "NAMEPOSITION=",
				text: nameposition
			});
			arr.push({
				type: "VISIBLE=",
				text: visible
			});
			arr.push({
				type: "READONLY=",
				text: readonly
			});
			arr.push({
				type: "NAME=",
				text: name
			});
			arr.push({
				type: "ONCHANGE=",
				text: onchange
			});
		}

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




// Use the start/end events to simulate "snap to edge" behaviour.
const snapThreshold = 50;
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
	if (el.style.top / 40 <= 0) {
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


let v = document.querySelectorAll(".Testungen");
v.forEach((value) => {
	if (value.getAttribute("data-type") != 4 && value.getAttribute("data-type") != 15) {
		if (value.children && value.children[0] && value.children[0].innerHTML && value.children[0].innerHTML.length > 0) {
			value.children[0].style.left = "-" + (value.children[0].offsetWidth + 5) + "px";
			value.children[0].style.position = "relative";
		}
	}

	if (value.getAttribute("data-nameposition") == 1) {
		value.children[0].style.left = "0px";
		value.children[0].style.position = "relative";
		value.children[0].style.top = "-20px";
	}

	dragmove(value, value, onStart, onEnd);
});

let newelementsID = 100000;
window.addEventListener("click", (event) => {
	if (event.ctrlKey && event.altKey && !event.shiftKey) {
		event.stopPropagation();

		let newElement = document.createElement("div");
		newElement.style.backgroundColor = "white";
		newElement.style.resize = "none";
		newElement.style.height = "20px";
		newElement.style.top = "" + event.offsetY + "px";
		newElement.style.left = "" + event.offsetX + "px";
		newElement.style.width = `${(35 * xFactor)}px`;
		newElement.style.position = "absolute";
		newElement.style.border = " 1px solid #7a7a7a";

		newElement.onclick = showElementDialog;
		newElement.setAttribute("data-saved", "1");
		newElement.setAttribute("data-column", "");
		newElement.setAttribute("data-onchange", "");
		newElement.setAttribute("data-nexttab", "0");
		newElement.setAttribute("data-page", activeIndex);
		newElement.setAttribute("data-type", "25");
		newElement.setAttribute("data-nameposition", "4");
		newElement.setAttribute("data-visible", "1");
		newElement.setAttribute("data-readonly", "0");
		newElement.setAttribute("data-name", "new_element");
		newElement.className += " Testungen notsaved";
		newElement.innerHTML = "<div class='text_of_element'>Neues Element</div>";
		newElement.id = "" + table + "-" + newelementsID;

		document.getElementById(activeIndex).appendChild(newElement);
		dragmove(newElement, newElement, onStart, onEnd);

		vscode.postMessage([{
			command: "askColumn",
			id: newelementsID
		}]);
		newelementsID++;
	}
});

// Handle the message inside the webview
window.addEventListener('message', event => {
	const message = event.data; // The JSON data our extension sent
	switch (message.command) {
		case 'setColumnOfNewElement':
			let element = document.getElementById("" + table + "-" + message.id);
			element.setAttribute("data-column", "" + message.newid);
			element.id = "" + table + "-" + message.newid;
		case "showHelp":
			if (message.showHelp) {
				document.getElementById("helpGreetings").style.display = "block";
				showHelp();
			}
			break;
	}
});
