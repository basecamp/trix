#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Selection"
  template: "selection"
  events:
    "trix-selection-change": ->
      @render()
    "trix-render": ->
      @render()

  render: ->
    @document = @editor.getDocument()
    @range = @editor.getSelectedRange()
    @locationRange = @composition.getLocationRange()
    @characters = @getCharacters()
    super

  getCharacters: ->
    chars = []
    utf16string = Trix.UTF16String.box(@document.toString())
    rangeIsExpanded = @range[0] isnt @range[1]
    position = 0
    while position < utf16string.length
      string = utf16string.charAt(position).toString()
      string = "⏎" if string is "\n"
      selected = rangeIsExpanded and (position >= @range[0] and position < @range[1])
      chars.push({string, selected})
      position++
    chars

  getTitle: ->
    "#{@title} (#{@range.join()})"
