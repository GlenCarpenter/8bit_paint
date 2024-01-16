var paintColor = "#000000";
var secondaryPaintColor = "#ffffff";

$(document).ready(function () {
  $("#start-button-message").text("Tap here to start!");
  // Remove overlay
  $(".loading-overlay").on("click", function () {
    $("#overlay").remove();
  });

  var mouseIsDown = false;
  var isRightClick = false;
  var pourMode = false;
  var currentVisitedNodes = new Set();

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
    if (currentActions.length > 0 && !pourMode) {
      addToUndoStack(currentActions);
      clearRedoStack();
    }
    resetCurrentActions();
    saveCurrentDrawing();
    currentVisitedNodes = new Set();
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
          currentRect = touchElement && touchElement.getBoundingClientRect();
          if (touchElement) {
            if ($(touchElement).hasClass('square')) {
              [_, row, col] = touchElement.id.split('-');
              if (currentVisitedNodes.has(`${row}, ${col}`)) {
                return;
              };
              currentVisitedNodes.add(`${row}, ${col}`);
              currentActions.push({ row, col, color: currentDrawing[row][col] });
              $(touchElement).css('background-color', paintColor);
              $(touchElement).addClass('blink');
              currentDrawing[row][col] = paintColor;

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
          break;
        case "mouseover":
          if ($(this).hasClass('square')) {
            [_, row, col] = this.id.split('-');
            currentActions.push({ row, col, color: currentDrawing[row][col] });
            $(this).css('background-color', isRightClick ? secondaryPaintColor : paintColor);
            currentDrawing[row][col] = isRightClick ? secondaryPaintColor : paintColor;
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
    var newColor = e.which == 3 ? secondaryPaintColor : paintColor;
    [_, row, col] = this.id.split('-');

    if (pourMode) {
      var currentColor = $(this).css('background-color');

      // Need to get RGB of current paintcolor
      var testColor = getCurrentPaintColorRGB(newColor);
      if (currentColor === testColor) return;

      paintNeighbors(parseInt(row), parseInt(col), newColor, currentColor);

      return;
    }

    currentVisitedNodes.add(`${row}, ${col}`);
    currentActions.push({ row, col, color: currentDrawing[row][col] });

    currentDrawing[row][col] = newColor;
    $(this).css('background-color', newColor);
    $(this).addClass('blink');
    setTimeout(() => $(this).removeClass('blink'), 1000);
  });

  $('input[type=checkbox]').on('change', function (e) {
    $('.container-square').toggleClass('grid');
  });

  $('.colorSquare').on('contextmenu', function (e) {
    e.preventDefault();
    secondaryPaintColor = $(this).css('background-color');
  });

  $('.colorSquare').on('click', function (e) {
    $('.colorSquare').removeClass('selectedColorSquare');
    $('#colorField').css('background-color', '#000000');
    $(this).toggleClass('selectedColorSquare');
  });

  // Event listener for click of save button
  $("#btnSave").on("click", function () {
    $("#btnSave").addClass('blink');
    setTimeout(() => $("#btnSave").removeClass('blink'), 1000);
    html2canvas(document.querySelector('#colorBox')).then(function (canvas) {
      if (!navigator.canShare) {
        saveAs(canvas.toDataURL(), '8bit_paint.png' + '?' + new Date().getTime());
        return;
      }

      shareImage(canvas.toDataURL());
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
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        let action = { row, col, color: currentDrawing[row][col] };
        currentActions.push(action);
      }
    }
    addToUndoStack(currentActions);
    clearRedoStack();
    resetCurrentActions();
    initializeDrawing();
    $("#clearCanvas").addClass('blink');
    $(".container-square").addClass('blink');
    setTimeout(() => {
      $("#clearCanvas").removeClass('blink');
      $(".container-square").removeClass('blink');
    }, 1000);
    $(".square").css('background-color', '#ffffff');
  });

  $("#btn-undo").on("click", function () {
    undo();
    $("#btn-undo").addClass('blink');
    setTimeout(() => {
      $("#btn-undo").removeClass('blink');
    }, 1000);
  });

  $("#btn-redo").on("click", function () {
    redo();
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

// Paints neighbors of current square
async function paintNeighbors(row, col, paintColor, currentColor) {
  let queue = [];
  let visited = new Set();
  queue.push([row, col]);
  while (queue.length > 0) {
    let current = queue.shift();
    let currentRow = current[0];
    let currentCol = current[1];
    let hash = `${currentRow}, ${currentCol}`;
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
    var currentSquare = $(`#square-${currentRow}-${currentCol}`);
    var newColor = $(currentSquare).css('background-color');
    if (newColor !== currentColor) {
      continue;
    }
    currentActions.push({
      row: currentRow,
      col: currentCol,
      color: newColor,
    });

    currentDrawing[currentRow][currentCol] = paintColor;
    saveCurrentDrawing();
    $(currentSquare).css('background-color', paintColor);
    $(currentSquare).addClass('blink');

    queue.push([currentRow - 1, currentCol]);
    queue.push([currentRow + 1, currentCol]);
    queue.push([currentRow, currentCol - 1]);
    queue.push([currentRow, currentCol + 1]);

  }
  addToUndoStack(currentActions);
  clearRedoStack();
  for (let action of currentActions) {
    setTimeout(() => $(`#square-${action.row}-${action.col}`).removeClass('blink'), 1000);
  }
  resetCurrentActions();
}

function getCurrentPaintColorRGB(color) {
  var testElement = document.createElement('div');
  testElement.style.backgroundColor = color;
  document.body.appendChild(testElement);
  $(testElement).css('background-color', color);
  var rgb = $(testElement).css('background-color');
  document.body.removeChild(testElement);

  return rgb;
}

function undo() {
  if (undoStack.length > 0) {
    var lastAction = undoStack.pop();
    var currentStateColor = $(`#square-${lastAction[0].row}-${lastAction[0].col}`).css('background-color');
    var currentStateAction = lastAction.map(action => {
      return {
        row: action.row,
        col: action.col,
        color: currentStateColor,
      };
    });
    addToRedoStack(currentStateAction);
    revertAction(lastAction);
    localStorage.setItem('undoStack', JSON.stringify(undoStack));
    localStorage.setItem('redoStack', JSON.stringify(redoStack));
    if (undoStack.length === 0) {
      $("#btn-undo").prop('disabled', true);
    }
  }
}

function redo() {
  if (redoStack.length > 0) {
    var lastAction = redoStack.pop();
    var currentStateColor = $(`#square-${lastAction[0].row}-${lastAction[0].col}`).css('background-color');
    var currentStateAction = lastAction.map(action => {
      return {
        row: action.row,
        col: action.col,
        color: currentStateColor,
      };
    });
    addToUndoStack(currentStateAction);
    revertAction(lastAction);
    localStorage.setItem('undoStack', JSON.stringify(undoStack));
    localStorage.setItem('redoStack', JSON.stringify(redoStack));
    if (redoStack.length === 0) {
      $("#btn-redo").prop('disabled', true);
    }
  }
}

function revertAction(lastAction) {
  for (let action of lastAction) {
    colorSquare(action.row, action.col, action.color);
  }
  saveCurrentDrawing();
}

function colorSquare(row, col, color) {
  var currentSquare = $("#square-" + row + "-" + col);
  $(currentSquare).css('background-color', color);
  $(currentSquare).addClass('blink');
  setTimeout(() => $(currentSquare).removeClass('blink'), 1000);
  currentDrawing[row][col] = color;
}

async function shareImage(base64url) {
  const blob = await (await fetch(base64url)).blob();
  const file = new File([blob], '8bitPaint.png', { type: 'image/png' });

  navigator.share({
    title: '8bit Paint',
    text: 'Check out my 8bit Paint!',
    files: [file],
  })
    .then(() => console.log('Successful share'))
    .catch((error) => console.log('Error sharing', error));
} 