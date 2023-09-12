// @ts-nocheck
$(document).ready(() => {

	$("table").hide();

	$("button").on("click", (ev) => {
		let id = $(ev.target).attr("data-id");
		$("table").hide();
		$("#" + id).show();
	})

	$("td").on("click", (ev) => {
		
		let target = ev.target;



	});


})