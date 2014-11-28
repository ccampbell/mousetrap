// package metadata file for Meteor.js
'use strict';

var packageName = 'mousetrap:mousetrap';  // https://atmospherejs.com/mousetrap/mousetrap
var where = 'client';  // where to install: 'client', 'server', or ['client', 'server']

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
  name: packageName,
  summary: 'Mousetrap (official): bind, trigger and handle keyboard events on keys, combinations and sequences',
  version: packageJson.version,
  git: 'https://github.com/ccampbell/mousetrap.git'
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('Mousetrap');
  api.addFiles([
    'mousetrap.js',
    'meteor/export.js'
  ], where);
});

Package.onTest(function (api) {
  api.use(packageName, where);
  api.use('tinytest', where);

  api.addFiles('meteor/test.js', where);
});
