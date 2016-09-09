var assert          = require('chai').assert,
    interpolate    = require('../../lib/interpolate');

describe('Interpolate', function() {
    it('should export as function', function() {
        assert.isFunction(interpolate);
    });

    it('should accept 3 parameters: payload, context and headers', function() {
        assert.equal(interpolate.length, 3);
    });

    describe('with bad values', function() {
        it('should return undefined if supplied a null payload value', function() {
            var res = interpolate(null, {});
            assert(typeof res === 'undefined');
        });

        it('should return payload if supplied a null context value', function() {
            var res = interpolate('A string', null);
            assert(res === 'A string');
        });

        it('should return undefined if supplied undefined payload value', function() {
            var res = interpolate(undefined, {});
            assert(typeof res === 'undefined');
        });

        it('should return undefined if supplied undefined context value', function() {
            var res = interpolate('A string', undefined);
            assert(res === 'A string');
        });
    });

    describe('for a string', function() {
        var source, context;

        beforeEach(function() {
            source = "My name is {{name}}";
            context = {
                name: "Fred"
            };
        });

        it('should properly interpolate the string', function() {
            var res = interpolate(source, context);
            assert.equal(res, "My name is Fred");
        });

        it("should return the original source if there is nothing to interpolate", function() {
            source = "Just a string";
            var res = interpolate(source, context);
            assert.equal(res, "Just a string");
        });
    });

    describe('for an array of strings', function() {
        var source, context;

        beforeEach(function() {
            source = ['{{one}}', '{{two}}'];
            context = {
                one: 'Test One',
                two: 'Test Two'
            };
        });

        it('should interpolate each value in the array', function() {
            var res = interpolate(source, context);
            assert.equal(res[0], 'Test One');
            assert.equal(res[1], 'Test Two');
        });

        it('should return an empty array if an empty array is supplied', function() {
            source = [];
            var res = interpolate(source, context);
            assert.equal(res.length, [].length);
        });

        it('should not interpolate an array value that is not a string', function() {
            source = [445];
            var res = interpolate(source, context);
            assert.equal(res[0], 445);
        });
    });

    describe('for object', function() {
        var source, context;

        beforeEach(function() {
            source = {
                token: "{{value}}",
                password: "{{password}}",
                subObject: {
                    foo: 'bar'
                }
            };
            context = {
                value: 'secret',
                password: 'pa55w0rd'
            };
        });

        it('should interpolate each value in the object', function() {
            var res = interpolate(source, context);
            assert.equal(res.token, 'secret');
            assert.equal(res.password, 'pa55w0rd');
        });

        it('should not interpolate sub objects', function() {
            var res = interpolate(source, context);
            assert.equal(res.subObject.foo, 'bar');
        });

        it('should not interpolate types other than string', function() {
            var source = {
                notString: 445
            };
            var res = interpolate(source, context);
            assert.equal(res.notString, 445);
        });

    });

    describe('for a url encoded string', function() {
        var source, context, headers;

        beforeEach(function() {
            source = "username={{username}}&password={{password}}&token={{misc.token}}";
            context = {
                username: "foo+bar baz",
                password: "!@#",
                misc: {
                    token: "abc"
                }
            };
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
        });

        it('should interpolate the values correctly', function() {
            var res = interpolate(source, context, headers);
            assert.equal(res, 'username=foo%2Bbar%20baz&password=!%40%23&token=abc');
        });
    })
});
