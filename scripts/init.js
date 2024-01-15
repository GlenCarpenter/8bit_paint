// Confirm back button
window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
});

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

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
      $(containerSquare).append(square);
      $(row).append(containerSquare);
    }
    $("#colorBox").append(row);
  }
}

initColorBox();