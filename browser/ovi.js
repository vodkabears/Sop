/*
 *  Ovi - v0.0.1
 *  Micro-library for parsing stringified parameters or converting parameters to the string representation.
 *  http://vodkabears.github.io/ovi/
 *
 *  Made by Ilya Makarov
 *  Under MIT License
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Ovi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"extend":2}],2:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[1])(1)
});