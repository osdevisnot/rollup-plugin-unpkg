# rollup-plugin-unpkg

A rollup plugin to convert ES imports to UNPKG urls.

## Usage

Add this plugin to `rollup.config.js`:

```js
const unpkg = require('rollup-plugin-unpkg');

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [unpkg()]
};
```

## Example

`package.json` dependencies:

```json
  "dependencies": {
    "@vanillajs/store": "^0.1.7",
    "superfine": "^6.0.1"
  },
```

Input Code:

```js
import { patch, h } from 'superfine';
import store from '@vanillajs/store';
```

Output Code:

```js
import { patch, h } from 'https://unpkg.com/superfine@6.0.1?type=module';
import store from 'https://unpkg.com/@vanillajs/store@0.1.7?type=module';
```

## Inspiration

Inspired from [this twitter conversation](https://twitter.com/Rich_Harris/status/933745598754447360) and a [follow up gist](https://gist.github.com/Rich-Harris/9ee5338527e7fa4ab251a02685729ee7)
