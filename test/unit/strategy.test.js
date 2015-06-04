var assert      = require('chai').assert,
    Strategy    = require('../../lib/strategy');

function noop() {}

describe('Strategy', function() {
    describe('constructor', function() {
        var strategy; // instance

        beforeEach(function() {
            strategy = new Strategy({}, function() {});
        });

        it('should export a function', function() {
            assert.isFunction(Strategy);
        });

        it('should accept 2 parameters: options and verify', function() {
            assert.equal(Strategy.length, 2);
        });

        it('should have an authenticate function', function() {
            assert.isFunction(strategy.authenticate);
        });
    });

    describe('options', function() {
        var strategy, options;

        beforeEach(function() {
            options = {
                url: 'http://somesite.com',
                verb: 'post',
                basicAuth: 'abcabc',
                parameters: {
                    "test": "value"
                },
                headers: {
                    "token": "secret"
                },
                responseHandler: function() {}
            };
            strategy = new Strategy(options, noop);
        });

        it('should assign url', function() {
            assert.equal(options.url, strategy.url);
        });

        it('should assign verb', function() {
           assert.equal(options.verb, strategy.verb);
        });

        it('should assign basicAuth', function() {
            assert.equal(options.basicAuth, strategy.basicAuth);
        });

        it('should assign parameters', function() {
            assert.equal(options.parameters, strategy.parameters);
        });

        it('should assign headers', function() {
            assert.equal(options.headers, strategy.headers);
        });

        it('should assign responseHandler', function() {
            assert.equal(options.responseHandler, strategy.responseHandler);
        });
    });

    describe('authenticate', function() {
        var options, strategy;

        beforeEach(function() {
            options = {};
            strategy = new Strategy(options, noop);
        });

        it('should accept 2 parameters: req and options', function() {
            assert.equal()
        });
    });
});