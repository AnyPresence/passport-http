var assert      = require('chai').assert,
    Strategy    = require('../../lib/');

describe('index', function() {
    it('should export the strategy', function() {
        assert.isFunction(Strategy);
    });
});