const path = require("path")
const fs = require("fs")
const { default: axios } = require("axios")

const SNIPPET_FOLDER = path.join(__dirname, "..", "..", "..", "files")
const SNIPPET_FILENAME = "snippet.js"

const SNIPPET_FILE_URL = `https://raw.githubusercontent.com/fxhash/fxhash-boilerplate/master/lib/files/snippet.js`

/**
 * Fetches the snippet on the Github repository, and returns its contents
 * @returns {Promise<string>} a promise of the snippet contents
 * @throws {Error} if request fails in any way
 */
async function pullSnippet() {
  const buff = await axios({
    url: SNIPPET_FILE_URL,
    responseType: "arraybuffer",
    timeout: 3000,
  })
  return buff.data.toString()
}

async function saveSnippet(content) {
  fs.writeFileSync(path.join(SNIPPET_FOLDER, SNIPPET_FILENAME), content, {
    flag: "w",
  })
}

module.exports = {
  pullSnippet,
  saveSnippet,
}
