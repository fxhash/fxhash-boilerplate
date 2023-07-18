/**
 * @author fxhash <https://fxhash.xyz>
 * @license MIT
 *
 * Starts the fxhash boilerplate dev environment. The dev environment has 2
 * components:
 *  - fx(studio), pulled after `npm install`, exposed on 3300
 *  - the boilerplate server, exposing the project files with live reloading on
 *    port 3301
 * An express server will expose fx(studio) and will be started by this script,
 * and webpack-live-server will be started to expose the project itself.
 */

const path = require("path")
const fs = require("fs")
const express = require("express")
const chalk = require("chalk")
const yesno = require("yesno")
const { logger: logger2 } = require("./shared/utils/log")

const Webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const open = require("open")

// the environment config
const env = require("../config/env")
const { pullSnippet } = require("./shared/utils/snippet")
const sha1 = require("./shared/utils/sha1")
const { readLockFile } = require("./shared/utils/fxhash-lock")
const { detectChanges, updateToolkit } = require("./shared/changes")
// the webpack dev config
const webpackConfig =
  env.RUN_PROJECT == true
    ? require("../config/webpack.config.dev")
    : require("../config/webpack.config.headless")

// very simple logger interface:
const logger = {
  error: chalk.red.bold,
  success: chalk.green.bold,
  command: (txt) => chalk.bgWhite.bold(` ${txt} `),
  infos: chalk.gray,
  url: chalk.bold.blue,
}

function padn(n, len = 2, char = "0") {
  return n.toString().padStart(len, char)
}

function verifyFxlens(path) {
  const files = fs.readdirSync(path)
  // if no index.html, fxlens has not yet been initialized, throw an error
  if (!files.includes("index.html")) {
    console.log(logger.error("[error] fxlens is not installed\n"))
    console.log(
      `Have you tried running ${logger.command(
        "npm install"
      )} before ${logger.command("npm start")} ?`
    )
    console.log(
      logger.infos(
        "fxlens is pulled from its repository after npm install is called"
      )
    )
    console.log()
    process.exit(1)
  }
}

;(async () => {
  // commonly used variable for ease
  const URL_FXLENS = `http://localhost:${env.PORT_FXSTUDIO}`
  const URL_PROJECT = `http://localhost:${env.PORT_PROJECT}`
  const PATH_FXLENS = path.join(__dirname, "..", "files", "fxlens")

  try {
    // detect eventual changes to fxlens or snippet
    let changes
    try {
      changes = await detectChanges()
    } catch (err) {
      console.log(err.message)
      throw new Error("could not properly check updates of snippet")
    }
    // if there are changes
    if (changes.length > 0) {
      // ask if the user wants to update the toolkit
      const ok = await yesno({
        question: `\n${chalk.bold.yellow(
          "⚠️\nA new version of the fxhash toolkit is available, do you want to install it ?"
        )}\n${chalk.dim("No change will be made to your code")}\nyes/no:`,
      })
      console.log("")
      // if no, we inform that it could create unexpected behaviors
      if (!ok) {
        console.log(
          `${chalk.bold.red(
            "It is highly recommended to update the tookit, as fxhash is now based on it. Not doing so may result in unexpected behaviours when the project will be published."
          )}`
        )
        console.log(chalk.dim("Starting anyways...\n"))
      }
      // otherwise, trigger the update
      else {
        try {
          await logger2.step(
            "updating toolkit",
            () => updateToolkit(changes),
            () => {
              logger2.success("toolkit is now up-to-date!")
              console.log("")
            }
          )
        } catch (err) {
          console.log(err.message)
          throw new Error("could not update the toolkit properly")
        }
      }
    }
  } catch (err) {
    console.log(chalk.red.bold(`❗ ${err.message}`))
    console.log(chalk.dim("Starting anyways...\n\n"))
  }

  // do some checkups to see if fxlens is available, otherwise throw?
  verifyFxlens(PATH_FXLENS)

  // instanciate compiler and server
  const compiler = Webpack({
    ...webpackConfig,
    // instructions to remove annoying webpack logs, except errors
    // we implement our own minimal logger for a cleaner experience
    infrastructureLogging: {
      level: "error",
    },
    stats: "errors-only",
  })
  const server = new WebpackDevServer(webpackConfig.devServer, compiler)

  if (env.RUN_PROJECT === true) {
    // hook the compilation done event to print custom logs
    compiler.hooks.done.tap("project", (stats) => {
      const hasErrors = stats.hasErrors()
      if (hasErrors) {
        console.log(logger.error("[project] compilation has failed"))
      } else {
        const date = new Date()
        const time = `${padn(date.getHours())}:${padn(
          date.getMinutes()
        )}:${padn(date.getSeconds())}`
        console.log(
          `${logger.success("[project] compiled successfully")} @ ${time}`
        )
      }
    })
  }

  // start the express server to serve static files from the /lib/fxstudio
  // folder to port 3300
  const app = express()
  app.use(express.static(PATH_FXLENS))
  app.listen(env.PORT_FXSTUDIO, () => {
    console.log(
      `${logger.success("[fxlens] fx(lens) is running on")} ${logger.url(
        URL_FXLENS
      )}`
    )
  })

  server.startCallback(() => {
    const target = `${URL_FXLENS}/?target=${URL_PROJECT}`
    const l =
      env.RUN_PROJECT === true
        ? `${logger.success(
            "[project] your project is running on"
          )} ${logger.url(URL_PROJECT)}`
        : `${logger.success(
            "[project] your project might be running on, "
          )} ${logger.url(URL_PROJECT)} ${logger.success(
            "but this is user specified so we don't really know"
          )}`
    console.log(l)
    console.log()
    console.log(`opening fxlens with project as target: ${logger.url(target)}`)
    console.log()
    open(target)
  })
})()
