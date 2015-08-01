[![NPM version](https://img.shields.io/npm/v/sop.svg?style=flat)](https://npmjs.org/package/sop)
[![Bower version](https://badge.fury.io/bo/sop.svg)](http://badge.fury.io/bo/sop)
[![Build Status](https://travis-ci.org/VodkaBears/Sop.svg?branch=master)](https://travis-ci.org/VodkaBears/Sop)
[![Coverage Status](https://coveralls.io/repos/VodkaBears/Sop/badge.svg?branch=master&service=github)](https://coveralls.io/github/VodkaBears/Sop?branch=master)
Sop
=======
Sop <- SOP <- Stringified object properties

Sop is a small library for parsing stringified object properties or converting properties to the string representation.

###Wat???

Example usage #1:
```html
<div id="component" data-options="id: 1, name: comp, isEmpty: true"></div>
```

```js
var elem = document.getElementById('component');

/**
 * Result is the object with parsed values:
 * {
 *   id: 1, // Number
 *   name: 'comp', // String
 *   isEmpty: true // Boolean
 * }
 */
var options = Sop.parse(elem.getAttribute('data-options'));

new Component(elem, options);
```

Example usage #2:
```html
<div id="component"></div>
```

```js
var elem = document.getElementById('component');
var options = {
  id: 1,
  name: 'comp',
  isEmpty: true
};

elem.setAttribute('data-options', Sop.stringify(options))
```

```html
<div id="component" data-options="id:1,name:comp,isEmpty:true"></div>
```

### Requirements

Node or IE8+

###Installation and usage

Node, browserify:
```
npm install sop
```

```js
var Sop = require('sop');
var sopOpts = {...};

Sop.parse('num: 10', sopOpts);
Sop.stringify({ num: 10 }, sopOpts);
```

Browsers:
```
bower install sop
```

```html
<script scr="bower_components/sop/browser/sop.min.js"></script>
<script>
  var sopOpts = {...};

  Sop.parse('num: 10', sopOpts);
  Sop.stringify({ num: 10 }, sopOpts);
</script>
```

###Methods

####.parse(str, options)

Parsed types: Number, Boolean, String, null, undefined.

```js
Sop.parse('num: 10.1, bool: true, str: http://site.com, nullVal: null, undefVal: undefined')

// =>

{
  num: 10.1,
  bool: true,
  str: http://site.com,
  nullVal: null,
  undefVal: undefined
}
```

If you want to parse something as a string value, add double quotes:
```js
Sop.parse('notNum: "10", notBool: "true", notNull: "null", notUndefined: "undefined"')

// =>

{
  notNum: '10',
  notBool: 'true',
  notNull: 'null',
  notUndefined: 'undefined'
}
```

`options` and default values:
```js
{
  // Delimiter between a key and a value
  keyValDelim: ':',

  // Delimiter between properties
  propsDelim: ','
}
```

####.stringify(obj, options)

```js
Sop.stringify({
  num: 10.1,
  bool: true,
  str: http://site.com,
  nullVal: null,
  undefVal: undefined,
  notNum: '10'
}, {
  useSpaceAfterKeyValDelim: true,
  useSpaceAfterPropsDelim: true
});

// =>

'num: 10.1, bool: true, str: http://site.com, nullVal: null, undVal: undefined, notNum: "10"'
```

`options` and default values:
```js
{
  // Delimiter between a key and a value
  keyValDelim: ':',

  // Delimiter between properties
  propsDelim: ',',

  // ' :'
  useSpaceBeforeKeyValDelim: false,

  // ': '
  useSpaceAfterKeyValDelim: false,

  // ' ,'
  useSpaceBeforePropsDelim: false,

  // ', '
  useSpaceAfterPropsDelim: false,

  // Always add double quotes for string values
  useAlwaysQuotesForStrings: false
}
```

###License

```
The MIT License (MIT)

Copyright (c) 2015 Ilya Makarov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
