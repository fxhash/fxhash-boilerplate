/**
 * @author fxhash <https://fxhash.xyz>
 * @license MIT
 * 
 * This script downloads the latest compiled version of fx(studio) from its
 * repository, which comes ready to be exposed by a server such as express.
 */
const downloader = require("github-download-directory")
const fs = require("fs")

console.log("(fx) installing fx(lens) in the project's folder")

downloader.download("fxhash", "fxlens", "build").then(() => {
  console.log("Done downloading")
  // if the folder fxlens already exists, clear it
  fs.rmSync("./lib/fxlens", { recursive: true, force: true })
  // move download to ./lib/fxlens
  fs.renameSync("./build", "./lib/fxlens")
}, console.error)
