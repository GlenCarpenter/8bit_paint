var input = $("#color-field");
let paintColor = "#000";


//on click change square background color to the input value
$(".square").on("click", function(){
	if(!$(this).hasClass("painted")){
		$(this).css('background-color', paintColor);
		$(this).addClass("painted");
	} else {
		$(this).css('background-color', "#fff");
		$(this).removeClass("painted");
	}
})

function selectColor(color) {
	paintColor = color;
}

function saveToJpeg() {
	$("#colorBox").toggle(400, "swing");
	$("#imgMessage").toggle(400, "swing");
  html2canvas(document.getElementById('colorBox'))
  .then(function(canvas) {
    document.body.appendChild(canvas);
	});
}