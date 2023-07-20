const fs = require("fs")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const SNIPPET_PATH = path.join(__dirname, "..", "..", "files", "snippet.js")

class InjectHead {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("InjectHead", (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        "InjectHead",
        (data, callback) => {
          // load the snippet code from the file in lib
          const snippet = fs.readFileSync(SNIPPET_PATH, "utf-8")

          // find the position of the </head> characters
          const match = /<head>/.exec(data.html)
          if (!match) {
            throw new Error(
              'Missing "</head>" in your HTML. fxlens needs it to inject the fxhash snippet.'
            )
          }
          data.html = [
            data.html.slice(0, match.index + 6),
            "\n",
            '<script id="fxhash-snippet">\n',
            snippet,
            "</script>",
            data.html.slice(match.index + 6),
          ].join("")
          callback(null, data)
        }
      )
    })
  }
}

module.exports = InjectHead
