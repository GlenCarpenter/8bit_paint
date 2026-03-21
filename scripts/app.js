appStore.initGridCheckbox();
appStore.loadCurrentDrawing();
appStore.initColorBox();
appStore.resetCurrentVisitedNodes();
appStore.resetCurrentActions();
appStore.initUndoStack();
appStore.initRedoStack();
appStore.loadPalette(0);

function getPickerWidth() {
  return window.matchMedia('(max-width: 450px)').matches ? 220 : 260;
}

function initIroColorPicker() {
  if (typeof iro === 'undefined') {
    return null;
  }

  const pickerElement = document.getElementById('color-picker');
  if (!pickerElement) {
    return null;
  }

  const colorPicker = new iro.ColorPicker('#color-picker', {
    width: getPickerWidth(),
    color: appStore.paintColor,
    borderWidth: 1,
    borderColor: '#000000',
    wheelLightness: false,
    layout: [
      {
        component: iro.ui.Wheel,
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'value',
        }
      }
    ]
  });

  let syncingFromPalette = false;
  colorPicker.on('color:change', function (color) {
    appStore.setPaintColor(color.hexString);
    $('#custom-color-trigger').css('background-color', color.hexString);
    localStorage.setItem('customColor', color.hexString);
    if (!syncingFromPalette) {
      $('.color-container').removeClass('selected-color');
      $('#custom-color-trigger').addClass('selected-color');
    }
  });

  window.addEventListener('resize', function () {
    colorPicker.resize(getPickerWidth());
  }, { passive: true });

  return {
    setColor: function (color) {
      syncingFromPalette = true;
      colorPicker.color.set(color);
      syncingFromPalette = false;
    },
    getCurrentColor: function () {
      return colorPicker.color.hexString;
    }
  };
}

$(document).ready(function () {
  const customColorPicker = initIroColorPicker();
  const customColorDialog = document.getElementById('custom-color-dialog');
  const customColorTrigger = document.getElementById('custom-color-trigger');
  const openCustomColorDialogButton = document.getElementById('open-custom-color-dialog');
  const closeCustomColorDialogButton = document.getElementById('close-custom-color-dialog');

  function openCustomColorDialog() {
    if (!customColorDialog || !customColorDialog.showModal) {
      return;
    }
    if (customColorDialog.open) {
      return;
    }
    if (customColorPicker) {
      customColorPicker.setColor($(customColorTrigger).css('background-color'));
    }
    customColorDialog.showModal();
  }

  function closeCustomColorDialog() {
    if (!customColorDialog || !customColorDialog.open) {
      return;
    }
    customColorDialog.close();
  }

  if (customColorTrigger) {
    var savedCustomColor = localStorage.getItem('customColor') || appStore.paintColor;
    $(customColorTrigger).css('background-color', savedCustomColor);
    $(customColorTrigger).on('click', function () {
      appStore.setPaintColor($(customColorTrigger).css('background-color'));
      $('.color-container').removeClass('selected-color');
      $(customColorTrigger).addClass('selected-color');
    });
  }

  if (openCustomColorDialogButton) {
    $(openCustomColorDialogButton).on('click', function () {
      openCustomColorDialog();
    });
  }

  if (closeCustomColorDialogButton) {
    $(closeCustomColorDialogButton).on('click', function () {
      closeCustomColorDialog();
    });
  }

  if (customColorDialog) {
    $(customColorDialog).on('click', function (event) {
      if (event.target === customColorDialog) {
        closeCustomColorDialog();
      }
    });
  }

  $(document).on('mousedown', function (e) {
    appStore.setMouseIsDown(true);      // When mouse goes down, set isDown to true
    if (e.which == 3) {
      appStore.setIsRightClick(true);
    }
  }).on('touchstart', function () {
    appStore.setMouseIsDown(true);
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
    if (appStore.pourMode) return;
    if (appStore.mouseIsDown) {
      switch (e.type) {
        case 'touchmove':
          let touchElement;
          let currentRect;
          const touch = e.originalEvent.touches[0];
          const touchX = touch.clientX;
          const touchY = touch.clientY;

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
            const newColor = appStore.isRightClick ? appStore.secondaryPaintColor : appStore.paintColor;
            // Need to get RGB of current paintcolor
            const currentColor = $(this).css('background-color');
            const testColor = getCurrentPaintColorRGB(newColor);
            if (currentColor === testColor) {
              return;
            };

            [_, row, col] = this.id.split('-');
            appStore.currentActions.push({ row, col, color: appStore.currentDrawing[row][col] });
            $(this).css('background-color', newColor);
            appStore.updateCurrentDrawing(row, col, newColor);
            this.classList.remove('blink');
            void this.offsetWidth;
            $(this).addClass('blink');
            setTimeout(() => $(this).removeClass('blink'), 1000);
          } else {
            if ($(touchElement).hasClass('container-square')) {
              this.classList.remove('flash');
              void this.offsetWidth;
              $(this).addClass('flash');
              setTimeout(() => $(this).removeClass('flash'), 1000);
            }
          }
          break;
      }
    }
  });

  $(".square").on("click", function (e) {
    if (appStore.paintMode === 'picker') {
      var pickedColor = $(this).css('background-color');
      appStore.setPaintColor(pickedColor);
      $('#custom-color-trigger').css('background-color', pickedColor);
      localStorage.setItem('customColor', pickedColor);
      $('.color-container').removeClass('selected-color');
      $('#custom-color-trigger').addClass('selected-color');
      appStore.setPaintMode('brush');
      selectPaintTool('paint-brush');
      return;
    }
    if (appStore.pourMode) {
      var currentColor = $(this).css('background-color');
      var testColor = getCurrentPaintColorRGB(appStore.paintColor);
      if (currentColor === testColor) {
        return;
      };

      [_, row, col] = this.id.split('-');
      if (appStore.paintMode === 'fillH') {
        paintLine(parseInt(row), parseInt(col), currentColor, appStore.paintColor, 'horizontal');
      } else if (appStore.paintMode === 'fillV') {
        paintLine(parseInt(row), parseInt(col), currentColor, appStore.paintColor, 'vertical');
      } else {
        paintNeighbors(parseInt(row), parseInt(col), currentColor, appStore.paintColor);
      }
      return;
    }
  });

  $(".square").on("contextmenu", function (e) {
    if (appStore.pourMode) {
      var currentColor = $(this).css('background-color');
      var testColor = getCurrentPaintColorRGB(appStore.secondaryPaintColor);
      if (currentColor === testColor) {
        return;
      };

      [_, row, col] = this.id.split('-');
      if (appStore.paintMode === 'fillH') {
        paintLine(parseInt(row), parseInt(col), currentColor, appStore.secondaryPaintColor, 'horizontal');
      } else if (appStore.paintMode === 'fillV') {
        paintLine(parseInt(row), parseInt(col), currentColor, appStore.secondaryPaintColor, 'vertical');
      } else {
        paintNeighbors(parseInt(row), parseInt(col), currentColor, appStore.secondaryPaintColor);
      }
      return;
    }
  });

  $("#color-box").on("dragstart", function (e) {
    e.preventDefault();
  });

  $(".square").on("mousedown touchstart", function (e) {
    if (appStore.pourMode) {
      return;
    }
    e.preventDefault();
    var newColor = e.which == 3 ? appStore.secondaryPaintColor : appStore.paintColor;
    var currentColor = $(this).css('background-color');
    var testColor = getCurrentPaintColorRGB(newColor);
    if (currentColor === testColor) {
      return;
    };

    [_, row, col] = this.id.split('-');


    appStore.currentVisitedNodes.add(`${row}, ${col}`);
    appStore.currentActions.push({ row, col, color: appStore.currentDrawing[row][col] });

    appStore.updateCurrentDrawing(row, col, newColor);
    $(this).css('background-color', newColor);
    this.classList.remove('blink');
    void this.offsetWidth;
    $(this).addClass('blink');
    setTimeout(() => $(this).removeClass('blink'), 1000);
  });

  $('#checkbox').on('change', function (e) {
    appStore.toggleGrid();
  });

  function bindPaletteColorEvents() {
    $('.color-container').off('click contextmenu');
    $('.color-container').on('contextmenu', function (e) {
      e.preventDefault();
      $('.color-container').removeClass('selected-secondary-color');
      appStore.setSecondaryPaintColor($(this).css('background-color'));
      $(this).addClass('selected-secondary-color');
    });
    $('.color-container').on('click', function (e) {
      $('.color-container').removeClass('selected-color');
      $(this).toggleClass('selected-color');
      appStore.setPaintColor($(this).css('background-color'));
      if (customColorTrigger) {
        $(customColorTrigger).removeClass('selected-color');
      }
    });
  }
  bindPaletteColorEvents();

  function animatePaletteSwitch(direction, loadFn) {
    const center = document.querySelector('.palette-center');
    const inner = document.querySelector('.palette-inner');

    // Clone old content before loading new
    const oldClone = inner.cloneNode(true);
    oldClone.style.position = 'absolute';
    oldClone.style.top = '0';
    oldClone.style.left = '0';
    oldClone.style.width = '100%';

    // Load new palette
    loadFn();
    bindPaletteColorEvents();

    // Place old clone on top
    center.appendChild(oldClone);

    // Set starting positions
    const slideIn = direction === 'next' ? '100%' : '-100%';
    const slideOut = direction === 'next' ? '-100%' : '100%';
    inner.style.transform = 'translateX(' + slideIn + ')';
    oldClone.style.transform = 'translateX(0)';

    // Animate both together
    requestAnimationFrame(function () {
      inner.style.transition = 'transform 200ms ease-out';
      oldClone.style.transition = 'transform 200ms ease-out';
      inner.style.transform = 'translateX(0)';
      oldClone.style.transform = 'translateX(' + slideOut + ')';
    });

    // Clean up after animation
    oldClone.addEventListener('transitionend', function () {
      oldClone.remove();
      inner.style.transition = '';
      inner.style.transform = '';
    }, { once: true });
  }

  $('#palette-prev').on('click', function () {
    animatePaletteSwitch('prev', function () { appStore.prevPalette(); });
  });

  $('#palette-next').on('click', function () {
    animatePaletteSwitch('next', function () { appStore.nextPalette(); });
  });

  // Event listener for click of save button
  $("#btn-share").on("click", function () {
    $("#btn-share").addClass('blink');
    setTimeout(() => $("#btn-share").removeClass('blink'), 1000);
    openShareDialog();
  });

  // Share dialog filter controls
  $("#share-dialog").on("input", "input[type=range]", function () {
    applyShareFilters();
  });
  $("#share-dialog").on("change", "input[type=checkbox]", function () {
    applyShareFilters();
  });

  $("#share-reset").on("click", function () {
    $("#filter-hue").val(0);
    $("#filter-blur").val(0);
    $("#filter-invert").prop('checked', false);
    $("#filter-grayscale").prop('checked', false);
    $("#filter-saturate").val(100);
    applyShareFilters();
  });

  $("#share-send").on("click", function () {
    sendShareImage();
  });

  $("#share-dialog").on("click", function (e) {
    if (e.target === this) this.close();
  });

  // Event listeners for paint mode
  function selectPaintTool(selectedId) {
    $('.paint-style').removeClass('selected-paint-style');
    $("#" + selectedId).addClass('selected-paint-style');
    $("#" + selectedId).addClass('brush-flash');
    setTimeout(() => $("#" + selectedId).removeClass('brush-flash'), 1000);
  }

  $("#paint-bucket").on("click", function () {
    appStore.setPaintMode('pour');
    selectPaintTool('paint-bucket');
  });
  $("#paint-brush").on("click", function () {
    appStore.setPaintMode('brush');
    selectPaintTool('paint-brush');
  });
  $("#paint-fill-h").on("click", function () {
    appStore.setPaintMode('fillH');
    selectPaintTool('paint-fill-h');
  });
  $("#paint-fill-v").on("click", function () {
    appStore.setPaintMode('fillV');
    selectPaintTool('paint-fill-v');
  });

  $("#paint-picker").on("click", function () {
    appStore.setPaintMode('picker');
    selectPaintTool('paint-picker');
  });

  // Transform buttons
  $("#transform-rotate-cw").on("click", function () {
    transformGrid('rotateCW');
  });
  $("#transform-flip-h").on("click", function () {
    transformGrid('flipH');
  });
  $("#transform-flip-v").on("click", function () {
    transformGrid('flipV');
  });

  // Event listener for click of Clear button
  $("#clear-canvas").on("click", function () {
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
    $(".square").css('background-color', '#ffffff');
    $("#clear-canvas").addClass('blink');
    setTimeout(() => $("#clear-canvas").removeClass('blink'), 1000);
    rippleBlinkGrid();
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
async function paintNeighbors(row, col, currentColor, newColor) {
  let queue = [[row, col]];
  const visited = new Set();

  while (queue.length > 0) {
    const nextQueue = [];

    for (const [currentRow, currentCol] of queue) {
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
      const testColor = $(currentSquare).css('background-color');
      if (testColor !== currentColor) {
        continue;
      }
      appStore.currentActions.push({
        row: currentRow,
        col: currentCol,
        color: testColor,
      });

      appStore.updateCurrentDrawing(currentRow, currentCol, newColor);
      $(currentSquare).css('background-color', newColor);
      currentSquare[0].classList.remove('blink');
      void currentSquare[0].offsetWidth;
      $(currentSquare).addClass('blink');

      nextQueue.push([currentRow - 1, currentCol]);
      nextQueue.push([currentRow + 1, currentCol]);
      nextQueue.push([currentRow, currentCol - 1]);
      nextQueue.push([currentRow, currentCol + 1]);
    }

    queue = nextQueue;
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }

  appStore.addToUndoStack(appStore.currentActions);
  appStore.clearRedoStack();
  for (let action of appStore.currentActions) {
    setTimeout(() => $(`#square-${action.row}-${action.col}`).removeClass('blink'), 1000);
  }
  appStore.resetCurrentActions();
}

// Paints a line of matching-color cells in one direction from the clicked cell
async function paintLine(row, col, currentColor, newColor, direction) {
  // Collect cells in both directions from clicked cell
  const negative = [];
  const positive = [];

  if (direction === 'horizontal') {
    for (let c = col - 1; c >= 0; c--) {
      if ($(`#square-${row}-${c}`).css('background-color') !== currentColor) break;
      negative.push([row, c]);
    }
    for (let c = col + 1; c <= 15; c++) {
      if ($(`#square-${row}-${c}`).css('background-color') !== currentColor) break;
      positive.push([row, c]);
    }
  } else {
    for (let r = row - 1; r >= 0; r--) {
      if ($(`#square-${r}-${col}`).css('background-color') !== currentColor) break;
      negative.push([r, col]);
    }
    for (let r = row + 1; r <= 15; r++) {
      if ($(`#square-${r}-${col}`).css('background-color') !== currentColor) break;
      positive.push([r, col]);
    }
  }

  // Paint outward from clicked cell, one wave at a time (like flood fill)
  function paintCell(r, c) {
    const sq = $(`#square-${r}-${c}`);
    appStore.currentActions.push({ row: r, col: c, color: currentColor });
    appStore.updateCurrentDrawing(r, c, newColor);
    sq.css('background-color', newColor);
    sq[0].classList.remove('blink');
    void sq[0].offsetWidth;
    sq.addClass('blink');
  }

  // Wave 0: the clicked cell itself
  paintCell(row, col);

  // Waves 1..N: expand outward in both directions simultaneously
  const maxDist = Math.max(negative.length, positive.length);
  for (let i = 0; i < maxDist; i++) {
    await new Promise(resolve => setTimeout(resolve, 30));
    if (i < negative.length) paintCell(negative[i][0], negative[i][1]);
    if (i < positive.length) paintCell(positive[i][0], positive[i][1]);
  }

  appStore.addToUndoStack(appStore.currentActions);
  appStore.clearRedoStack();
  for (const action of appStore.currentActions) {
    setTimeout(() => $(`#square-${action.row}-${action.col}`).removeClass('blink'), 1000);
  }
  appStore.resetCurrentActions();
}

function rippleBlinkGrid() {
  // Group cells by Manhattan distance from center, then blink wave-by-wave
  const waves = {};
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const dist = Math.abs(r - 7.5) + Math.abs(c - 7.5);
      const wave = Math.floor(dist);
      if (!waves[wave]) waves[wave] = [];
      waves[wave].push(`#containerSquare-${r}-${c}`);
    }
  }
  const keys = Object.keys(waves).map(Number).sort((a, b) => a - b);
  keys.forEach((wave, i) => {
    setTimeout(() => {
      for (const sel of waves[wave]) {
        const el = $(sel);
        el[0].classList.remove('blink');
        void el[0].offsetWidth;
        el.addClass('blink');
        setTimeout(() => el.removeClass('blink'), 1000);
      }
    }, i * 30);
  });
}

function transformGrid(type) {
  // Save current state for undo
  const actions = [];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      actions.push({ row: r, col: c, color: appStore.currentDrawing[r][c] });
    }
  }
  appStore.addToUndoStack(actions);
  appStore.clearRedoStack();

  // Build transformed copy
  const old = appStore.currentDrawing.map(row => [...row]);
  const next = Array.from({ length: 16 }, () => Array(16).fill('#ffffff'));

  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      if (type === 'rotateCW') {
        next[c][15 - r] = old[r][c];
      } else if (type === 'rotateCCW') {
        next[15 - c][r] = old[r][c];
      } else if (type === 'flipH') {
        next[r][15 - c] = old[r][c];
      } else if (type === 'flipV') {
        next[15 - r][c] = old[r][c];
      }
    }
  }

  // Apply to state and re-render
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      appStore.currentDrawing[r][c] = next[r][c];
      $("#square-" + r + "-" + c).css('background-color', next[r][c]);
    }
  }
  appStore.saveCurrentDrawing();

  // Flash color-box border
  const box = $("#color-box");
  box.addClass('blink');
  setTimeout(() => box.removeClass('blink'), 1000);
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

function openShareDialog() {
  // Reset filters
  $("#filter-hue").val(0);
  $("#filter-blur").val(0);
  $("#filter-invert").prop('checked', false);
  $("#filter-grayscale").prop('checked', false);
  $("#filter-saturate").val(100);

  // Draw current art onto preview canvas
  const preview = document.getElementById('share-preview');
  appStore.initCanvas(preview);
  preview.style.filter = '';

  document.getElementById('share-dialog').showModal();
}

function applyShareFilters() {
  const hue = $("#filter-hue").val();
  const blur = $("#filter-blur").val();
  const invert = $("#filter-invert").is(':checked') ? 100 : 0;
  const grayscale = $("#filter-grayscale").is(':checked') ? 100 : 0;
  const saturate = $("#filter-saturate").val();

  document.getElementById('share-preview').style.filter =
    `hue-rotate(${hue}deg) blur(${blur}px) invert(${invert}%) grayscale(${grayscale}%) saturate(${saturate}%)`;
}

function sendShareImage() {
  const preview = document.getElementById('share-preview');
  const filterStr = preview.style.filter;

  // Render filtered image to an offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = 400;
  offscreen.height = 400;
  const ctx = offscreen.getContext('2d');
  ctx.filter = filterStr || 'none';
  ctx.drawImage(preview, 0, 0);

  offscreen.toBlob(function (blob) {
    const file = new File([blob], '8bitPaint.png', { type: 'image/png' });

    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
      const url = URL.createObjectURL(blob);
      saveAs(url, '8bit_paint_' + Date.now() + '.png');
      return;
    }

    navigator.share({
      title: '8bit Paint',
      text: 'Check out my 8bit Paint!',
      files: [file],
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  }, 'image/png');

  document.getElementById('share-dialog').close();
}

function handleTouchMove(touchElement) {
  if ($(touchElement).hasClass('square')) {
    // Need to get RGB of current paintcolor
    var currentColor = $(touchElement).css('background-color');
    var testColor = getCurrentPaintColorRGB(appStore.paintColor);
    if (currentColor === testColor) {
      return;
    };

    [_, row, col] = touchElement.id.split('-');
    if (appStore.currentVisitedNodes.has(`${row}, ${col}`)) {
      return;
    };

    appStore.addToCurrentVisitedNodes(`${row}, ${col}`);
    appStore.addToCurrentActions({ row, col, color: appStore.currentDrawing[row][col] });
    $(touchElement).css('background-color', appStore.paintColor);
    touchElement.classList.remove('blink');
    void touchElement.offsetWidth;
    $(touchElement).addClass('blink');
    appStore.updateCurrentDrawing(row, col, appStore.paintColor);

    setTimeout(() => {
      $(touchElement).removeClass('blink');
    }, 1000);

  }
  else {
    if ($(touchElement).hasClass('container-square')) {
      touchElement.classList.remove('flash');
      void touchElement.offsetWidth;
      $(touchElement).addClass('flash');
      setTimeout(() => $(touchElement).removeClass('flash'), 1000);
    }
  }
}
