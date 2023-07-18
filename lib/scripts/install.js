/**
 * @author fxhash <https://fxhash.xyz>
 * @license MIT
 *
 * This script downloads the latest compiled version of fx(studio) from its
 * repository, which comes ready to be exposed by a server such as express.
 */
const fs = require("fs")
const path = require("path")
const { logger } = require("./shared/utils/log")
const { pullSnippet, saveSnippet } = require("./shared/utils/snippet")
const sha1 = require("./shared/utils/sha1")
const { readLockFile, updateLockFile } = require("./shared/utils/fxhash-lock")
const { detectChanges, updateToolkit } = require("./shared/changes")

const REPO_ROOT = path.dirname(path.dirname(__dirname))

async function main() {
  let changes = []

  await logger.step(
    "(fx) searching for latest changes",
    async () => {
      changes = await detectChanges()
    },
    null
  )

  if (changes.length > 0) {
    await logger.step("(fx) pulling latest changes", async () => {
      await updateToolkit(changes)
    })
  } else {
    logger.success("Everything up-to-date")
  }
}
main()
