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
                username: 'user',
                password: 'password',
                parameters: {
                    "test": "value"
                },
                headers: {
                    "token": "secret"
                },
                format: 'json',
                bodyTemplate: "{{something}}",
                responseHandler: function() {}
            };
            strategy = new Strategy(options, noop);
        });

        it('should assign url', function() {
            assert(strategy.url, 'Missing url');
            assert.equal(options.url, strategy.url);
        });

        it('should assign verb', function() {
            assert(strategy.verb, 'Missing verb');
           assert.equal(options.verb, strategy.verb);
        });

        it('should assign username', function() {
            assert(strategy.username, 'Missing username');
            assert.equal(options.username, strategy.username);
        });

        it('should assign password', function() {
            assert(strategy.password, 'Missing password');
            assert.equal(options.password, strategy.password);
        });

        it('should assign parameters', function() {
            assert(strategy.parameters, 'Missing parameters');
            assert.equal(options.parameters, strategy.parameters);
        });

        it('should assign headers', function() {
            assert(strategy.headers, 'Missing headers');
            assert.equal(options.headers, strategy.headers);
        });

        it('should assign bodyTemplate', function() {
            assert(strategy.bodyTemplate, 'Missing bodyTemplate');
            assert.equal(options.bodyTemplate, strategy.bodyTemplate);
        });

        it('should assign responseHandler', function() {
            assert(strategy.responseHandler, 'Missing responseHandler');
            assert.equal(options.responseHandler, strategy.responseHandler);
        });

        it('should assign format', function() {
            assert(strategy.format, 'Missing format');
            assert.equal(options.format, strategy.format);
        });
    });

    describe('authenticate', function() {
        var options, strategy;

        beforeEach(function() {
            options = {};
            strategy = new Strategy(options, noop);
        });

        it('should accept 2 parameters: req and options', function() {
            assert.equal(strategy.authenticate.length, 2);
        });
    });
});