// Confirm back button
window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
});

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

// Initialize undo and redo stacks
localStorage.setItem("undoStack", JSON.stringify(new Array()));
localStorage.setItem("redoStack", JSON.stringify(new Array()));
$("#btn-undo").prop('disabled', true);
$("#btn-redo").prop('disabled', true);

var undoStack = JSON.parse(localStorage.getItem("undoStack"));
var redoStack = JSON.parse(localStorage.getItem("redoStack"));
var currentActions = [];

var resetCurrentActions = function () {
  currentActions = [];
};

// Add to undo stack
var addToUndoStack = function (action) {
  undoStack.push(action);
  localStorage.setItem("undoStack", JSON.stringify(undoStack));
  $("#btn-undo").prop("disabled", false);
};

// Add to redo stack
var addToRedoStack = function (action) {
  redoStack.push(action);
  localStorage.setItem("redoStack", JSON.stringify(redoStack));
  $("#btn-redo").prop("disabled", false);
};

// Clear redo stack
var clearRedoStack = function (action) {
  redoStack = [];
  localStorage.setItem("redoStack", JSON.stringify(redoStack));
  $("#btn-redo").prop("disabled", true);
};

// Initialize drawing
var initializeDrawing = function () {
  var initialDrawing = [];
  for (var i = 0; i < 16; i++) {
    initialDrawing[i] = [];
    for (var j = 0; j < 16; j++) {
      initialDrawing[i][j] = "#ffffff";
    }
  }
  localStorage.setItem("currentDrawing", JSON.stringify(initialDrawing));
};

if (!localStorage.getItem("currentDrawing")) {
  initializeDrawing();
}

// Get current drawing from local storage
var currentDrawing = JSON.parse(localStorage.getItem("currentDrawing"));

// Save current drawing to local storage
var saveCurrentDrawing = function () {
  localStorage.setItem("currentDrawing", JSON.stringify(currentDrawing));
};

// Initialize color box
function initColorBox() {
  for (var i = 0; i < 16; i++) {
    var row = document.createElement("div");
    row.id = "row-" + i;
    $(row).addClass("row");

    for (var j = 0; j < 16; j++) {
      var containerSquare = document.createElement("div");
      containerSquare.id = "containerSquare-" + i + "-" + j;
      $(containerSquare).addClass("container-square");
      $(containerSquare).addClass("grid");

      var square = document.createElement("div");
      square.id = "square-" + i + "-" + j;
      $(square).addClass("square");
      $(square).css("background-color", currentDrawing[i][j]);
      $(containerSquare).append(square);
      $(row).append(containerSquare);
    }
    $("#colorBox").append(row);
  }
}

initColorBox();