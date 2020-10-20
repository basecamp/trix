Trix.extend
  # https://github.com/mathiasbynens/unicode-2.1.8/blob/master/Bidi_Class/Right_To_Left/regex.js
  RTL_PATTERN: /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/

  getDirection: do ->
    input = Trix.makeElement("input", dir: "auto", name: "x", dirName: "x.dir")
    form = Trix.makeElement("form")
    form.appendChild(input)

    supportsDirName = do ->
      try new FormData(form).has(input.dirName)

    supportsDirSelector = do ->
      try input.matches(":dir(ltr),:dir(rtl)")

    if supportsDirName
      (string) ->
        input.value = string
        new FormData(form).get(input.dirName)
    else if supportsDirSelector
      (string) ->
        input.value = string
        if input.matches(":dir(rtl)") then "rtl" else "ltr"
    else
      (string) ->
        char = string.trim().charAt(0)
        if Trix.RTL_PATTERN.test(char) then "rtl" else "ltr"
