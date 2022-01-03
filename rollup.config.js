import json from "@rollup/plugin-json"
import includePaths from "rollup-plugin-includepaths"
import commonjs from "rollup-plugin-commonjs"
import { babel } from "@rollup/plugin-babel"
import nodeResolve from "rollup-plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nTrix ${version}\nCopyright © ${year} Basecamp, LLC\n */`

export default [
  {
    input: "src/trix/trix.js",
    output: [
      {
        name: "Trix",
        file: "dist/trix.umd.js",
        format: "umd",
        banner
      },
      {
        file: "dist/trix.js",
        format: "es",
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
    ],
    context: "window",
    treeshake: false,
    watch: {
      include: "src/**"
    }
  },
  {
    input: "src/trix/trix.js",
    output: [
      {
        file: "dist/trix.min.js",
        format: "es",
        banner,
        sourcemap: true
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
      terser({
        mangle: true,
        compress: true,
        format: {
          comments: function (node, comment) {
            const text = comment.value
            const type = comment.type
            if (type == "comment2") {
              // multiline comment
              return /Copyright/.test(text)
            }
          },
        },
      })
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
        format: "es",
        sourcemap: true,
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
        file: "dist/inspector.js",
        format: "es",
        sourcemap: true,
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
