const path = require("path")
const fs = require("fs")

const LIB_FOLDER = path.join(__dirname, "..", "..", "..")
const LOCK_FILENAME = "fxhash-lock.json"
const PATH_FILE = path.join(LIB_FOLDER, LOCK_FILENAME)

function readLockFile() {
  // read content of the lock file, if it exists; if not, define as empty obj
  let contents = fs.existsSync(PATH_FILE)
    ? JSON.parse(fs.readFileSync(PATH_FILE))
    : {}
  return contents
}

/**
 * Will update the content of the fxhash lock file. The file is read first to
 * allow updates of existing lock file content.
 * @param {(content: Object => Object)} updateFn takes the current JSON config
 * as first argument and returns the new JSON config object
 */
function updateLockFile(updateFn) {
  // read content of the lock file, if it exists; if not, define as empty obj
  let contents = readLockFile()
  // update using the provided function
  contents = updateFn(contents)
  // write the update
  fs.writeFileSync(PATH_FILE, JSON.stringify(contents, null, 2), {
    flag: "w",
  })
}

module.exports = {
  readLockFile,
  updateLockFile,
}
