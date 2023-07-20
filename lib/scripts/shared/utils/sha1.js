const crypto = require("crypto")

module.exports = (str) => {
  const sha = crypto.createHash("sha1")
  sha.update(str)
  return sha.digest("hex")
}
