#= require trix/lib/helpers

module "Trix.Helpers"


test "#countGraphemeClusters", ->
  graphemeCountEqual "The quick brown fox", 19

  # U+0041 LATIN CAPITAL LETTER A
  graphemeCountEqual "\u0041", 1

  # U+1D400 MATHEMATICAL BOLD CAPITAL A
  graphemeCountEqual "\uD835\uDC00", 1

  # U+1F4A9 PILE OF POO
  graphemeCountEqual "\uD83D\uDCA9", 1

  # n + U+0303 COMBINING TILDE (ñ)
  graphemeCountEqual "n\u0303", 1

  # n + U+0307 COMBINING DOT ABOVE + U+0323 COMBINING DOT BELOW (ṇ̇)
  graphemeCountEqual "n\u0307\u0323", 1


graphemeCountEqual = (string, count) ->
  equal Trix.Helpers.countGraphemeClusters(string), count, string
