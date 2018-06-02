// expose Mousetrap to Meteor.js
if (typeof Package !== 'undefined') {
  /*global Mousetrap:true*/  // Meteor.js creates a file-scope global for exporting. This comment prevents a potential JSHint warning.
  Mousetrap = window.Mousetrap;
  delete window.Mousetrap;
}
