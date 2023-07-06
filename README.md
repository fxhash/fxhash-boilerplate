# FXHACKATHON 2023 boilerplate 💻

A boilerplate to automate and ease the creation of Generative Tokens on fx(hash) using fx(params).

## Overview

> This project is based on the main boilerplate, while providing an implementation example for code-driven parameters.

We prepared a few files in the project:

- index.js
- minting.js
- final.js
- shared.js
- style.css

We recommend taking a look at these files to understand the logic behind code-driven params, and clearing these for a fresh start when ready to start working on your project.

If you have any question regarding the hackathon, feel free to come on [our discord](https://discord.gg/fxhash) !

## Boilerplate

### Scope

- provide a local environment in which you can iterate and use modern features from the javascript ecosystem
- interactive environment to test your project with different seeds and params, called fx(lens)
- automate the creation of a .zip file ready to be uploaded on fxhash

### Prerequisites

- node >= 14
- npm >= 6.14.4

### Getting started

- Clone this repository: `npx degit fxhash/fxhash-boilerplate#hackathon-2023 your_project_name`
- Install dependencies and fx(lens): `npm install`

## Start developing your token project

- `npm start`: Starts a local http server serving your project within fxlens and hot reloading enabled
- Your browser should open automatically otherwise visit `http://localhost:3000/?target=http://localhost:3301/` to see your project in the browser

### fx(hash) snippet / fx(snippet)

fxhash requires you to use a javascript code snippet so that the platform can inject some code when tokens will be generated from your Generative Token. The code snippet is already in the `index.html` file of this boilerplate, so you don't have to add it yourself.

**During the development stages, the snippet will generate a random hash each time the page is refreshed**. This way, it helps you reproduce the conditions in which your token will be executed on fxhash.

The code snippet exposes the `$fx` object with the following structure:

```typescript
{
  hash: String, // a random 64 characters hexadecimal string. This particular variable will be hardcoded with a static hash when someone mints a token from your GT
  rand: () => Number, // a PRNG function seeded with the hash, that generates deterministic PRN between 0 and 1
  minter: String, // The string of the wallet address of the minter injected into the iteration
  randminter: () => Number, // a PRNG function seeded with the minter address that generates deterministic PRN between 0 and 1
  preview: () => void, // trigger for capture module
  isPreview: Boolean, // is TRUE when capture module is running the project
  params: (definitions) => void, // sets your projects fx(params) definitions
  getParam: (id: String) => any, // get transformed fx(params) value by id
  getParams: () => any, // get all transformed fx(params) values
  getRawParam: (id: String) => any, // get raw fx(params) value by id
  getRawParams: () => any, // get all raw fx(params) values
  getDefinitions: () => any, // get all fx(params) definitions
  features: (features) => void, // sets your projects features
  getFeature: (id: String) => any, // get feature by id
  getFeatures: () => any, // get all features
  stringifyParams: (definitions) => string, // JSON.stringify that can handle bigint
  _getInfoHandler: () => void, // post the defined params and features manually to (fx) lens
  _userGetInfoHandler: undefined | () => void, // an override for posting param definitions 
}
```

_The index.js of this boilerplate quickly demonstrates how to use the whole "SDK"_.

### How do Generative Tokens work

This is how Generative Tokens work on fxhash:

- you upload your project to the platform (see next section)
- you mint your project
- when a collector will mint its unique token from your Generative Token, a random hash will be hard-coded in the fxhash code snippet
- the token will now have its own index.html file, with a static hash, ensuring its immutability

The [Guide to mint a Generative Token](https://www.fxhash.xyz/doc/artist/guide-publish-generative-token) give in-depth details about this process.

## fx(params) types

The following fx(params) types are available. All types share the same attributes but have different options available to e.g. constrain your parameters to your needs.

The available fx(params) types are:

- `number`: `Number` aka float64
- `bigint`: `BigInt` aka int64
- `boolean`: `boolean`
- `color`: Color in 8-hexdigit and abbreviations
- `string`: String with max 64 characters
- `select`: Selection of provided options options

_The index.js of this boilerplate quickly demonstrates a meaningfull configuration for each fx(params) type_.

### Base Attributes

All param share a few base attributes and have each param has a type paramsspecific options attribute to adjust the param to your needs.

```typescript
{
  id: string, // required
  name?: string, // optional, if not defined name == id
  type: "number" | "bigint" | "boolean" | "color" | "string" | "select", // required
  default?: string | number | bigint | boolean, // optional (see Randomization)
  options: TYPE_SPECIFIC_OPTIONS, // different options per type (see below)
}
```

### Randomization

The fxhash snippet generates a random value for each parameter. The random value generation happens within the defined constrains of the parameter definition. Each parameter has the possibility to define a `default` value. Setting the default will prevent the parameter to be initialised with a random value. This can be relevant during the development stage but is also relevant to consider for the final minting flow, when the user will define the final parameter configuration for the uniquely minted token.

### Type specific options

#### `number`

All options are optional.

Options:

```typescript
{
  min?: number,
  max?: number,
  step?: number,
}
```

#### `bigint`

All options are optional.

Options:

```typescript
{
  min?: number | bigint,
  max?: number | bigint,
}
```

#### `boolean`

No options.

Options:

```typescript
undefined;
```

#### `color`

No options.

Options:

```typescript
undefined;
```

#### `string`

All options are optional.

Options:

```typescript
{
  minLength?: number,
  maxLength?: number,
}
```

#### `select`

Options are required. They define the options of the select

Options:

```typescript
{
  options: string[],
}
```

### Transformation

For ease of usage the fx(params) are being transformed into their type specific representation.

#### `number`

[getFloat64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat64)

#### `bigint`

[getBigInt64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getBigInt64)

#### `boolean`

_not transformed_

#### `string`

_not transformed_

#### `color`

```typescript
{
 hex: {
  rgb: '#ff0000',
  rgba: '#ff0000ff',
 },
 obj: {
  rgb: { r, g, b},
  rgba: { r, g, b, a },
 },
 arr: {
  rgb: [r,g,b],
  rgba: [r,g,b,a],
 },
}
```

## Param Functions 

The fx(snippet) exposes two functions to define the params and features available using the data structures above:

- `params(attrs:[])` with an array of (fx)params attribute types defined
- `features(feats: {})` with an object of `key:value` parameters that are defined for this iteration

The fx(snippet) exposes two different way to retrieve fx(params) values:

- `getParam` and `getParams` will return the transformed values as described above
- `getRawParam` and `getRawParams` will return the raw values after being serialized from the bytestring and without any transformation

## Lazy Parameter Definitions

The (fx)lens container will try and request the params for your project as soon as possible, so you will either need to have executed the `$fx.params([])` function call near the beginning of your execution before any time consuming functions, or you can define your own handler for when the `getInfo` event is emit'd to be able to delay the response.

```js
window.$fx._userGetInfoHandler = (event) => {
  // we *might* have them by now 
  if (window.$fx.getParams()) {
    // we got them submit if havent already
    window.$fx._getInfoHandler();
  }
};

// defaut to minting
let contextFn = minting;
if ($fx.context === "standalone" || $fx.context === "capture") {
  // define the contextFn that is called when params are made and we start
  // the main event loop 
  contextFn = final; // see final.js for implementation
}

document.body.classList.add($fx.context);

const makeParams = (ready) => {
  // params are always same but default was calc'd
  // or pick a reasons
  const waiting = 1000 + $fx.rand() * 3000;
  setTimeout(() => {
    $fx.params([
      ...,
     {
        id: "waited",
        name: "Waited",
        type: "number",
        update: "code-driven",
        default: waiting,
        options: {
          min: 0.01,
          max: 20000,
          step: 0.00001,
        },
      },
    ]);
    if (ready) ready();
  }, waiting);
};

// make params that may not complete too fast
// callback to run postmessage when they are...
makeParams(() => {
  // post params to lens
  window.$fx._getInfoHandler(parent);
  // continue with context mode
  contextFn();
});
```

## Start your project with fx(lens)

The fx(lens) offers an interactive environment to tweak and develop your generative token project.

- `npm start`: Starts two local http server
  - `localhost:3301` serves your project with live reloading
  - `localhost:3300` serves fx(lens) you can connect to a token
- Visìt `http://localhost:3300/?target=http://localhost:3301` to see your local project within fx(lens)

## Publish your project

> **⚠️ Disclaimer**: Sandbox is not yet compatible with fx(params).

- `npm run build`: Will create `dist-zipped/project.zip` file

Go to https://fxhash.xyz/sandbox/ and upload the project.zip file in there to see if it works properly. If your token does not work properly, you can iterate easily by updating your files, running $ npm run build again, and upload the zip file again.

Finally, you can mint your token using the same `project.zip` file.
