var paintColor = "black";

// Disable back button
window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
});

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

$(document).ready(function () {
  $("#start-button").text("Tap to start!");
  // Remove overlay
  $("#start-button").on("click", function () {
    $("#overlay").remove();
  });

  var mouseIsDown = false;
  var isRightClick = false;
  var pourMode = false;

  $("body").on('touchstart touchmove dblclick', function (e) {
    e.preventDefault();
  });

  $("html").on('touchstart touchmove dblclick', function (e) {
    e.preventDefault();
  });

  $(document).on('mousedown touchstart', function (e) {
    e.preventDefault();
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
    if (pourMode) return;
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

  $(".square").on("mousedown touchstart", function (e) {
    e.preventDefault();

    if (pourMode) {
      var currentColor = $(this).css('background-color');

      // Need to get RGB of current paintcolor
      var testElement = document.createElement('div');
      testElement.style.backgroundColor = paintColor;
      document.body.appendChild(testElement);
      $(testElement).css('background-color', paintColor);
      var testColor = $(testElement).css('background-color');
      document.body.removeChild(testElement);

      if (currentColor === testColor) return;

      var touchX, touchY;
      if (e.type == 'touchstart') {
        var touch = e.originalEvent.touches[0];
        touchX = touch.clientX;
        touchY = touch.clientY;
      }
      else {
        touchX = e.originalEvent.clientX;
        touchY = e.originalEvent.clientY;
      }

      paintNeighbors(touchX, touchY, paintColor, currentColor);
      return;
    }

    $(this).css('background-color', isRightClick ? "#fff" : paintColor);
    $(this).addClass('blink');
    setTimeout(() => $(this).removeClass('blink'), 1000);
  });

  $('input[type=checkbox]').on('change', function (e) {
    $('.container-square').toggleClass('grid');
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

  // Event listeners for pour mode
  $("#paintBucket").on("click", function () {
    pourMode = true;

    $("#paintBrush").removeClass('selectedPaintStyle');
    $("#paintBrush").addClass('buttonControl');

    $("#paintBucket").removeClass('buttonControl');
    $("#paintBucket").addClass('selectedPaintStyle');
    $("#paintBucket").addClass('brushFlash');
    setTimeout(() => {
      $("#paintBucket").removeClass('brushFlash');
    }, 1000);
  });
  $("#paintBrush").on("click", function () {
    pourMode = false;

    $("#paintBucket").removeClass('selectedPaintStyle');
    $("#paintBucket").addClass('buttonControl');

    $("#paintBrush").removeClass('buttonControl');
    $("#paintBrush").addClass('selectedPaintStyle');
    $("#paintBrush").addClass('brushFlash');
    setTimeout(() => {
      $("#paintBrush").removeClass('brushFlash');
    }, 1000);
  });

  // Event listener for click of Clear button
  $("#clearCanvas").on("click", function () {
    $("#clearCanvas").addClass('blink');
    $(".container-square").addClass('blink');
    setTimeout(() => {
      $("#clearCanvas").removeClass('blink');
      $(".container-square").removeClass('blink');
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

function paintNeighbors(x, y, paintColor, currentColor) {
  setTimeout(() => {
    var currentSquare = document.elementFromPoint(x, y);
    var newColor = $(currentSquare).css('background-color');

    if (!currentSquare ||
      !$(currentSquare).hasClass('square') ||
      newColor !== currentColor) {
      return;
    }

    $(currentSquare).css('background-color', paintColor);
    $(currentSquare).addClass('blink');
    setTimeout(() => $(currentSquare).removeClass('blink'), 1000);

    var currentRect = currentSquare.getBoundingClientRect();
    var centerX = currentRect.left + currentRect.width / 2;
    var centerY = currentRect.top + currentRect.height / 2;

    paintNeighbors(centerX, centerY - 25, paintColor, currentColor);
    paintNeighbors(centerX, centerY + 25, paintColor, currentColor);
    paintNeighbors(centerX - 25, centerY, paintColor, currentColor);
    paintNeighbors(centerX + 25, centerY, paintColor, currentColor);
  }, 25);
}