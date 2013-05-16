!function (context, definition) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition(module, exports);
  } else {
    var mod = { exports: {} };
    definition.call(mod.exports, mod, mod.exports);
    if (typeof define === 'function' && typeof define.amd  === 'object') {
      define(function () { return mod.exports; });
    } else {
      if (!context.chai) throw new Error('Chai cannot be found in current scope.');
      context.chai.use(mod.exports);
    }
  }
}(this, function (module, exports) {


  /*!
   * chai-spies :: a chai plugin
   * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
   * MIT Licensed
   */

  /*!
   * We are going to export a function that can be used through chai
   */

  module.exports = function (chai, _) {
    // Easy access
    var Assertion = chai.Assertion
      , flag = _.flag
      , i = _.inspect

    /**
     * # chai.spy (function)
     *
     * Wraps a function in a proxy function. All calls will
     * pass through to the original function.
     *
     *      function original() {}
     *      var spy = chai.spy(original)
     *        , e_spy = chai.spy();
     *
     * @param {Function} function to spy on
     * @returns function to actually call
     * @api public
     */

    chai.spy = function (name, fn) {
      if (typeof name === 'function') {
        fn = name;
        name = undefined;
      }

      fn = fn || function () {};

      function makeProxy (length, fn) {
        switch (length) {
          case 0 : return function () { return fn.apply(this, arguments); };
          case 1 : return function (a) { return fn.apply(this, arguments); };
          case 2 : return function (a,b) { return fn.apply(this, arguments); };
          case 3 : return function (a,b,c) { return fn.apply(this, arguments); };
          case 4 : return function (a,b,c,d) { return fn.apply(this, arguments); };
          case 5 : return function (a,b,c,d,e) { return fn.apply(this, arguments); };
          case 6 : return function (a,b,c,d,e,f) { return fn.apply(this, arguments); };
          case 7 : return function (a,b,c,d,e,f,g) { return fn.apply(this, arguments); };
          case 8 : return function (a,b,c,d,e,f,g,h) { return fn.apply(this, arguments); };
          case 9 : return function (a,b,c,d,e,f,g,h,i) { return fn.apply(this, arguments); };
          default : return function (a,b,c,d,e,f,g,h,i,j) { return fn.apply(this, arguments); };
        }
      };

      var proxy = makeProxy(fn.length, function () {
        var args = Array.prototype.slice.call(arguments);
        proxy.__spy.calls.push(args);
        proxy.__spy.called = true;
        return fn.apply(this, args);
      });

      proxy.prototype = fn.prototype;
      proxy.toString = function toString() {
        var l = this.__spy.calls.length;
        var s = "{ Spy";
        if (this.__spy.name)
          s += " '" + this.__spy.name + "'";
        if (l > 0)
          s += ", " + l + " call" + (l > 1 ? 's' : '');
        s += " }";
        return s;
      };
      proxy.__spy = {
          calls: []
        , called: false
        , name: name
      };

      return proxy;
    }

    /**
     * # spy
     *
     * Assert the the object in question is an chai.spy
     * wrapped function by looking for internals.
     *
     *      expect(spy).to.be.spy;
     *      spy.should.be.spy;
     *
     * @api public
     */

    Assertion.addProperty('spy', function () {
      this.assert(
          'undefined' !== typeof this._obj.__spy
        , 'expected ' + this._obj + ' to be a spy'
        , 'expected ' + this._obj + ' to not be a spy');
      return this;
    });

    /**
     * # .called
     *
     * Assert that a spy has been called. Does not negate to allow for
     * pass through language.
     *
     * @api public
     */

    function assertCalled (n) {
      new Assertion(this._obj).to.be.spy;
      var spy = this._obj.__spy;

      if (n) {
        this.assert(
            spy.calls.length === n
          , 'expected #{this} to have been called #{exp} but got #{act}'
          , 'expected #{this} to have not been called #{exp}'
          , spy.calls.length
          , n
        );
      } else {
        this.assert(
            spy.called === true
          , 'expected #{this} to have been called'
          , 'expected #{this} to not have been called'
        );
      }
    }

    function assertCalledChain () {
      new Assertion(this._obj).to.be.spy;
    }

    Assertion.addChainableMethod('called', assertCalled, assertCalledChain);

    /**
     * # once
     *
     * Assert that a spy has been called exactly once
     *
     * @api public
     */

    Assertion.addProperty('once', function () {
      new Assertion(this._obj).to.be.spy;
      this.assert(
          this._obj.__spy.calls.length === 1
        , 'expected ' + this._obj + ' to have been called once but got #{act}'
        , 'expected ' + this._obj + ' to not have been called once'
        , 1
        , this._obj.__spy.calls.length );
    });

    /**
     * # twice
     *
     * Assert that a spy has been called exactly twice.
     *
     * @api public
     */

    Assertion.addProperty('twice', function () {
      new Assertion(this._obj).to.be.spy;
      this.assert(
          this._obj.__spy.calls.length === 2
        , 'expected ' + this._obj + ' to have been called once but got #{act}'
        , 'expected ' + this._obj + ' to not have been called once'
        , 2
        , this._obj.__spy.calls.length
      );
    });

    /**
     * ### .with
     *
     */

    function assertWith () {
      new Assertion(this._obj).to.be.spy;
      var args = [].slice.call(arguments, 0)
        , calls = this._obj.__spy.calls
        , always = _.flag(this, 'spy always')
        , passed;

      if (always) {
        passed = 0
        calls.forEach(function (call) {
          var found = 0;
          args.forEach(function (arg) {
            for (var i = 0; i < call.length; i++) {
              if (_.eql(call[i], arg)) found++;
            }
          });
          if (found === args.length) passed++;
        });

        this.assert(
            passed === calls.length
          , 'expected ' + this._obj + ' to have been always called with #{exp} but got ' + passed + ' out of ' + calls.length
          , 'expected ' + this._his + ' to have not always been called with #{exp}'
          , args
        );
      } else {
        passed = 0;
        calls.forEach(function (call) {
          var found = 0;
          args.forEach(function (arg) {
            for (var i = 0; i < call.length; i++) {
              if (_.eql(call[i], arg)) found++;
            }
          });
          if (found === args.length) passed++;
        });

        this.assert(
            passed > 0
          , 'expected ' + this._obj + ' to have been called with #{exp}'
          , 'expected ' + this._his + ' to have not been called with #{exp} but got ' + passed + ' times'
          , args
        );
      }
    }

    function assertWithChain () {
      if ('undefined' !== this._obj.__spy) {
        _.flag(this, 'spy with', true);
      }
    }

    Assertion.addChainableMethod('with', assertWith, assertWithChain);

    Assertion.addProperty('always', function () {
      if ('undefined' !== this._obj.__spy) {
        _.flag(this, 'spy always', true);
      }
    });

    /**
     * # exactly (n)
     *
     * Assert that a spy has been called exactly `n` times.
     *
     * @param {Number} n times
     * @api public
     */

    Assertion.addMethod('exactly', function () {
      new Assertion(this._obj).to.be.spy;
      var always = _.flag(this, 'spy always')
        , _with = _.flag(this, 'spy with')
        , args = [].slice.call(arguments, 0)
        , calls = this._obj.__spy.calls
        , passed;

      if (always && _with) {
        passed = 0
        calls.forEach(function (call) {
          if (call.length !== args.length) return;
          if (_.eql(call, args)) passed++;
        });

        this.assert(
            passed === calls.length
          , 'expected ' + this._obj + ' to have been always called with exactly #{exp} but got ' + passed + ' out of ' + calls.length
          , 'expected ' + this._obj + ' to have not always been called with exactly #{exp}'
          , args
        );
      } else if (_with) {
        passed = 0;
        calls.forEach(function (call) {
          if (call.length !== args.length) return;
          if (_.eql(call, args)) passed++;
        });

        this.assert(
            passed > 0
          , 'expected ' + this._obj + ' to have been called with exactly #{exp}'
          , 'expected ' + this._obj + ' to not have been called with exactly #{exp} but got ' + passed + ' times'
          , args
        );
      } else {
        this.assert(
            this._obj.__spy.calls.length === args[0]
          , 'expected ' + this._obj + ' to have been called #{exp} times but got #{act}'
          , 'expected ' + this._obj + ' to not have been called #{exp} times'
          , args[0]
          , this._obj.__spy.calls.length
        );
      }
    });

    /**
     * # gt (n)
     *
     * Assert that a spy has been called more than `n` times.
     *
     * @param {Number} n times
     * @api public
     */

    function above (_super) {
      return function (n) {
        if ('undefined' !== typeof this._obj.__spy) {
          new Assertion(this._obj).to.be.spy;

          this.assert(
              this._obj.__spy.calls.length > n
            , 'expected ' + this._obj + ' to have been called more than #{exp} times but got #{act}'
            , 'expected ' + this._obj + ' to have been called no more than than #{exp} times but got #{act}'
            , n
            , this._obj.__spy.calls.length
          );
        } else {
          _super.apply(this, arguments);
        }
      }
    }

    Assertion.overwriteMethod('above', above);
    Assertion.overwriteMethod('gt', above);

    /**
     * # lt (n)
     *
     * Assert that a spy has been called less than `n` times.
     *
     * @param {Number} n times
     * @api public
     */

    function below (_super) {
      return function (n) {
        if ('undefined' !== typeof this._obj.__spy) {
          new Assertion(this._obj).to.be.spy;

          this.assert(
              this._obj.__spy.calls.length <  n
            , 'expected ' + this._obj + ' to have been called less than #{exp} times but got #{act}'
            , 'expected ' + this._obj + ' to have been called at least #{exp} times but got #{act}'
            , n
            , this._obj.__spy.calls.length
          );
        } else {
          _super.apply(this, arguments);
        }
      }
    }

    Assertion.overwriteMethod('below', below);
    Assertion.overwriteMethod('lt', below);
  };

});
