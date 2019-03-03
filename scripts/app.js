var input = $("#color-field");
let paintColor = "#000";

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

$(document).ready(function() {
	var mouseIsDown = false;
	
	$(document).mousedown(function() {
		mouseIsDown = true;      // When mouse goes down, set isDown to true
		})
		.mouseup(function() {
		mouseIsDown = false;    // When mouse goes up, set isDown to false
	});
    
//on click and drag, change square background color to the input value
	$(".square").on("mouseover", function(){
		if(mouseIsDown){
			switch (event.which) {
			case 1:
				$(this).css('background-color', paintColor);
				if($(this).hasClass('grid')) {
					$(this).addClass('blink');
					setTimeout(()=>$(this).removeClass('blink'),1000);
				} else {
					$(this).addClass('flash');
					setTimeout(()=>$(this).removeClass('flash'),1000);
				}
				break;
			case 3:
				$(this).css('background-color', "#fff");
				if($(this).hasClass('grid')) {
					$(this).addClass('blink');
					setTimeout(()=>$(this).removeClass('blink'),1000);
				} else {
					$(this).addClass('flash');
					setTimeout(()=>$(this).removeClass('flash'),1000);
				}
				break;
			}
		}
	})
	
	$('.square').mousedown(function(event) {
		switch (event.which) {
			case 1:
				$(this).css('background-color', paintColor);
				if($(this).hasClass('grid')) {
					$(this).addClass('blink');
					setTimeout(()=>$(this).removeClass('blink'),1000);
				} else {
					$(this).addClass('flash');
					setTimeout(()=>$(this).removeClass('flash'),1000);
				}
				break;
			case 3:
				$(this).css('background-color', "#fff");
				if($(this).hasClass('grid')) {
					$(this).addClass('blink');
					setTimeout(()=>$(this).removeClass('blink'),1000);
				} else {
					$(this).addClass('flash');
					setTimeout(()=>$(this).removeClass('flash'),1000);
				}
				break;
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
	document.getElementById('colorField').addEventListener("click", function(event) {
		selectColor(this.value);
		$('.colorSquare').removeClass('selectedColorSquare');
	});
	document.getElementById('colorField').addEventListener("change", function(event) {
		selectColor(this.value);
		$('.colorSquare').removeClass('selectedColorSquare');
	});
	
	// Event listener for click of Clear button
	document.getElementById("clearCanvas").addEventListener("click", function() {
		$(".square").css('background-color', '#fff');
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