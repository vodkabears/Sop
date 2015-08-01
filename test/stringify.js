var sop = require('../');
var assert = require('proclaim');

describe('.stringify(obj, opts)', function() {
  it('should correctly stringify `null`', function() {
    assert.equal(sop.stringify({ value:null }), 'value:null');
  });

  it('should correctly stringify `undefined`', function() {
    assert.equal(sop.stringify({ value:undefined }), 'value:undefined');
  });

  describe('for boolean values', function() {
    it('should correctly stringify `true`', function() {
      assert.equal(sop.stringify({ value:true }), 'value:true');
    });

    it('should correctly stringify `false`', function() {
      assert.equal(sop.stringify({ value:false }), 'value:false');
    });
  });

  describe('for numeric values', function() {
    it('should correctly stringify a simple integer number', function() {
      assert.equal(sop.stringify({ value: 1000 }), 'value:1000');
    });

    it('should correctly stringify a number with 0 in the beginning', function() {
      assert.equal(sop.stringify({ value: 01000 }), 'value:512');
    });

    it('should correctly stringify a float', function() {
      assert.equal(sop.stringify({ value: 1000.1 }), 'value:1000.1');
    });
  });

  describe('for string values', function() {
    it('should correctly stringify a string', function() {
      assert.equal(sop.stringify({ value: 'http://localhost:8080' }), 'value:http://localhost:8080');
    });

    it('should correctly stringify and add quotes if there is a conflict with the delimiter', function() {
      assert.equal(sop.stringify({ value: 'http://localhost:8080,' }), 'value:"http://localhost:8080,"');
    });

    it('should correctly stringify "null"', function() {
      assert.equal(sop.stringify({ value: 'null' }), 'value:"null"');
    });

    it('should correctly stringify "undefined"', function() {
      assert.equal(sop.stringify({ value: 'undefined' }), 'value:"undefined"');
    });

    it('should correctly stringify a string representation of a boolean', function() {
      assert.equal(sop.stringify({ val1: 'true', val2: 'false' }), 'val1:"true",val2:"false"');
    });

    it('should correctly stringify a string representation of a number', function() {
      assert.equal(sop.stringify({ val1: '100', val2: '010', val3: '10.1' }), 'val1:"100",val2:"010",val3:"10.1"');
    });
  });

  it('should correctly stringify mixed', function() {
    Object.prototype.secretProperty = '100% test coverage. ^__^';

    assert.equal(sop.stringify({
      num: 10,
      str: 'http://te.st:80,',
      bool: false
    }), 'num:10,str:"http://te.st:80,",bool:false');

    delete Object.prototype.secretProperty;
  });

  describe('with options', function() {
    var props = {
      num: 10,
      str1: 'http://te.st:80',
      str2: 'http://te.st:80,',
      bool: false
    };

    it('should correctly stringify an object and add spaces, quotes', function() {
      assert.equal(sop.stringify(props, {
        useSpaceAfterKeyValDelim: true,
        useSpaceBeforeKeyValDelim: true,
        useSpaceAfterPropsDelim: true,
        useSpaceBeforePropsDelim: true,
        useAlwaysQuotesForStrings: true
      }), 'num : 10 , str1 : "http://te.st:80" , str2 : "http://te.st:80," , bool : false');
    });

    it('should correctly stringify an object when the key-value delimiter is `=` and the delimiter of properies is `&`', function() {
      assert.equal(sop.stringify(props, {
        keyValDelim: '=',
        propsDelim: '&'
      }), 'num=10&str1=http://te.st:80&str2=http://te.st:80,&bool=false');
    });
  });
});
