var assert      = require('chai').assert,
    Strategy    = require('../../lib/strategy'),
    nock        = require('nock');

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

        it('should assign the _verify function', function() {
            assert(strategy._verify, 'Missing verify callback');
            assert(typeof strategy._verify === 'function');
        });
    });

    describe('authenticate', function() {
        var options, strategy;

        beforeEach(function() {
            options = {
                url: 'http://localhost/api/login',
                format: 'json',
                verb: 'post'
            };
            strategy = new Strategy(options, noop);
        });

        it('should accept 2 parameters: req and options', function() {
            assert.equal(strategy.authenticate.length, 2);
        });

        it('should return an error on a non-200 status from the remote source', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(500, {message: 'Server fall down'});

            strategy.error = function(err) {
                assert.equal(err.message, 'Recieved status code 500 from remote source. {"message":"Server fall down"}');
                done();
            };

            strategy.authenticate({});
        });

        it('should parse json body to object if configured for json', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                assert.equal(typeof result, 'object');
                done();
            };

            strategy = new Strategy(options, noop);

            strategy.authenticate({});
        });

        it('should handle an error returned from the responseHandler', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                cb(new Error('Some custom code blew up'));
            };

            strategy = new Strategy(options, noop);

            strategy.error = function(err) {
                assert.equal(err.message, 'Some custom code blew up');
                done();
            };

            strategy.authenticate({});
        });

        it('should pass the response and result to the responseHandler', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result) {
                assert(response);
                assert(result);
                done();
            };

            strategy = new Strategy(options, noop);

            strategy.authenticate({});
        });

        it('should parse a json payload', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result) {
                assert.equal(typeof result, 'object');
                done();
            };

            strategy = new Strategy(options, noop);

            strategy.authenticate({});
        });

        it('should call the verify method with the req option if passReqToCallback is true', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                cb(null, result);
            };

            options.passReqToCallback = true;

            strategy = new Strategy(options, function(req, user, cb) {
                assert.equal(req, mockReq);
                assert.equal(typeof cb, 'function');
                done();
            });

            var mockReq = {
                test: 'value'
            };

            strategy.authenticate(mockReq);
        });

        it('should call the verify method without the req if passReqToCallback is false', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                cb(null, result);
            };

            options.passReqToCallback = false;

            strategy = new Strategy(options, function(user, cb) {
                assert.notEqual(user, mockReq);
                assert.equal(typeof cb, 'function');
                done();
            });

            var mockReq = {
                test: 'value'
            };

            strategy.authenticate(mockReq);
        });

        it('should handle an error returned to the verified method', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                cb(null, result);
            };

            strategy = new Strategy(options, function(user, cb) {
                return cb(new Error('Something went wrong'));
            });

            strategy.error = function(err) {
                assert.equal(err.message, 'Something went wrong');
                done();
            };

            strategy.authenticate({});
        });

        it('should fail the auhtentication if no user object is returned', function(done) {
            nock('http://localhost')
                .post('/api/login')
                .reply(200, {user: 'fred'});

            options.responseHandler = function(response, result, cb) {
                cb(null, result);
            };

            strategy = new Strategy(options, function(user, cb) {
                return cb(null);
            });

            strategy.fail = function(reason) {
                assert.equal(reason, 'Invalid or missing user.');
                done();
            };

            strategy.authenticate({});
        });

        it('should successfully authenticate a user', function(done) {
            var userStub = {
                username: 'fred'
            };

            nock('http://localhost')
                .post('/api/login')
                .reply(200, userStub);

            options.responseHandler = function(response, result, cb) {
                cb(null, result);
            };

            strategy = new Strategy(options, function(user, cb) {
                return cb(null, user);
            });

            strategy.success = function(user) {
                assert.equal(user.username, userStub.username);
                done();
            };

            strategy.authenticate({});
        });

        it('should persist any changes made in the responseHandler', function(done) {
            var userStub = {
                username: 'fred'
            };

            nock('http://localhost')
                .post('/api/login')
                .reply(200, userStub);

            options.responseHandler = function(response, result, cb) {
                result.username = 'george';
                cb(null, result);
            };

            strategy = new Strategy(options, function(user, cb) {
                return cb(null, user);
            });

            strategy.success = function(user) {
                assert.equal(user.username, 'george');
                done();
            };

            strategy.authenticate({});
        });
    });
});