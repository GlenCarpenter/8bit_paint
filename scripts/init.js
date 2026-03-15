//Disable context menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

// Prevent swipe-back navigation anywhere in the app
document.addEventListener('touchmove', function (e) {
  e.preventDefault();
}, { passive: false });

