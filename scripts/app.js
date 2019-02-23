var input = $("#color-field");
let paintColor = "#000";

$(document).ready(function() {
	var mouseIsDown = false;
	
	$(document).mousedown(function() {
		mouseIsDown = true;      // When mouse goes down, set isDown to true
		})
		.mouseup(function() {
		mouseIsDown = false;    // When mouse goes up, set isDown to false
	});
    
//on click change square background color to the input value
	$(".square").on("mouseover", function(){
		if(mouseIsDown){
			$(this).css('background-color', paintColor);
			$(this).addClass("painted");
		}
	})
	
	$(".square").on("click", function(){
		if(!$(this).hasClass("painted")){
				$(this).css('background-color', paintColor);
				$(this).addClass("painted");
			}
	});
	
	$('input[type=checkbox]').on('change',function(e) {
		$('.square').toggleClass('grid');
	});

	$('.colorSquare').on('click', function(e) {
		$('.colorSquare').removeClass('selectedColorSquare');
		$(this).toggleClass('selectedColorSquare');
	});
	
	// Event listener for click of save button
	document.getElementById("btnSave").addEventListener("click", function() {
		html2canvas(document.querySelector('#colorBox')).then(function(canvas) {
			console.log(canvas);
			saveAs(canvas.toDataURL(), '8bit_paint.png');
		});
	});

	// Event listener for custom color
	document.getElementById('colorField').addEventListener("change", function(event) {
		selectColor(this.value);
		$('.colorSquare').removeClass('selectedColorSquare');
	});
	
	// Event listener for click of Clear button
	document.getElementById("clearCanvas").addEventListener("click", function() {
		$(".square").css('background-color', '#fff');
		$(".square").removeClass("painted");
	});
});



function selectColor(color) {
	paintColor = color;
}

function saveAs(uri, filename) {

    var link = document.createElement('a');
    if (typeof link.download === 'string') {

        link.href = uri;
        link.download = filename;
        //Firefox requires the link to be in the body
        document.body.appendChild(link);
        //simulate click
        link.click();
        //remove the link when done
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}