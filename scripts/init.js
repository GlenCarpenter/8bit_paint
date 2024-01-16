// Confirm back button
window.addEventListener('beforeunload', function (e) {
  // Cancel the event
  e.preventDefault();
  // Chrome requires returnValue to be set
  e.returnValue = '';
});

//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

