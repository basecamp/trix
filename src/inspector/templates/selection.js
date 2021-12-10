window.JST ||= {}

window.JST["trix/inspector/templates/selection"] = () -> """
Location range: [#{ @locationRange[0].index }:#{ @locationRange[0].offset }, #{ @locationRange[1].index }:#{ @locationRange[1].offset }]

#{ charSpans(@characters).join("\n") }
"""

charSpans = (characters) ->
  for char in characters
    "<span class=\"character #{ "selected" if char.selected  }\">#{ char.string }</span>"
