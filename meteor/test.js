'use strict';

Tinytest.addAsync('To pass this test, press "m"', function (test, done) {
  Mousetrap.bind('m', function() {
    test.ok({message: 'Test passed by pressing "k". Just kidding, by pressing "m".'});
    done();
  });

});
