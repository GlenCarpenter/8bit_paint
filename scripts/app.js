var input = $("#color-field");
var paintColor = "#000";

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

$(document).ready(function () {
  var mouseIsDown = false;
  var isRightClick = false;

  $(document).on('mousedown touchstart', function (e) {
    mouseIsDown = true;      // When mouse goes down, set isDown to true
    if (e.which == 3) {
      isRightClick = true;
    }
  }).on('mouseup touchend', function () {
    mouseIsDown = false;    // When mouse goes up, set isDown to false
    isRightClick = false;
  });

  //on click and drag, change square background color to the input value
  $(".square").on("mouseover touchmove", function (e) {
    e.preventDefault();
    if (mouseIsDown) {
      switch (e.type) {
        case 'touchmove':
          var touchElement;
          var currentRect;
          var touch = e.originalEvent.touches[0];
          var touchX = touch.clientX;
          var touchY = touch.clientY;

          if (
            currentRect &&
            touchX >= currentRect.left &&
            touchX <= currentRect.right &&
            touchY >= currentRect.top &&
            touchY <= currentRect.bottom
          ) {
            return;
          }

          touchElement = document.elementFromPoint(touchX, touchY);
          currentRect = touchElement.getBoundingClientRect();
          if (touchElement) {
            if ($(touchElement).hasClass('square')) {
              $(touchElement).css('background-color', paintColor);
              $(touchElement).addClass('blink');
              setTimeout(() => $(touchElement).removeClass('blink'), 1000);
            }
            else {
              if ($(touchElement).hasClass('container-square')) {
                $(touchElement).addClass('flash');
                setTimeout(() => $(touchElement).removeClass('flash'), 1000);
              }
            }
          }
          break;
        case "mouseover":
          if ($(this).hasClass('square')) {
            $(this).css('background-color', isRightClick ? "#fff" : paintColor);
            $(this).addClass('blink');
            setTimeout(() => $(this).removeClass('blink'), 1000);
          } else {
            if ($(touchElement).hasClass('container-square')) {
              $(this).addClass('flash');
              setTimeout(() => $(this).removeClass('flash'), 1000);
            }
          }
          break;
      }
    }
  });

  $(".square").on("click touchstart", function (e) {
    e.preventDefault();
    $(this).css('background-color', isRightClick ? "#fff" : paintColor);
    $(this).addClass('blink');
    setTimeout(() => $(this).removeClass('blink'), 1000);
  });

  $('input[type=checkbox]').on('change', function (e) {
    $('.square').toggleClass('grid');
  });

  $('.colorSquare').on('click', function (e) {
    $('.colorSquare').removeClass('selectedColorSquare');
    $('#colorField').css('background-color', '#000');
    $(this).toggleClass('selectedColorSquare');
  });

  // Event listener for click of save button
  $("#btnSave").on("click", function () {
    $("#btnSave").addClass('blink');
    setTimeout(() => $("#btnSave").removeClass('blink'), 1000);
    html2canvas(document.querySelector('#colorBox')).then(function (canvas) {
      saveAs(canvas.toDataURL(), '8bit_paint.png');
    });
  });

  // Event listener for custom color
  $('#colorField').on("click", function (event) {
    selectColor(this.value);
    $('.colorSquare').removeClass('selectedColorSquare');
    $('#colorField').css('background-color', '#f1f1f1');
  });
  $('#colorField').on("change", function (event) {
    selectColor(this.value);
    $('.colorSquare').removeClass('selectedColorSquare');
  });

  // Event listener for click of Clear button
  $("#clearCanvas").on("click", function () {
    $("#clearCanvas").addClass('blink');
    $(".square").addClass('blink');
    setTimeout(() => {
      $("#clearCanvas").removeClass('blink');
      $(".square").removeClass('blink');
    }, 1000);
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