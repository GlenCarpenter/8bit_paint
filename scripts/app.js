var input = $("#color-field");
let paintColor = "#000";

$(document).ready(function() {
    
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

	$('input[type=checkbox]').on('change',function(e) {
		$('.square').toggleClass('grid');
	});
});

function selectColor(color) {
		paintColor = color;
	}

document.getElementById("btnSave").addEventListener("click", function() {

    html2canvas(document.querySelector('#colorBox')).then(function(canvas) {

        console.log(canvas);
        saveAs(canvas.toDataURL(), '8bit_paint.png');
    });
});


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
