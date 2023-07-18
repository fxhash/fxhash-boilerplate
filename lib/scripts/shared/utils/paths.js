const path = require("path")

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..")
const TMP_ROOT = path.join(REPO_ROOT, "lib", "tmp")

module.exports = {
  REPO_ROOT,
  TMP_ROOT,
}
