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
  grid: true,
  toggleGrid: function () {
    this.grid = !this.grid;
    if (this.grid) {
      $('.container-square').addClass('grid');
    } else {
      $(".container-square").removeClass("grid");
    }
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
  initCanvas: function (canvas) {
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.currentDrawing[i][j];
        ctx.fillRect(j * 25, i * 25, 25, 25);
      }
    }
    if (this.grid) {
      const ctx = canvas.getContext("2d");
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
      $("#color-box").append(row);
    }
  },
  initPalette: function initPalette() {
    for (let palette of palettes) {
      const paletteContainer = document.getElementById("palette-container");
      $(paletteContainer).addClass("palette-container");
      const paletteName = document.createElement("div");
      $(paletteName).addClass("palette-name");
      $(paletteName).text(palette.name);
      $(paletteContainer).append(paletteName);
      for (let color of palette.colors) {
        const colorContainer = document.createElement("div");
        $(colorContainer).addClass("color-container");
        $(colorContainer).css("background-color", color);
        $(colorContainer).attr("data-color", color);
        $(paletteContainer).append(colorContainer);
      }
      $("#palette").append(paletteContainer);
    }
  }
};

const palettes = [
  {
    name: "8bit",
    colors: [
      "#000000",
      "orangered",
      "#ac581c",
      "orange",
      "#208800",
      "#1c38ac",
      "#7070fc",
      "#68605c",
      "#ffffff",
      "tomato",
      "#f8a850",
      "#f8ec20",
      "#70f828",
      "dodgerblue",
      "hotpink",
      "#b0b0b8",
    ],
  },
  {
    name: "Secondary",
    colors: [
      "#ffffff",
      "#000000",
      "#9c9c9c",
      "#be2633",
      "#e06f8b",
      "#493c2b",
      "#a46422",
      "#eb8931",
      "#f7e26b",
      "#2f484e",
      "#44891a",
      "#a3ce27",
      "#1b2632",
      "#005784",
      "#31a2f2",
      "#b2dcef",
    ],
  },
  {
    name: "Gameboy",
    colors: [
      "#ffffff",
      "#9bbc0f",
      "#8bac0f",
      "#306230",
      "#0f380f",
      "#0f380f",
      "#0f740f",
      "#306230",
      "#9bbc0f",
      "#8bac0f",
      "#306230",
      "#0f380f",
      "#0f380f",
      "#0f740f",
      "#306230",
      "#0f380f",
    ],
  },
  {
    name: "NES",
    colors: [
      "#7c7c7c",
      "#0000fc",
      "#0000bc",
      "#4428bc",
      "#940084",
      "#a80020",
      "#a81000",
      "#881400",
      "#503000",
      "#007800",
      "#006800",
      "#005800",
      "#004058",
      "#000000",
      "#000000",
      "#000000",
    ],
  },
  {
    name: "SNES",
    colors: [
      "#808080",
      "#0000ff",
      "#0000be",
      "#3f00be",
      "#8200ff",
      "#be00be",
      "#be003f",
      "#be0000",
      "#be3f00",
      "#be7f00",
      "#3fbe00",
      "#00be00",
      "#00be3f",
      "#007fbe",
      "#000000",
      "#000000",
    ],
  },
  {
    name: "Gameboy Advance",
    colors: [
      "#ffffff",
      "#000000",
      "#8b8b8b",
      "#a9a9a9",
      "#545454",
      "#fcfcfc",
      "#a4a4a4",
      "#7c7c7c",
      "#545454",
      "#383838",
      "#1c1c1c",
      "#000000",
      "#fcfcfc",
      "#a4a4a4",
      "#7c7c7c",
      "#545454",
    ],
  },
]


