const HtmlWebpackPlugin = require("html-webpack-plugin")

class InjectHead {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("InjectHead", (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        "InjectHead",
        (data, callback) => {
          // find the position of the </head> characters
          const match = /<\/head>/.exec(data.html)
          if (!match) {
            throw new Error("Missing \"</head>\" in your HTML. fxlens needs it to inject its code to extract data from your project.")
          }
          data.html = [
            data.html.slice(0, match.index),
            this.options.inject,
            data.html.slice(match.index)
          ].join('')
          callback(null, data)
        }
      )
    })
  }
}

module.exports = InjectHead