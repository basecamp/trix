import json from "@rollup/plugin-json"
import filesize from "rollup-plugin-filesize"
import includePaths from "rollup-plugin-includepaths"
import commonjs from "rollup-plugin-commonjs"
import { babel } from "@rollup/plugin-babel"
import nodeResolve from "rollup-plugin-node-resolve"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nTrix ${version}\nCopyright © ${year} Basecamp, LLC\n */`

export default [
  {
    input: "src/trix/trix.js",
    output: [
      {
        name: "Trix",
        file: "dist/trix.js",
        format: "umd",
        sourcemap: false,
        banner
      }
    ],
    plugins: [
      json(),
      nodeResolve({ extensions: [ ".js" ] }),
      includePaths({
        paths: [ "src" ],
        extensions: [ ".js" ]
      }),
      babel({ babelHelpers: "bundled" }),
      filesize(),
    ],
    context: "window",
    treeshake: false,
    watch: {
      include: "src/**"
    }
  },
  {
    input: "src/test/test.js",
    output: [
      {
        name: "TrixTests",
        file: "dist/test.js",
        format: "umd",
        sourcemap: false,
        banner
      }
    ],
    plugins: [
      json(),
      includePaths({
        paths: [ "src" ],
        extensions: [ ".js" ]
      }),
      nodeResolve({ extensions: [ ".js" ] }),
      commonjs({
        extensions: [ ".js" ]
      }),
      babel({ babelHelpers: "bundled" }),
    ],
    context: "window",
    treeshake: false,
    watch: {
      include: "src/**"
    }
  },
  {
    input: "src/inspector/inspector.js",
    output: [
      {
        name: "TrixInspector",
        file: "dist/trix/inspector.js",
        format: "umd",
        sourcemap: false,
        banner
      }
    ],
    plugins: [
      json(),
      includePaths({
        paths: [ "src" ],
        extensions: [ ".js" ]
      }),
      nodeResolve({ extensions: [ ".js" ] }),
      commonjs({
        extensions: [ ".js" ]
      }),
      babel({ babelHelpers: "bundled" }),
    ],
    context: "window",
    treeshake: false,
    watch: {
      include: "src/**"
    }
  }
]
