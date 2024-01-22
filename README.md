# fx(hash) boilerplate

A boilerplate for the creation of generative art that can be published on fx(hash).

## Introduction

This repository contains the most simple and recommended setup to publish a generative artwork on fxhash. You can do modifications to the existing files, create a zip that contains all of them and upload it on fxhash.xyz.

This are the hard facts of the required setup:

- A html entry point called `index.html`
- The `@fxhash/project-sdk` as a local script file included in the html entry point called `./fxhash.min.js`
- A script that generates the generative art included in the html entry point called `index.js`

Anything else from there is optional (even this README 🙃). The boilerplate contains a .css file but this is theoretically not needed if you don't want to set any css.
For a better developer experience we are offering the `@fxhash/cli` that will help you to create your generative artwork.

The rest of the README will actually speak about the usage of the `@fxhash/cli`.

## Prerequisites

- `node >= 18.0.0`
- `npm >= 9.0.0`

That's it you are ready to develop your artwork with the `@fxhash/cli`

### Creating a new project

You probably think: "Why we start with creating a project if I am using the boilerplate?". Thats because you don't need to clone the boilerplate to start a project. You can create a project by using the `@fxhash/cli`.

```
npx fxhash create
```

This command will prompt you with the dialog to create a new project. Give your project a name and choose the "simple" project template. You just created your first project. We will speak about the "ejected" template later.

> The first time you run npx fxhash <command> npm is actually installing the `@fxhash/cli` package globally on your computer.

### Starting the development environment

The whole fx(lens) environment is exposed via the `@fxhash/cli`. So you just have to run the following command in the root of your project.

```
npx fxhash dev
```

This will open up the fx(lens) environment in your browser. In the backend two servers are running:

- `http://localhost:3300` serves fx(lens) you can connect to a token
- `http://localhost:3301` serves your project with live reloading

### Building your project

```
npx fxhash build
```

Will build your project and create an `upload.zip` that you can use to publish your artwork on fxhash.xyz

## Advanced usage: Ejected Project

When you created your first project with `fxhash create` you saw that there is a second project template you can choose: "ejected"

If you want to use a package manager to install dependencies for your project or customize how webpack builds your project, the "ejected" template provides all those functionalities.

The structure of the ejected template will look like this:

```
├─ package.json
├─ webpack.dev.config.js
├─ webpack.prod.config.js
├─ src/
  ├─ index.html
  ├─ index.js
  ├─ fxhash.min.js
  ├─ LICENSE
```

You can still use all the functionality the `@fxhash/cli` provides, but e.g. customize the webpack configuration for the `fxhash dev`(webpack.dev.config.js) and `fxhash build` (webpack.prod.config.js) commands.

### Going from simple to ejected

Even if you started your project with a simple template you can go all "ejected" by running

```
fxhash eject
```

This will transform your simple project structure into the ejected project structure. But be aware this change is not reversable via the `@fxhash/cli`.
