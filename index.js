'use strict';
var extend = require('extend');

/**
 * Default options
 * @const
 * @type {Object}
 */
var DEFAULTS = {
  keyValDelim: ':',
  propsDelim: ',',
  useSpaceBeforeKeyValDelim: false,
  useSpaceAfterKeyValDelim: false,
  useSpaceBeforePropsDelim: false,
  useSpaceAfterPropsDelim: false,
  useAlwaysQuotesForStrings: false
};

/**
 * @const
 * @type {RegExp}
 */
var rDoubleQuotesFilter = /^"(.*)"$/;

/**
 * Removes extra spaces
 * @private
 * @param {String} str
 * @param {Object} opts
 *  @param {String} opts.propsDelim
 *  @param {String} opts.keyValDelim
 * @returns {String}
 */
function clearString(str, opts) {
  var propsDelim = opts.propsDelim;
  var keyValDelim = opts.keyValDelim;
  var rPropsFilter =  new RegExp('\\s*' + propsDelim + '\\s*', 'g');
  var rKeyValFilter = new RegExp('\\s*' + keyValDelim + '\\s*', 'g');

  return str.replace(rKeyValFilter, keyValDelim).replace(rPropsFilter, propsDelim);
}

/**
 * Splits a string
 * @private
 * @param {String} str
 * @param {String} delimiter
 * @param {Boolean} useOnce Finish after the first match
 * @returns {Array}
 */
function splitString(str, delimiter, useOnce) {
  var i = 0;
  var len = str.length;
  var res = [];
  var isBetweenQuotes = false;
  var char;

  // Find delimiters and cut the string
  while (i !== len) {
    char = str.charAt(i);
    i++;

    // Do not split if the delimiter is between quotes
    if (char === '\"') {
      isBetweenQuotes = !isBetweenQuotes;
    } else if (char === delimiter && !isBetweenQuotes) {
      res.push(str.substring(0, i - 1));
      str = str.substring(i);

      if (useOnce) {
        break;
      }

      len = str.length;
      i = 0;
    }
  }

  // Add the last part
  res.push(str);

  return res;
}

/**
 * Checks if a stringified value is the boolean type
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isBoolean(value) {
  return value === 'true' || value === 'false';
}

/**
 * Checks if a stringified value is the number type
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isNumber(value) {
  return !isNaN(value);
}

/**
 * Checks if a stringified value is undefined
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isUndefined(value) {
  return value === 'undefined';
}

/**
 * Checks if a stringified value is null
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isNull(value) {
  return value === 'null';
}

/**
 * Checks if a stringified value is unsafe
 * @private
 * @param {String} value
 * @param {Object} opts
 *  @param {String} opts.propsDelim
 * @returns {Boolean}
 */
function isUnsafe(value, opts) {
  return value.search(rDoubleQuotesFilter) !== 0 && value.indexOf(opts.propsDelim) !== -1;
}

/**
 * Parses a stringified number
 * @private
 * @param {String} value
 * @returns {Number}
 */
function parseNumber(value) {
  // Float
  if (value.indexOf('.') !== -1) {
    return parseFloat(value);
  }

  // If the input string begins with "0x" or "0X", radix is 16
  if (value.length > 2 && (value.indexOf('0x') === 0 || value.indexOf('0X') === 0)) {
    return parseInt(value, 16);
  }

  return parseInt(value, 10);
}

/**
 * Parses a stringified value to the expected type
 * @private
 * @param {String} value
 * @returns {Number|Boolean|String|null|undefined}
 */
function parseValue(value) {
  if (isNull(value)) {
    return null;
  }

  if (isUndefined(value)) {
    return undefined;
  }

  if (isBoolean(value)) {
    return value === 'true';
  }

  if (isNumber(value)) {
    return parseNumber(value);
  }

  // Remove double quotes
  return value.replace(rDoubleQuotesFilter, '$1');
}

/**
 * Stringifies a value
 * @private
 * @param {*} value
 * @param {Object} opts
 * @returns {String}
 */
function stringifyValue(value, opts) {
  if (typeof value === 'string' || value instanceof String) {
    if (
      isUnsafe(value, opts) ||
      isNull(value) ||
      isUndefined(value) ||
      isBoolean(value) ||
      isNumber(value)
    ) {
      return '\"' + value + '\"';
    }
  }

  // Convert to the string type, always
  return '' + value;
}

/**
 * Stringifies a property
 * @private
 * @param {String} key
 * @param {*} value
 * @param {Object} opts
 *  @param {String} opts.keyValDelim
 *  @param {Boolean} opts.useSpaceBeforeKeyValDelim
 *  @param {Boolean} opts.useSpaceAfterKeyValDelim
 *  @param {Boolean} opts.useSpaceBeforePropsDelim
 *  @param {Boolean} opts.useSpaceAfterPropsDelim
 * @returns {String}
 */
function stringifyProp(key, value, opts) {
  return [
    key,
    opts.useSpaceBeforeKeyValDelim ? ' ' : '',
    opts.keyValDelim,
    opts.useSpaceAfterKeyValDelim ? ' ' : '',
    stringifyValue(value, opts)
  ].join('');
}

/**
 * Join an array of processed properties
 * @private
 * @param {Array} props
 * @param {Object} opts
 *  @param {String} opts.propsDelim
 *  @param {Boolean} opts.useSpaceBeforePropsDelim
 *  @param {Boolean} opts.useSpaceAfterPropsDelim
 * @returns {String}
 */
function joinProps(props, opts) {
  var delimiter = [
    opts.useSpaceBeforePropsDelim ? ' ' : '',
    opts.propsDelim,
    opts.useSpaceAfterPropsDelim ? ' ' : ''
  ].join('');

  return props.join(delimiter);
}

/**
 * Parses stringified options
 * @public
 * @param {String} str Stringified options for parsing
 * @param {Object} opts
 *  @param {String} [opts.propsDelim=',']
 *  @param {String} [opts.keyValDelim=':']
 * @returns {Object}
 */
module.exports.parse = function(str, opts) {
  opts = extend({}, DEFAULTS, opts);

  var result = {};
  var i;
  var len;
  var prop;
  var props;

  // Get an array of stringified properties
  props = splitString(clearString(str, opts), opts.propsDelim);

  // Convert stringified properties to the object with parsed values
  for (i = 0, len = props.length; i < len; i++) {
    prop = splitString(props[i], opts.keyValDelim, true);

    if (prop.length === 2) {
      result[prop[0]] = parseValue(prop[1]);
    }
  }

  return result;
};

/**
 * Stringifies an object with options
 * @public
 * @param {Object} obj
 * @param {Object} opts
 *  @param {String} [opts.propsDelim=',']
 *  @param {String} [opts.keyValDelim=':']
 *  @param {Boolean} [opts.useSpaceBeforeKeyValDelim=false]
 *  @param {Boolean} [opts.useSpaceAfterKeyValDelim=false]
 *  @param {Boolean} [opts.useSpaceBeforePropsDelim=false]
 *  @param {Boolean} [opts.useSpaceAfterPropsDelim=false]
 * @returns {String}
 */
module.exports.stringify = function(obj, opts) {
  opts = extend({}, DEFAULTS, opts);

  var hasOwnProperty = Object.hasOwnProperty;
  var res = [];
  var key;

  for (key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      res.push(stringifyProp(key, obj[key], opts));
    }
  }

  return joinProps(res, opts);
};
