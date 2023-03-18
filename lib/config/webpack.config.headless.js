const path = require("path")
const config = require("./webpack.config")
const env = require("./env")
const InjectHead = require("./plugins/InjectHead")

module.exports = {
  ...config,
  mode: "development",
  devServer: {
    port: env.PORT_PROJECT+1,
  },
  plugins: [
    ...config.plugins,
    new InjectHead({
      inject: `<script>document.domain = "localhost"</script>`,
    }),
  ],
};