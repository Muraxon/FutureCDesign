// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.
//@ts-nocheck

let _loaded = false;
let _callbacks = [];
const _isTouch = false;

export const dragmove = function(target, handler, onStart, onEnd) {
  // Register a global event to capture mouse moves (once).
  if (!_loaded) {
	document.addEventListener(_isTouch ? "touchmove" : "mousemove", function(e) {
	  let c = e;
	  if (e.touches) {
		c = e.touches[0];
	  }

	  // On mouse move, dispatch the coords to all registered callbacks.
	  for (var i = 0; i < _callbacks.length; i++) {
		let restX = c.clientX - (c.clientX % 5);
		let restY = c.clientY - (c.clientY % 4);
			  
		_callbacks[i](restX, restY, c);
	  }
	});
  }
  
  _loaded = true;
  let isMoving = false, hasStarted = false;
  let startX = 0, startY = 0, lastX = 0, lastY = 0;
  let real_start_x = 0;
  let real_start_y = 0;

  // On the first click and hold, record the offset of the pointer in relation
  // to the point of click inside the element.
  handler.addEventListener(_isTouch ? "touchstart" : "mousedown", function(e) {
	e.stopPropagation();
	e.preventDefault();
	if (target.dataset.dragEnabled === "false") {
	  return;
	}

	if(target.className.indexOf("marked_for_keyboard_handling") < 0) {
		target.className += " marked_for_keyboard_handling";
	}

	let c = e;
	if (e.touches) {
	  c = e.touches[0];
	}

	real_start_x = c.clientX;
	real_start_y = c.clientY;

	isMoving = true;
	startX = target.offsetLeft - c.clientX;
	startY = target.offsetTop - c.clientY;
  });

  // On leaving click, stop moving.
  document.addEventListener(_isTouch ? "touchend" : "mouseup", function(e) {   
	if (onEnd && hasStarted) {
	  onEnd(target, parseFloat(target.style.left), parseFloat(target.style.top));
	}
	
	isMoving = false;
	hasStarted = false;
});

// Register mouse-move callback to move the element.
_callbacks.push(function move(x, y, c) {
	if (!isMoving) {
	  return;
	}

	if (!hasStarted) {
	  hasStarted = true;
	  if (onStart) {
		onStart(target, lastX, lastY);
	  }
	}

	lastX = x + startX;
	lastY = y + startY;
	
	lastX -= (lastX % 5);
	lastY -= (lastY % 4);

	// If boundary checking is on, don't let the element cross the viewport.
	if (target.dataset.dragBoundary === "true") {
	  if (lastX < 1 || lastX >= window.innerWidth - target.offsetWidth) {
		//return;
	  }
	  if (lastY < 1 || lastY >= window.innerHeight - target.offsetHeight) {
		//return;
	  }
	}

	let elements = document.querySelectorAll(".marked_for_group_drag");

	for(let x = 0; x < elements.length; x++) {
		if(elements[x] != target) {
			let xClient = c.clientX - (c.clientX % 5);
			let yClient = c.clientY - (c.clientY % 4);

			let real_start_x_temp = xClient - real_start_x;
			let real_start_y_temp = yClient - real_start_y;
			
			real_start_x_temp = (parseFloat(elements[x].style.left) + real_start_x_temp);
			real_start_y_temp = (parseFloat(elements[x].style.top) + real_start_y_temp);

			real_start_x_temp = real_start_x_temp - (real_start_x_temp % 5);
			real_start_y_temp = real_start_y_temp - (real_start_y_temp % 4);

			elements[x].style.left = "" + real_start_x_temp + "px";
			elements[x].style.top = "" + real_start_y_temp + "px";

			if(elements[x].className.indexOf(" notsaved") < 0) {
				elements[x].className += " notsaved";
			}
		}
	}

		
	real_start_x = c.clientX - (c.clientX % 5);
	real_start_y = c.clientY - (c.clientY % 4);

	target.style.left = lastX + "px";
	target.style.top = lastY + "px";
  });
}

export { dragmove as default };