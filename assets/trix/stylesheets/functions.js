const path = require("path")
const fs   = require("fs")
const sass = require("node-sass")
const { optimize } = require("svgo")

const types = sass.types
const basePath = "./assets/"

module.exports = {
  "svg($svgFileName)": function (svgFileName) {
      const filename = path.resolve(basePath, svgFileName.getValue())

      let svgContent = fs.readFileSync(filename, "utf8")
      svgContent = optimize(svgContent, { multipass: true, datauri: "enc" })

      return new types.String(`url("${svgContent.data}")`)
  }
}
