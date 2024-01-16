var appStore = {
  mouseIsDown: false,
  isRightClick: false,
  pourMode: false,
  paintColor: "#000000",
  secondaryPaintColor: "#ffffff",
  currentVisitedNodes: new Set(),
  undoStack: [],
  redoStack: [],
  currentActions: [],
  currentDrawing: [],
  canvas: document.getElementById("colorBoxCanvas"),
  grid: true,
  toggleGrid: function () {
    this.grid = !this.grid;
    if (this.grid) {
      $('.container-square').addClass('grid');
    } else {
      $(".container-square").removeClass("grid");
    }
    this.initCanvas();
  },
  setMouseIsDown: function (mouseIsDown) {
    this.mouseIsDown = mouseIsDown;
  },
  setIsRightClick: function (isRightClick) {
    this.isRightClick = isRightClick;
  },
  setPourMode: function (pourMode) {
    this.pourMode = pourMode;
  },
  setPaintColor: function (color) {
    this.paintColor = color;
  },
  setSecondaryPaintColor: function (color) {
    this.secondaryPaintColor = color;
  },
  resetCurrentVisitedNodes: function (visitedNodes) {
    this.currentVisitedNodes = new Set();
  },
  setCurrentVisitedNodes: function (visitedNodes) {
    this.currentVisitedNodes = visitedNodes;
  },
  addToCurrentVisitedNodes: function (node) {
    this.currentVisitedNodes.add(node);
  },
  setCurrentActions: function (actions) {
    this.currentActions = actions;
  },
  addToCurrentActions: function (action) {
    this.currentActions.push(action);
  },
  resetCurrentActions: function () {
    this.currentActions = new Array();
  },
  addToUndoStack: function (actions) {
    if (this.undoStack.length === 500) {
      this.undoStack.shift();
    }
    this.undoStack.push(actions);
    localStorage.setItem("undoStack", JSON.stringify(this.undoStack));
    $("#btn-undo").prop("disabled", false);
  },
  getUndoAction: function () {
    undoAction = this.undoStack.pop();
    localStorage.setItem("undoStack", JSON.stringify(this.undoStack));
    return undoAction;
  },
  addToRedoStack: function (actions) {
    this.redoStack.push(actions);
    localStorage.setItem("redoStack", JSON.stringify(this.redoStack));
    $("#btn-redo").prop("disabled", false);
  },
  getRedoAction: function () {
    redoAction = this.redoStack.pop();
    localStorage.setItem("redoStack", JSON.stringify(this.redoStack));
    return redoAction;
  },
  clearRedoStack: function () {
    this.redoStack = [];
    localStorage.setItem("redoStack", JSON.stringify(this.redoStack));
    $("#btn-redo").prop("disabled", true);
  },
  saveCurrentDrawing: function () {
    localStorage.setItem('currentDrawing', JSON.stringify(this.currentDrawing));
  },
  loadCurrentDrawing: function () {
    if (localStorage.getItem('currentDrawing')) {
      this.currentDrawing = JSON.parse(localStorage.getItem('currentDrawing'));
      return;
    }
    this.initCurrentDrawing();
  },
  updateCurrentDrawing: function (row, col, color) {
    this.currentDrawing[row][col] = color;
    this.saveCurrentDrawing();
  },
  initCurrentDrawing: function () {
    const initialDrawing = [];
    for (let i = 0; i < 16; i++) {
      initialDrawing[i] = [];
      for (let j = 0; j < 16; j++) {
        initialDrawing[i][j] = "#ffffff";
      }
    }
    localStorage.setItem("currentDrawing", JSON.stringify(initialDrawing));
    this.currentDrawing = initialDrawing;
  },
  initCanvas: function () {
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.currentDrawing[i][j];
        ctx.fillRect(j * 25, i * 25, 25, 25);
      }
    }
    if (this.grid) {
      const ctx = this.canvas.getContext("2d");
      for (let i = 1; i < 16; i++) {
        // Draw rows
        ctx.beginPath();
        ctx.moveTo(0, i * 25);
        ctx.lineTo(400, i * 25);
        ctx.strokeStyle = "#202124";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw columns
        ctx.beginPath();
        ctx.moveTo(i * 25, 0);
        ctx.lineTo(i * 25, 400);
        ctx.strokeStyle = "#202124";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  },
  initUndoStack: function () {
    const storedRedoStack = localStorage.getItem('undoStack');
    if (storedRedoStack) {
      this.undoStack = JSON.parse(storedRedoStack);
      if (this.undoStack.length === 0) {
        $("#btn-undo").prop("disabled", true);
      }
      return;
    }
    const initialUndoStack = [];
    localStorage.setItem("undoStack", JSON.stringify(initialUndoStack));
    this.undoStack = initialUndoStack;
    $("#btn-undo").prop("disabled", true);
  },
  initRedoStack: function () {
    const storedRedoStack = localStorage.getItem('redoStack');
    if (storedRedoStack) {
      this.redoStack = JSON.parse(storedRedoStack);
      if (this.redoStack.length === 0) {
        $("#btn-redo").prop("disabled", true);
      }

      return;
    }
    const initialRedoStack = [];
    localStorage.setItem("redoStack", JSON.stringify(initialRedoStack));
    this.redoStack = initialRedoStack;
    $("#btn-redo").prop("disabled", true);
  },
  undo: function () {
    if (this.undoStack.length > 0) {
      $("#btn-undo").prop('disabled', true);
      const lastAction = this.getUndoAction();
      const currentStateAction = lastAction.map(action => {
        return {
          row: action.row,
          col: action.col,
          color: this.currentDrawing[action.row][action.col],
        };
      });
      this.addToRedoStack(currentStateAction);
      this.revertAction(lastAction);
      $("#btn-undo").prop('disabled', false);
    }
    if (this.undoStack.length === 0) {
      $("#btn-undo").prop('disabled', true);
    }
  },
  redo: function () {
    if (this.redoStack.length > 0) {
      $("#btn-redo").prop('disabled', true);
      const lastAction = this.getRedoAction();
      const currentStateAction = lastAction.map(action => {
        return {
          row: action.row,
          col: action.col,
          color: this.currentDrawing[action.row][action.col],
        };
      });
      this.addToUndoStack(currentStateAction);
      this.revertAction(lastAction);
      $("#btn-redo").prop('disabled', false);
    }
    if (this.redoStack.length === 0) {
      $("#btn-redo").prop('disabled', true);
    }
  },
  revertAction: function (lastAction) {
    for (let action of lastAction) {
      this.colorSquare(action.row, action.col, action.color);
    }
    this.saveCurrentDrawing();
  },
  colorSquare: function (row, col, color) {
    const currentSquare = $("#square-" + row + "-" + col);
    $(currentSquare).css('background-color', color);
    $(currentSquare).addClass('blink');
    setTimeout(() => $(currentSquare).removeClass('blink'), 1000);
    appStore.updateCurrentDrawing(row, col, color);
  },
  initColorBox: function initColorBox() {
    for (let i = 0; i < 16; i++) {
      const row = document.createElement("div");
      row.id = "row-" + i;
      $(row).addClass("row");

      for (let j = 0; j < 16; j++) {
        const containerSquare = document.createElement("div");
        containerSquare.id = "containerSquare-" + i + "-" + j;
        $(containerSquare).addClass("container-square");
        $(containerSquare).addClass("grid");

        const square = document.createElement("div");
        square.id = "square-" + i + "-" + j;
        $(square).addClass("square");
        $(square).css("background-color", this.currentDrawing[i][j]);
        $(containerSquare).append(square);
        $(row).append(containerSquare);
      }
      $("#colorBox").append(row);
    }
  }
};





