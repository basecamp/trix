Trix.Helpers =
  defer: (fn) ->
    setTimeout fn, 1

  countGraphemeClusters: (string) ->
    string
      # Remove any combining marks, leaving only the symbols they belong to
      .replace(symbolWithCombiningMarks, ($0, symbol, combiningMarks) -> symbol)
      # Account for astral symbols / surrogates
      .replace(astralSymbols, "_")
      # Return length
      .length

# Thank you: http://mathiasbynens.be/notes/javascript-unicode

symbolWithCombiningMarks = ///
  (
    [\0-\u02FF\u0370-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uDC00-\uFE1F\uFE30-\uFFFF]
      |
    [\uD800-\uDBFF][\uDC00-\uDFFF]
      |
    [\uD800-\uDBFF]
  )
  (
    [\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+
  )
///g

astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
