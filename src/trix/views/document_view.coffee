#= require_self
#= require_tree .

class Trix.DocumentView
  constructor: (@element, @document) ->

  render: ->
    #selectedRange = @getSelectedRange()

    @element.removeChild(@element.lastChild) while @element.lastChild
    @document.eachBlock (block, index) =>
      textView = new Trix.TextView block, index
      @element.appendChild(textView.render())

    #@setSelectedRange(selectedRange) if selectedRange

  focus: ->
    @element.focus()
