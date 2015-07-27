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
  useSpaceAfterKeyValDelim: true,
  useSpaceBeforePropsDelim: false,
  useSpaceAfterPropsDelim: true,
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
 * @returns {String}
 */
function clearString(str, keyValDelim, propsDelim) {
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
 * Checks if a stringified value is a boolean
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isBoolean(value) {
  return value === 'true' || value === 'false';
}

/**
 * Checks if a stringified value is a number
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isNumber(value) {
  return !isNaN(value);
}

/**
 * Checks if a stringified value is an undefined
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isUndefined(value) {
  return value === 'undefined';
}

/**
 * Checks if a stringified value is a null
 * @private
 * @param {String} value
 * @returns {Boolean}
 */
function isNull(value) {
  return value === 'null';
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
 * Parses stringified options
 * @public
 * @param {String} str Stringified options for parsing
 * @param {Object} opts Options
 * @returns {Object}
 */
module.exports.parse = function(str, opts) {
  opts = extend({}, DEFAULTS, opts);

  var keyValDelim = opts.keyValDelim;
  var propsDelim = opts.propsDelim;
  var result = {};
  var i;
  var len;
  var prop;
  var props;

  // Remove extra spaces
  str = clearString(str, keyValDelim, propsDelim);

  // Get an array of stringified properties
  props = splitString(str, propsDelim);

  // Convert stringified properties to the object with parsed values
  for (i = 0, len = props.length; i < len; i++) {
    prop = splitString(props[i], keyValDelim, true);

    if (prop.length === 2) {
      result[prop[0]] = parseValue(prop[1]);
    }
  }

  return result;
};
