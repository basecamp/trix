import { makeElement } from "trix/core/helpers/dom"

// https://github.com/mathiasbynens/unicode-2.1.8/blob/master/Bidi_Class/Right_To_Left/regex.js
const RTL_PATTERN =
  /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/

export const getDirection = (function() {
  const input = makeElement("input", { dir: "auto", name: "x", dirName: "x.dir" })
  const textArea = makeElement("textarea", { dir: "auto", name: "y", dirName: "y.dir" })
  const form = makeElement("form")
  form.appendChild(input)
  form.appendChild(textArea)

  const supportsDirName = (function() {
    try {
      return new FormData(form).has(textArea.dirName)
    } catch (error) {
      return false
    }
  })()

  const supportsDirSelector = (function() {
    try {
      return input.matches(":dir(ltr),:dir(rtl)")
    } catch (error) {
      return false
    }
  })()

  if (supportsDirName) {
    return function(string) {
      textArea.value = string
      return new FormData(form).get(textArea.dirName)
    }
  } else if (supportsDirSelector) {
    return function(string) {
      input.value = string
      if (input.matches(":dir(rtl)")) {
        return "rtl"
      } else {
        return "ltr"
      }
    }
  } else {
    return function(string) {
      const char = string.trim().charAt(0)
      if (RTL_PATTERN.test(char)) {
        return "rtl"
      } else {
        return "ltr"
      }
    }
  }
})()
