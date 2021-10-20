FXHASH Generative Token webpack boilerplate
================

A boilerplate to automate and ease the creation of Generative Tokens on fxhash. This project uses [webpack](https://webpack.js.org/) and [webpack-dev-server](https://github.com/webpack/webpack-dev-server) to improve the development and deployment experience.

Before diving into the development of your token, we recommend reading the [Guide to mint a Generative Token](TODO) to get some understanding of the process.


# Scope of this project

* provide a local environment in which you can iterate and use modern features from the javascript ecosystem
* automate the creation of a .zip file ready to be uploaded on fxhash


# How to use

You will need to have [nodejs](https://nodejs.org/) installed.

## Installation

Clone the repository on your machine and move to the directory
```sh
$ git clone HERE_URL your_folder && cd your_folder
```

Install the packages required for the local environment
```sh
$ npm i
```

## Start local environment

```sh
$ npm run dev
```

This last command will start a local http server with [live reloading](https://webpack.js.org/configuration/dev-server/#devserverlivereload) enabled so that you can iterate faster on your projects. Open [http://localhost:8080](http://localhost:8080) to see your project in the browser.

## Build

```sh
$ npm run build
```

Will bundle your js dependencies into a single minified `bundle.js` file, move your files from the `public/` to the `dist/` folder, and link the `bundle.js` with the `index.html`.

**Moreover, it will create a `dist-zipped/project.zip` file which can be directly imported on fxhash**.

# Develop your token

Once the environment is started, you can edit the `src/index.js` file to start building your artwork. The `index.html` file is located in the `public/` folder.

You can import libraries using `npm` or by adding the library file in the `public/` folder and link those using relative paths in the `index.html`.

Any file in the `public/` folder will be added to the final project. 

## fxhash snippet

fxhash requires you to use a javascript code snippet so that the platform can inject some code when tokens will be generated from your Generative Token. The code snippet is already in the `index.html` file of this boilerplate, so you don't have to add it yourself.

**During the development stages, the snippet will generate a random hash each time the page is refreshed**. This way, it helps you reproduce the conditions in which your token will be executed on fxhash.

It creates 3 variables:
* `fxhash`: a 64 characters string representing a hexadecimal number
* `fxhashValues`: an array of 16 pseudo-random values derived from the random hash
* `fxhashValues2`: an array of 8 pseudo-random values derived from the random hash (with more precision than `fxhashValues`)

You can use these values as inputs to your algorithms. *The boilerplate writes those values to the DOM as an example*.

## How do Generative Tokens work

This is how Generative Tokens work on fxhash:
* you upload your project to the platform (see next section)
* you mint your project
* when a collector will mint its unique token from your Generative Token, a random hash will be hard-coded in the **fxhash code snippet**
* the token will now have its own `index.html` file, with a **static** hash, ensuring its immutability 

The [Guide to mint a Generative Token](TODO) give in-depth details about this process.


# Publish your token

Once you are happy with the results, you can run the following command:

```sh
$ npm run build
```

This will create a `dist-zipped/project.zip` file.

Go to [https://fxhash.xyz/sandbox/](https://fxhash.xyz/sandbox/) and upload the `project.zip` file in there to see if it works properly.

If your token does not work properly, you can iterate easily by updating your files, running `$ npm run build` again, and upload the zip file again.

Finally, you can mint your token using the same `project.zip`file.


# Rules to follow

> Theses rules must be followed to ensure that your token will be future-proof, accepted by fxhash, and behave in the intended way

* any path to a resource must be relative (./path/to/file.ext)
* no external resources allowed, you must put all your resources in the `public/` folder (sub-folders are OK)
* no network calls allowed (but calls to get resources from within your `public/` folder)
* you must handle any viewport size (by implementing a response to the `resize` event of the `window`)
* you **cannot use random number generation without a seed** (the same input hash must always yield the same output), the hash can be used as a seed for instance