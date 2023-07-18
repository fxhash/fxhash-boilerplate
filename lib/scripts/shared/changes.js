const fs = require("fs")
const path = require("path")
const { default: axios } = require("axios")
const { readLockFile, updateLockFile } = require("./utils/fxhash-lock")
const { pullSnippet, saveSnippet } = require("./utils/snippet")
const { Downloader } = require("./utils/gh-downloader")
const { REPO_ROOT, TMP_ROOT } = require("./utils/paths")

const ghDownloader = new Downloader()

const changesManager = {
  fxlens: {
    getVersion: async () => {
      const { data } = await axios.get(
        `https://api.github.com/repos/fxhash/fxlens/commits?path=build&per_page=1`
      )
      return data[0].sha
    },
    update: async (sha) => {
      await ghDownloader.download("fxhash", "fxlens", "build", {
        output: TMP_ROOT,
      })
      // if the folder fxlens already exists, clear it
      fs.rmSync(path.join(REPO_ROOT, "lib", "files", "fxlens"), {
        recursive: true,
        force: true,
      })
      // move download to ./lib/fxlens
      fs.renameSync(
        path.join(TMP_ROOT, "build"),
        path.join(REPO_ROOT, "lib", "files", "fxlens")
      )
      return sha
    },
  },
  snippet: {
    getVersion: async () => {
      const { data } = await axios.get(
        `https://api.github.com/repos/fxhash/fxhash-boilerplate/commits?path=lib/files/snippet.js&per_page=1`
      )
      return data[0].sha
    },
    update: async (sha) => {
      const content = await pullSnippet()
      await saveSnippet(content)
      return sha
    },
  },
}

async function keyWrapper(key, fn) {
  return {
    key,
    version: await fn(),
  }
}

/**
 * Detect the latest version of the artist toolkit modules, and returns the ones
 * that differ from what can be found in the fxhash-lock.json at the root of the
 * script folders.
 */
async function detectChanges() {
  const results = await Promise.all(
    Object.keys(changesManager).map((key) =>
      keyWrapper(key, changesManager[key].getVersion)
    )
  )
  // load the fxhash lock details
  const lock = readLockFile()
  // output the list of changes, based on what's stored in the lock file
  return results.filter(({ key, version }) => lock[`${key}Sha1`] !== version)
}

/**
 * Given a list of changes observed between the latest toolkit published and the
 * ones found locally, pull those changes and update the local version.
 */
async function updateToolkit(changes) {
  const results = await Promise.all(
    changes.map(({ key, version }) =>
      keyWrapper(key, changesManager[key].update.bind(this, version))
    )
  )
  const lockUpdate = Object.fromEntries(
    results.map(({ key, version }) => [`${key}Sha1`, version])
  )
  updateLockFile((current) => ({
    ...current,
    ...lockUpdate,
  }))
}

module.exports = {
  detectChanges,
  updateToolkit,
}
