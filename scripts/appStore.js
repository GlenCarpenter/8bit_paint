var appStore = {
  mouseIsDown: false,
  isRightClick: false,
  pourMode: false,
  paintMode: 'brush',
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
      localStorage.setItem('grid', true);
    } else {
      $(".container-square").removeClass("grid");
      localStorage.setItem("grid", false);
    }
  },
  initGridCheckbox: function () {
    this.grid = localStorage.getItem('grid') === 'true';
    $("#checkbox").prop("checked", this.grid);
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
  setPaintMode: function (mode) {
    this.paintMode = mode;
    this.pourMode = mode !== 'brush';
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
    currentSquare.removeClass('blink');
    void currentSquare[0].offsetWidth;
    currentSquare.addClass('blink');
    setTimeout(() => currentSquare.removeClass('blink'), 1000);
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
        if (this.grid) {
          $(containerSquare).addClass("grid");
        }
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
  currentPaletteIndex: 0,
  loadPalette: function (index) {
    this.currentPaletteIndex = index;
    const palette = palettes[index];
    const row1 = $("#palette-row-1");
    const row2 = $("#palette-row-2");
    row1.empty();
    row2.empty();
    $("#palette-label").text(palette.name);
    const half = Math.ceil(palette.colors.length / 2);
    palette.colors.forEach(function (color, i) {
      const el = $("<div>").addClass("color-container").css("background-color", color);
      if (color.toLowerCase() === appStore.paintColor.toLowerCase()) {
        el.addClass("selected-color");
      }
      if (color.toLowerCase() === appStore.secondaryPaintColor.toLowerCase()) {
        el.addClass("selected-secondary-color");
      }
      if (i < half) { row1.append(el); } else { row2.append(el); }
    });
  },
  nextPalette: function () {
    var next = (this.currentPaletteIndex + 1) % palettes.length;
    this.loadPalette(next);
  },
  prevPalette: function () {
    var prev = (this.currentPaletteIndex - 1 + palettes.length) % palettes.length;
    this.loadPalette(prev);
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
      "#ff91af", // Baker Miller Pink
      "#b0b0b8",
    ],
  },
  {
    name: "Greatbit",
    colors: [
      "#000000",
      "#9c9c9c",
      "#be2633",
      "#e06f8b",
      "#493c2b",
      "#a46422",
      "#eb8931",
      "#f7e26b",
      "#ffffff",
      "#2f484e",
      "#44891a",
      "#a3ce27",
      "#1b2632",
      "#005784",
      "#31a2f2",
      "#b2dcef",
    ],
  },

  // NES PPU — a hand-picked 16 from the NES 54-color composite palette
  {
    name: "NES",
    colors: [
      "#000000", // black
      "#7c7c7c", // dark gray
      "#bcbcbc", // light gray
      "#ffffff", // white
      "#f83800", // red-orange
      "#fc7460", // salmon
      "#a81000", // dark red
      "#e40058", // crimson
      "#d800cc", // magenta
      "#6030e0", // purple
      "#0000fc", // blue
      "#0078f8", // sky blue
      "#3cbcfc", // light blue
      "#00b800", // green
      "#00a844", // teal-green
      "#f8b800", // gold
    ],
  },

  // Super Mario Bros. 1 (1985)
  // Overworld sky blues, Mario's reds, brick oranges, underground blacks,
  // castle grays, Goomba browns, pipe greens, coin golds
  {
    name: "Super Mario Bros.",
    colors: [
      "#000000", // black (underground bg, text)
      "#5c94fc", // sky blue (overworld bg)
      "#84b4fc", // light sky blue (cloud highlights)
      "#fcfcfc", // white (clouds, text)
      "#fc2404", // Mario red (hat, shirt)
      "#843000", // Mario brown (skin tone on NES)
      "#fc9838", // brick orange (ground blocks)
      "#ac7c00", // dark gold (brick shading)
      "#fcbc3c", // coin gold
      "#008000", // pipe green
      "#00b800", // bright pipe green / flag
      "#3cbcfc", // underwater blue
      "#7c7c7c", // castle gray
      "#bcbcbc", // light gray (clouds, castle highlight)
      "#503000", // Goomba dark brown
      "#d04000", // Goomba medium brown
    ],
  },

  // Super Mario Bros. 2 (1988)
  // Pastel dreamworld palette — very different from SMB1.
  // Subcon world pinks, the Arabian Nights vibe, Birdo reds, Wart greens
  {
    name: "Super Mario Bros. 2",
    colors: [
      "#000000", // black
      "#fcfcfc", // white
      "#5c94fc", // sky blue
      "#f878f8", // pink bg (dream world)
      "#b800b8", // deep magenta (Birdo)
      "#fc74b4", // light pink (Birdo highlight)
      "#f83800", // vivid red (enemies, hearts)
      "#f8b800", // warm yellow (desert, coins)
      "#d87800", // dark gold / sandy brown
      "#503000", // dark earth brown
      "#00a800", // grass green
      "#004400", // dark green (bushes)
      "#0058f8", // Wart blue
      "#3cbcfc", // light blue (waterfall)
      "#787878", // gray (stone)
      "#bcbcbc", // light gray (platforms)
    ],
  },

  // Super Mario Bros. 3 (1988)
  // Richest NES palette of the trilogy — map screen greens, Tanooki browns,
  // fortress reds, ice world blues, the iconic dark map navy
  {
    name: "Super Mario Bros. 3",
    colors: [
      "#000000", // black
      "#1c1c84", // map screen dark navy
      "#0058f8", // blue (sky, water)
      "#84d8fc", // pale blue (ice world)
      "#fcfcfc", // white (snow, clouds)
      "#f83800", // Mario red
      "#fc7460", // light red / skin
      "#f8b800", // gold / coin
      "#c84c0c", // Tanooki brown
      "#503000", // dark earth
      "#00a800", // overworld map green
      "#006800", // dark map green
      "#00fcfc", // cyan (ice highlight, P-meter)
      "#7c7c7c", // fortress gray
      "#fcbcb0", // pink (Toad houses, mushroom)
      "#940000", // fortress dark red / lava
    ],
  },

  // Game Boy Color — "Brown" hardware palette (background + sprites, 12 unique colors + 4 extras)
  {
    name: "Game Boy Color",
    colors: [
      "#000000", // black
      "#2d1b00", // very dark brown
      "#6b3300", // dark brown
      "#c86800", // medium brown
      "#e8a000", // amber
      "#f8d000", // gold
      "#f8f888", // pale yellow
      "#ffffff", // white
      "#003800", // dark green
      "#006800", // medium green
      "#40a860", // muted green
      "#98d878", // light green
      "#0000a8", // dark blue
      "#1878c8", // medium blue
      "#80c0f8", // light blue
      "#d0e8f8", // near-white blue
    ],
  },
    // Windows CGA/EGA/VGA system palette (classic 16-color text mode)
  {
    name: "Windows CGA",
    colors: [
      "#000000", // black
      "#800000", // maroon
      "#008000", // green
      "#808000", // olive
      "#000080", // navy
      "#800080", // purple
      "#008080", // teal
      "#c0c0c0", // silver
      "#808080", // gray
      "#ff0000", // red
      "#00ff00", // lime
      "#ffff00", // yellow
      "#0000ff", // blue
      "#ff00ff", // fuchsia
      "#00ffff", // aqua
      "#ffffff", // white
    ],
  },

  // Apple Macintosh System 4.1 (1987) — the original Mac II 16-color palette
  {
    name: "MacSystem",
    colors: [
      "#ffffff", // white
      "#fbf305", // yellow
      "#ff6403", // orange
      "#dd0907", // red
      "#f20884", // magenta
      "#4700a5", // purple
      "#0000d3", // blue
      "#02abea", // cyan
      "#1fb714", // green
      "#006412", // dark green
      "#562c05", // brown
      "#90713a", // tan
      "#c0c0c0", // light grey
      "#808080", // medium grey
      "#404040", // dark grey
      "#000000", // black
    ],
  },

  // Acorn RISC OS default 16-color palette
  {
    name: "RiscOS",
    colors: [
      "#ffffff", // white
      "#dddddd", // grey 1
      "#bbbbbb", // grey 2
      "#999999", // grey 3
      "#777777", // grey 4
      "#555555", // grey 5
      "#333333", // grey 6
      "#000000", // black
      "#004499", // dark blue
      "#eedd00", // yellow
      "#00bb00", // green
      "#ee0000", // red
      "#ddbb88", // beige
      "#005500", // dark green
      "#ffaa00", // gold/orange
      "#99ccff", // light blue
    ],
  },

  // Solaris OS 16-color system palette
  {
    name: "Solaris",
    colors: [
      "#000000", // black
      "#aa0000", // red
      "#00aa00", // green
      "#aa5500", // brown
      "#0000aa", // blue
      "#aa00aa", // magenta
      "#00aaaa", // cyan
      "#aaaaaa", // gray
      "#555555", // dark gray
      "#ff5555", // pink
      "#55ff55", // pale green
      "#ffff55", // yellow
      "#5555ff", // slate blue
      "#da70d6", // orchid
      "#7fffd4", // aquamarine
      "#ffffff", // white
    ],
  },

  // IBM CGA (1981) — the canonical 16-color RGBI palette
  // Colors use the "rule of thirds" mapping: 0=0x00, dim=0xAA, bright=0xFF
  // Color 6 is brown (not dark yellow) — IBM's intentional exception
  {
    name: "IBM CGA",
    colors: [
      "#000000", // 0  black
      "#0000aa", // 1  dark blue
      "#00aa00", // 2  dark green
      "#00aaaa", // 3  dark cyan
      "#aa0000", // 4  dark red
      "#aa00aa", // 5  dark magenta
      "#aa5500", // 6  brown (not dark yellow!)
      "#aaaaaa", // 7  light gray
      "#555555", // 8  dark gray
      "#5555ff", // 9  bright blue
      "#55ff55", // 10 bright green
      "#55ffff", // 11 bright cyan
      "#ff5555", // 12 bright red
      "#ff55ff", // 13 bright magenta
      "#ffff55", // 14 yellow
      "#ffffff", // 15 white
    ],
  },

  // Acorn BBC Micro (1981) — 8 solid hardware colors (3-bit RGB via Video ULA)
  // Mode 2 supports 16 entries: 8 solid + 8 flashing (same hues, alternating with black)
  // Here: 8 solids + their "flash partner" intermediate tones for a useful 16-color set
  {
    name: "Acorn BBC Micro",
    colors: [
      "#000000", // black
      "#ff0000", // red
      "#00ff00", // green
      "#ffff00", // yellow
      "#0000ff", // blue
      "#ff00ff", // magenta
      "#00ffff", // cyan
      "#ffffff", // white
      // Flash-mode interpretations / intermediate shades useful for pixel art
      "#550000", // dark red
      "#005500", // dark green
      "#555500", // dark yellow/olive
      "#000055", // dark blue
      "#550055", // dark magenta
      "#005555", // dark cyan
      "#555555", // dark gray
      "#aaaaaa", // light gray
    ],
  },
  // Commodore 64 (1982) — VIC-II chip, 16 fixed colors, no palette control
  // One of the most recognizable palettes in computing history
  {
    name: "Commodore 64",
    colors: [
      "#000000", // black
      "#ffffff", // white
      "#883932", // red
      "#67b6bd", // cyan
      "#8b3f96", // purple
      "#55a049", // green
      "#40318d", // blue
      "#bfce72", // yellow
      "#8b5429", // orange
      "#574200", // brown
      "#b86962", // light red
      "#505050", // dark gray
      "#787878", // mid gray
      "#94e089", // light green
      "#7869c4", // light blue
      "#9f9f9f", // light gray
    ],
  },

  // Apple II (1977) — NTSC artifact color palette (hi-res mode)
  // Colors are "accidents" of NTSC encoding — notoriously strange
  {
    name: "Apple II",
    colors: [
      "#000000", // black
      "#6e2af5", // dark blue (violet)
      "#008a1e", // dark green
      "#9eabb7", // light blue-gray
      "#7e2a00", // dark brown
      "#9d9d9d", // medium gray
      "#ff6a3c", // orange
      "#ffd5cb", // light pink
      "#005e45", // dark teal
      "#0096ff", // medium blue
      "#00ff6b", // light green
      "#b6c3ff", // pale blue
      "#ff3b5e", // pink-red
      "#ffa600", // yellow-orange
      "#f4fc00", // yellow
      "#ffffff", // white
    ],
  },

  // Pico-8 fantasy console (2015) — beloved indie dev palette
  // Designed for maximum charm in 16 colors
  {
    name: "Pico-8 fantasy",
    colors: [
      "#000000", // black
      "#1d2b53", // dark navy
      "#7e2553", // dark maroon
      "#008751", // dark green
      "#ab5236", // brown
      "#5f574f", // dark gray
      "#c2c3c7", // light gray
      "#fff1e8", // warm white
      "#ff004d", // bright red
      "#ffa300", // orange
      "#ffec27", // yellow
      "#00e436", // bright green
      "#29adff", // sky blue
      "#83769c", // slate purple
      "#ff77a8", // pink
      "#ffccaa", // peach
    ],
  },

  // Amstrad CPC (1984) — 27-color hardware palette, here's the iconic default 16
  // Known for its vivid, saturated look distinct from Spectrum and C64
  {
    name: "Amstrad CPC",
    colors: [
      "#000000", // black
      "#ff0000", // bright red
      "#ffff00", // bright yellow
      "#00ff00", // bright green
      "#00ffff", // bright cyan
      "#0000ff", // bright blue
      "#ff00ff", // bright magenta
      "#ffffff", // white
      "#7f0000", // dark red
      "#7f7f00", // dark yellow
      "#007f00", // dark green
      "#007f7f", // dark cyan
      "#00007f", // dark blue
      "#7f007f", // dark magenta
      "#7f7f7f", // gray
      "#ff7f00", // orange
    ],
  },

  // DOOM (1993) — id Software's iconic dark hellish palette (16 representative picks)
  // Pulled from the WAD's 256-color PLAYPAL — heavy on reds, browns, and sickly greens
  {
    name: "DOOM",
    colors: [
      "#000000", // void black
      "#1c1c1c", // near black
      "#3c3c3c", // dark gray
      "#747474", // mid gray
      "#9c9c9c", // light gray
      "#8c0000", // dark blood red
      "#c40000", // blood red
      "#fc0000", // bright red
      "#fc7c00", // fire orange
      "#fcfc00", // caution yellow
      "#4c2800", // dark brown
      "#7c5000", // mid brown
      "#003800", // dark sewer green
      "#005c00", // demon green
      "#0000a8", // darkness blue
      "#6464fc", // plasma blue
    ],
  },

  // Windows 3.1 (1990) — the default 16-color system palette most people grew up with
  // Matches the CGA palette with the classic Win3.1 UI colors
  {
    name: "Windows 3.1",
    colors: [
      "#000000", // black
      "#808080", // gray (window shadows)
      "#c0c0c0", // silver (window chrome)
      "#ffffff", // white
      "#800000", // maroon
      "#ff0000", // red
      "#808000", // olive
      "#ffff00", // yellow
      "#008000", // green
      "#00ff00", // lime
      "#008080", // teal
      "#00ffff", // aqua
      "#000080", // navy
      "#0000ff", // blue
      "#800080", // purple
      "#ff00ff", // fuchsia
    ],
  },
  {
    name: "Thrift Shop",
    colors: [
      "#FF6839",
      "#FFC713",
      "#749039",
      "#6B83BB",
      "#8B6DA6",
      "#B34928",
      "#B38B00",
      "#516E28",
      "#4B5C83",
      "#614C74",
      "#662A17",
      "#665005",
      "#2E3F17",
      "#2B344B",
      "#382C42",
      "#190806",
    ],
  },{
    name: "Oakland Sun",
    colors: [
      "#E37371", // coral pink (kept)
      "#9E52E0", // purple (kept)
      "#E8A030", // warm amber — new, sunrise gold
      "#4DB87A", // fresh green — new, Bay Area eucalyptus
      "#1F8BC4", // sky blue (kept)
      "#F0C060", // pale gold — new, afternoon haze
      "#C51C8B", // magenta (kept)
      "#3AB8B0", // teal — new, replaces a dark purple dupe
      "#8A1461", // deep magenta (kept)
      "#166189", // dark blue (kept)
      "#A05C10", // burnt orange — new, replaced dark maroon dupe
      "#1A7A4A", // dark green — new
      "#6F399D", // mid purple (kept)
      "#0F6162", // dark teal (kept)
      "#4F0B35", // near-black magenta (kept)
      "#100816", // near-black (kept)
    ],
  },
  {
    name: "Shibuya Night",
    colors: [
      "#50D8DC", // cyan (kept)
      "#E66926", // orange (kept)
      "#C840A0", // hot pink/magenta — new, neon sign energy
      "#78D858", // acid green — new, pachinko glow
      "#F0D020", // electric yellow — new, taxi / vending machine
      "#419296", // muted teal (kept)
      "#A93636", // dark red (kept)
      "#38579A", // deep blue — new, rainy reflections
      "#205658", // dark teal (kept)
      "#A1601B", // dark orange (kept)
      "#7A2870", // dark magenta — new, replaces near-dupe teal
      "#3A6830", // dark green — new
      "#1A3A3C", // near-black teal (kept)
      "#441616", // near-black red (kept)
      "#022026", // darkest teal (kept)
      "#081616", // near-black (kept)
    ],
  },
]


