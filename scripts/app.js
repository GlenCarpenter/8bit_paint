appStore.loadCurrentDrawing();
appStore.initColorBox();
appStore.resetCurrentVisitedNodes();
appStore.resetCurrentActions();
appStore.initUndoStack();
appStore.initRedoStack();
appStore.initCanvas();


$(document).ready(function () {
  $("#start-button-message").text("Tap here to start!");
  // Remove overlay
  $(".loading-overlay").on("click", function () {
    $("#overlay").remove();
  });

  $("body").on('touchstart touchmove dblclick', function (e) {
    e.preventDefault();
  });

  $("html").on('touchstart touchmove dblclick', function (e) {
    e.preventDefault();
  });

  $(document).on('mousedown touchstart', function (e) {
    e.preventDefault();
    appStore.setMouseIsDown(true);      // When mouse goes down, set isDown to true
    if (e.which == 3) {
      appStore.setIsRightClick(true);
    }
  }).on('mouseup touchend', function () {
    appStore.setMouseIsDown(false);    // When mouse goes up, set isDown to false
    appStore.setIsRightClick(false);
    if (appStore.currentActions.length > 0 && !appStore.pourMode) {
      appStore.addToUndoStack(appStore.currentActions);
      appStore.clearRedoStack();
    }
    appStore.resetCurrentActions();
    appStore.saveCurrentDrawing();
    appStore.resetCurrentVisitedNodes();
  });

  //on click and drag, change square background color to the input value
  $(".square").on("mouseover touchmove", function (e) {
    e.preventDefault();
    if (appStore.pourMode) return;
    if (appStore.mouseIsDown) {
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
          currentRect = touchElement && touchElement.getBoundingClientRect();
          if (touchElement) {
            handleTouchMove(touchElement);
          }
          break;
        case "mouseover":
          if ($(this).hasClass('square')) {
            [_, row, col] = this.id.split('-');
            appStore.currentActions.push({ row, col, color: appStore.currentDrawing[row][col] });
            $(this).css('background-color', appStore.isRightClick ? appStore.secondaryPaintColor : appStore.paintColor);
            appStore.updateCurrentDrawing(row, col, appStore.isRightClick ? appStore.secondaryPaintColor : appStore.paintColor);
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
    var newColor = e.which == 3 ? appStore.secondaryPaintColor : appStore.paintColor;
    [_, row, col] = this.id.split('-');

    if (appStore.pourMode) {
      var currentColor = $(this).css('background-color');

      // Need to get RGB of current paintcolor
      var testColor = getCurrentPaintColorRGB(newColor);
      if (currentColor === testColor) return;

      paintNeighbors(parseInt(row), parseInt(col), currentColor);

      return;
    }

    appStore.currentVisitedNodes.add(`${row}, ${col}`);
    appStore.currentActions.push({ row, col, color: appStore.currentDrawing[row][col] });

    appStore.updateCurrentDrawing(row, col, newColor);
    $(this).css('background-color', newColor);
    $(this).addClass('blink');
    setTimeout(() => $(this).removeClass('blink'), 1000);
  });

  $('input[type=checkbox]').on('change', function (e) {
    appStore.toggleGrid();
  });

  $('.colorSquare').on('contextmenu', function (e) {
    e.preventDefault();
    appStore.setSecondaryPaintColor($(this).css('background-color'));
  });

  $('.colorSquare').on('click', function (e) {
    $('.colorSquare').removeClass('selectedColorSquare');
    $('#colorField').css('background-color', '#000000');
    $(this).toggleClass('selectedColorSquare');
    appStore.setPaintColor($(this).css('background-color'));
  });

  // Event listener for click of save button
  $("#btnSave").on("click", function () {
    $("#btnSave").addClass('blink');
    setTimeout(() => $("#btnSave").removeClass('blink'), 1000);
    shareImage();
  });

  // Event listener for custom color
  $('#colorField').on("click", function (event) {
    appStore.setPaintColor(this.value);
    $('.colorSquare').removeClass('selectedColorSquare');
    $('#colorField').css('background-color', '#f1f1f1');
  });
  $('#colorField').on("change", function (event) {
    appStore.setPaintColor(this.value);
    $('.colorSquare').removeClass('selectedColorSquare');
  });

  // Event listeners for pour mode
  $("#paintBucket").on("click", function () {
    appStore.setPourMode(true);

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
    appStore.setPourMode(false);

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
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        let action = { row, col, color: appStore.currentDrawing[row][col] };
        appStore.addToCurrentActions(action);
      }
    }
    appStore.addToUndoStack(appStore.currentActions);
    appStore.clearRedoStack();
    appStore.resetCurrentActions();
    appStore.initCurrentDrawing();
    $("#clearCanvas").addClass('blink');
    $(".container-square").addClass('blink');
    setTimeout(() => {
      $("#clearCanvas").removeClass('blink');
      $(".container-square").removeClass('blink');
    }, 1000);
    $(".square").css('background-color', '#ffffff');
  });

  $("#btn-undo").on("click", function () {
    appStore.undo();
    $("#btn-undo").addClass('blink');
    setTimeout(() => {
      $("#btn-undo").removeClass('blink');
    }, 1000);
  });

  $("#btn-redo").on("click", function () {
    appStore.redo();
  });

});

// Paints neighbors of current square
function paintNeighbors(row, col, currentColor) {
  let queue = [];
  const visited = new Set();
  queue.push([row, col]);
  while (queue.length > 0) {
    const current = queue.shift();
    const currentRow = current[0];
    const currentCol = current[1];
    const hash = `${currentRow}, ${currentCol}`;
    if (
      currentRow < 0 ||
      currentRow > 15 ||
      currentCol < 0 ||
      currentCol > 15 ||
      visited.has(hash)
    ) {
      continue;
    }
    visited.add(hash);
    const currentSquare = $(`#square-${currentRow}-${currentCol}`);
    const newColor = $(currentSquare).css('background-color');
    if (newColor !== currentColor) {
      continue;
    }
    appStore.currentActions.push({
      row: currentRow,
      col: currentCol,
      color: newColor,
    });

    appStore.updateCurrentDrawing(currentRow, currentCol, appStore.paintColor);
    $(currentSquare).css('background-color', appStore.paintColor);
    $(currentSquare).addClass('blink');

    queue.push([currentRow - 1, currentCol]);
    queue.push([currentRow + 1, currentCol]);
    queue.push([currentRow, currentCol - 1]);
    queue.push([currentRow, currentCol + 1]);

  }
  appStore.addToUndoStack(appStore.currentActions);
  appStore.clearRedoStack();
  for (let action of appStore.currentActions) {
    setTimeout(() => $(`#square-${action.row}-${action.col}`).removeClass('blink'), 1000);
  }
  appStore.resetCurrentActions();
}

function getCurrentPaintColorRGB(color) {
  const testElement = document.createElement('div');
  testElement.style.backgroundColor = color;
  document.body.appendChild(testElement);
  $(testElement).css('background-color', color);
  const rgb = $(testElement).css('background-color');
  document.body.removeChild(testElement);

  return rgb;
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

async function shareImage() {
  appStore.initCanvas();

  appStore.canvas.toBlob(function (blob) {
    const file = new File([blob], '8bitPaint.jpeg', { type: 'image/jpeg' });

    if (!navigator.canShare) {
      const base64url = URL.createObjectURL(blob);
      saveAs(base64url, '8bit_paint' + '?' + new Date().getTime() + ".jpeg");
      return;
    }
    if (!navigator.canShare({ files: [file] })) {
      const base64url = URL.createObjectURL(blob);
      saveAs(base64url, '8bit_paint' + '?' + new Date().getTime() + ".jpeg");
      return;
    }

    navigator.share({
      title: '8bit Paint',
      text: 'Check out my 8bit Paint!',
      files: [file],
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  }, 'image/jpeg', 1);
};

function handleTouchMove(touchElement) {
  if ($(touchElement).hasClass('square')) {
    [_, row, col] = touchElement.id.split('-');
    if (appStore.currentVisitedNodes.has(`${row}, ${col}`)) {
      return;
    };
    appStore.addToCurrentVisitedNodes(`${row}, ${col}`);
    appStore.addToCurrentActions({ row, col, color: appStore.currentDrawing[row][col] });
    $(touchElement).css('background-color', appStore.paintColor);
    $(touchElement).addClass('blink');
    appStore.updateCurrentDrawing(row, col, appStore.paintColor);

    setTimeout(() => {
      $(touchElement).removeClass('blink');
    }, 1000);

  }
  else {
    if ($(touchElement).hasClass('container-square')) {
      $(touchElement).addClass('flash');
      setTimeout(() => $(touchElement).removeClass('flash'), 1000);
    }
  }
}