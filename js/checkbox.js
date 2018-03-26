$('input[type="checkbox"]').change(function(e) {
	
	var checked = $(this).prop("checked"),
	container = $(this).parent(),
	siblings = container.siblings();

	container.find('input[type="checkbox"]').prop({
		indeterminate: false,
		checked: checked
	});

	function checkSiblings(el) {

		var parent = el.parent().parent(),
		all = true;

		el.siblings().each(function() {
			return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
		});

		if (all && checked) {

			parent.children('input[type="checkbox"]').prop({
				indeterminate: false,
				checked: checked
			});

			checkSiblings(parent);

		} else if (all && !checked) {

			parent.children('input[type="checkbox"]').prop("checked", checked);
			parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
			checkSiblings(parent);

		} else {

			el.parents("li").children('input[type="checkbox"]').prop({
				indeterminate: true,
				checked: false
			});

		}

	}
	if( $(this).attr("id") != "allcrime") {
		if(getCrimesArray().length == 0 || getCrimesArray().length == 11) {
			$("#allcrime").prop("checked", true);
		}else{
			$("#allcrime").prop("checked", false);
		}
	}
	checkSiblings(container);
	changeAttribute(getCrimesArray());
	updateSocViz(getCrimesArray());
});

$('input[id="allcrime"]').change(function(e) {
		if( $(this).prop("checked")){
			$("#violent").prop("checked", true);
			$("#assault").prop("checked", true);
			$("#robbery").prop("checked", true);
			$("#homicide").prop("checked", true);
			$("#property").prop("checked", true);
			$("#arson").prop("checked", true);
			$("#theft").prop("checked", true);
			$("#burglary").prop("checked", true);
			$("#sexual").prop("checked", true);
			$("#prostitution").prop("checked", true);
			$("#sexual_abuse").prop("checked", true);
			$("#others").prop("checked", true);
			changeAttribute(getCrimesArray());
			updateSocViz(getCrimesArray());
		}
	});


function getCrimesArray() {
	var crimes = new Array();
	$('#violentChild input:checked').each(function() {
		crimes.push($(this).attr('value'));
	});
	$('#propertyChild input:checked').each(function() {
		if ($(this).attr('id')=="theft") {
			crimes.push("06");
			crimes.push("07");
		}
		else	
			crimes.push($(this).attr('value'));
	});
	$('#sexualChild input:checked').each(function() {
		if ($(this).attr('id')=="sexual_abuse") {
			crimes.push("02");
			crimes.push("17");
		}
		else	
			crimes.push($(this).attr('value'));
	});
	$('#othersCrime input:checked').each(function() {
		crimes.push($(this).attr('value'));
	});
	return crimes;
}