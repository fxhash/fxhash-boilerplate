# fx(hash) boilerplate

This boilerplates demonstrates the most simple version of a project published on the fx(hash) platform. There is no external tools required in order to publish a generative artwork based on this boilerplate. You just have to create a zip-file with the contents of the `/src` folder.

As long as you are complying to some basic guidlines this zip-file can be published on the fx(hash) platform:

- You have developed your project with the latest version of the fxhash-snippet
- All files you need must be in the same directory as your index.html
- You are not doing any request to external resources in your project. All path must be relative

### Using the `@fxhash/cli` toolkit

The `@fxhash/cli` provides an interface to differet kind of tools that help you developing your generative artwork.

To use the `@fxhash/cli` you must have the following software installed:
- node >= 14
- npm >= 6.14.4

You don't need to pre-install the `@fxhash/cli`. You have direct access to the interface via `npx fxhash <commmand> [option]`.

## Start developing your token project

- `npx fxhash dev`: Starts a local http server serving your project within fxlens and hot reloading enabled
- Your browser should open automatically otherwise visit `http://localhost:3000/?target=http://localhost:3301/` to see your project in the browser

### fx(hash) API

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

All param share a few base attributes and have each param has a type specific options attribute to adjust the param to your needs.

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
undefined
```

#### `color`

No options.

Options:

```typescript
undefined
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

The fx(snippet) exposes two different way to retrieve fx(params) values:

- `getParam` and `getParams` will return the transformed values as described above
- `getRawParam` and `getRawParams` will return the raw values after being serialized from the bytestring and without any transformation

## Start your project with fx(lens)

The fx(lens) offers an interactive environment to tweak and develop your generative token project.

- `npx fxhash dev`: Starts two local http server
  - `localhost:3301` serves your project with live reloading
  - `localhost:3300` serves fx(lens) you can connect to a token
- Visìt `http://localhost:3300/?target=http://localhost:3301` to see your local project within fx(lens)

## Publish your project

- `npx fxhash build`: Will create `.dist.zip` file

Go to https://fxhash.xyz/sandbox/ and upload the project.zip file in there to see if it works properly. If your token does not work properly, you can iterate easily by updating your files, running $ npm run build again, and upload the zip file again.

Finally, you can mint your token using the same `dist.zip` file.
