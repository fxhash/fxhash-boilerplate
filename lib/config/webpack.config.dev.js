const path = require("path")
const config = require("./webpack.config")
const env = require("./env")
const InjectHead = require("./plugins/InjectHead")

module.exports = {
  ...config,
  mode: "development",
  devServer: {
    // disables the Hot Module Replacement feature because probably not ideal
    // in the context of generative art
    // https://webpack.js.org/concepts/hot-module-replacement/
    hot: false,
    port: env.PORT_PROJECT,
    // server resources from the public folder, located in /project
    static: {
      directory: path.join(__dirname, "..", "..", "project", "public"),
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  plugins: [
    ...config.plugins,
  ]
}
