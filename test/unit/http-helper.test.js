'use strict';

var assert      = require('chai').assert,
    HttpHelper  = require('../../lib/http-helper'),
    Strategy    = require('../../lib/strategy'),
    nock        = require('nock');

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
            var strategy = new Strategy(strategyOptions, noop);
            var helper = new HttpHelper(strategy);
            assert.equal(helper.strategy, strategy);
        });

        it('should assign the context property', function() {
            var strategy = new Strategy(strategyOptions, noop);
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
                    format: 'form_encoded'
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

    describe('constructBody', function() {
        it('should return an empty string if there is no body template', function() {
            var options = {
                format: 'json'
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy);

            var body = helper.constructBody();
            assert.equal(body, '');
        });

        it('should return an empty string if the bodyTemplate is an empty string', function() {
            var options = {
                format: 'json',
                bodyTemplate: ''
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy);

            var body = helper.constructBody();
            assert.equal(body, '');
        });

        it('should interpolate a simple body template', function() {
            var options = {
                bodyTemplate: '{"value": "{{value}}"}'
            };
            var context = {
                value: "abc123"
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, context);

            var body = helper.constructBody();
            assert.equal(body, '{"value": "abc123"}');
        });

        it('should interpolate a more complex body', function() {
            var options = {
                bodyTemplate: '{"nested": {"nestedValue": "{{value}}", "anotherNested": {"anotherNestedValue": "{{nestedValue}}"}}'
            };
            var context = {
                value: 'some value',
                nestedValue: 'another value'
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, context);

            var body = helper.constructBody();
            assert.equal(body, '{"nested": {"nestedValue": "some value", "anotherNested": {"anotherNestedValue": "another value"}}');
        });
    });

    describe('constructUrl', function() {
        it('should return the configured url if there are no parameters', function() {
            var options = {
                parameters: {},
                url: 'http://somesite.com/'
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, context);

            var url = helper.constructUrl();
            assert.equal(url, options.url);
        });

        it('should append a parameter to the url', function() {
            var options = {
                parameters: {
                    'val': 'abc123'
                },
                url: 'http://somesite.com'
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, context);

            var url = helper.constructUrl();
            assert.equal(url, 'http://somesite.com?val=abc123');
        });

        it('should properly interpolate a parameter', function() {
            var options = {
                parameters: {
                    'name': '{{name}}'
                },
                url: 'http://somesite.com'
            };

            var context = {
                name: 'fred'
            };

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, context);

            var url = helper.constructUrl();
            assert.equal(url, 'http://somesite.com?name=fred');
        });
    });

    describe('makeRequest', function() {
        var options;

        beforeEach(function() {
            options = {
                url: 'http://localhost/api',
                format: 'json'
            };
        });

        it('should make a simple request', function(done) {
            nock('http://localhost')
                .get('/api')
                .reply(200);

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, {});

            helper.makeRequest(function(err) {
                done(err);
            });
        });

        it('should use the correct Content-Type headers', function(done) {
            options.format = 'json';

            nock('http://localhost')
                .matchHeader('Content-Type', 'application/json')
                .get('/api')
                .reply(200);

            var strategy = new Strategy(options, noop);
            var helper = new HttpHelper(strategy, {});

            helper.makeRequest(function(err) {
                done(err);
            });
        });
    });
});