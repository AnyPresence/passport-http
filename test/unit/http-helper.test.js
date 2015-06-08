'use strict';

var assert      = require('chai').assert,
    HttpHelper  = require('../../lib/http-helper'),
    Strategy    = require('../../lib/strategy');

var noop = function() {};

var strategyOptions;

describe('HttpHelper', function() {
    beforeEach(function() {
        strategyOptions = {
            url: 'http://somesite.com',
        };
    });

    describe('constructor', function() {
        it('should export a function', function() {
            assert.isFunction(HttpHelper);
        });

        it('should assign the strategy property', function() {
            var strategy = new Strategy(strategyOptions);
            var helper = new HttpHelper(strategy);
            assert.equal(helper.strategy, strategy);
        });

        it('should assign the context property', function() {
            var strategy = new Strategy(strategyOptions);
            var context = { value: 'abc123' };
            var helper = new HttpHelper(strategy, context);
            assert.equal(helper.strategy, strategy);
        });
    });

    describe('constructHeaders', function() {
        describe('Content-Type and Accept', function() {
            it('should be correctly set for JSON', function() {
                var options = {
                    format: 'json'
                };
                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['Content-Type'], 'application/json');
                assert.equal(headers['Accept'], 'application/json');
            });

            it('should be correctly set for XML', function() {
                var options = {
                    format: 'xml'
                };
                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['Content-Type'], 'application/xml');
                assert.equal(headers['Accept'], 'application/xml');
            });

            it('should be correctly set for form-encoded', function() {
                var options = {
                    format: 'form-encoded'
                };
                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['Content-Type'], 'application/x-www-form-urlencoded');
                assert.equal(headers['Accept'], 'application/x-www-form-urlencoded');
            });
        });

        describe('Authorization', function() {
            it('should be correctly set if supplied username/password', function() {
                var options = {
                    username: 'test',
                    password: 'password',
                    format: 'json'
                };
                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['Authorization'], 'Basic dGVzdDpwYXNzd29yZA==');
            });
        });

        describe('configured headers', function() {
            it('should include the configured headers', function() {
                var options = {
                    headers: {
                        'token': 'abc123'
                    },
                    format: 'json'
                };

                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['token'], 'abc123');
            });

            it('should properly interpolate configured headers', function() {
                var options = {
                    headers: {
                        'token': '{{token}}'
                    },
                    format: 'json'
                };

                var context = {
                    token: 'secret'
                };

                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy, context);

                var headers = helper.constructHeaders();
                assert.equal(headers['token'], context.token);
            });

            it('should override computed headers with configured headers', function() {
                var options = {
                    headers: {
                        'Accept': 'crappy/extension'
                    }
                };

                var strategy = new Strategy(options, noop);
                var helper = new HttpHelper(strategy);

                var headers = helper.constructHeaders();
                assert.equal(headers['Accept'], 'crappy/extension');
            });
        });
    });
});