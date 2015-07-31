var sop = require('../');
var assert = require('proclaim');

describe('.parse(str, opts)', function() {
  it('should correctly parse `null`', function() {
    assert.deepEqual(sop.parse('value: null'), { value: null });
  });

  it('should correctly parse `undefined`', function() {
    assert.deepEqual(sop.parse('value: undefined'), { value: undefined });
  });

  describe('for boolean values', function() {
    it('should correctly parse `true`', function() {
      assert.deepEqual(sop.parse('value: true'), { value: true });
    });

    it('should correctly parse `false`', function() {
      assert.deepEqual(sop.parse('value: false'), { value: false });
    });
  });

  describe('for numeric values', function() {
    it('should correctly parse a simple integer number', function() {
      assert.deepEqual(sop.parse('value: 1000'), { value: 1000 });
    });

    it('should correctly parse a number with "0x" or "0X" in the beginning', function() {
      assert.deepEqual(sop.parse('val1: 0x1000, val2: 0X1000'), { val1: 4096, val2: 4096 });
    });

    it('should correctly parse a float', function() {
      assert.deepEqual(sop.parse('value: 1000.1'), { value: 1000.1 });
    });
  });

  describe('for string values', function() {
    it('should correctly parse a string without quotes', function() {
      assert.deepEqual(sop.parse('value: http://localhost:8080'), { value: 'http://localhost:8080' });
    });

    it('should correctly parse a string with quotes', function() {
      assert.deepEqual(sop.parse('value: "http://localhost:8080"'), { value: 'http://localhost:8080' });
    });

    it('should correctly parse `null` with quotes', function() {
      assert.deepEqual(sop.parse('value: "null"'), { value: 'null' });
    });

    it('should correctly parse `undefined` with quotes', function() {
      assert.deepEqual(sop.parse('value: "undefined"'), { value: 'undefined' });
    });

    it('should correctly parse a boolean with quotes', function() {
      assert.deepEqual(sop.parse('value: "true"'), { value: 'true' });
    });

    it('should correctly parse a number with quotes', function() {
      assert.deepEqual(sop.parse('value: "1000"'), { value: '1000' });
    });
  });

  describe('for mixed', function() {
    it('should correctly parse mixed', function() {
      assert.deepEqual(sop.parse('num: 10, bool: false, str: http://te.st:80'), {
        num: 10,
        bool: false,
        str: 'http://te.st:80'
      });
    });

    it('should correctly parse a bad formated string', function() {
      assert.deepEqual(sop.parse('num: 10,bool: false, str:http://te.st:80'), {
        num: 10,
        bool: false,
        str: 'http://te.st:80'
      });
    });

    it('should correctly parse a string with invalid properties', function() {
      assert.deepEqual(sop.parse('num: 10, boolfalse, str:http://te.st:80'), {
        num: 10,
        str: 'http://te.st:80'
      });
    });
  });

  it('should correctly parse when the key-value delimiter is `=` and the delimiter of properies is `&`', function() {
    assert.deepEqual(sop.parse('num=10&bool=false', {
      keyValDelim: '=',
      propsDelim: '&'
    }), { num: 10, bool: false });
  });
});
