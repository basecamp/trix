#= require_self
#= require_tree .

class Trix.DocumentView
  constructor: (@element, @document) ->

  render: ->
    @element.removeChild(@element.lastChild) while @element.lastChild
    @document.eachBlock (block, index) =>
      textView = new Trix.TextView block, index
      @element.appendChild(textView.render())

  focus: ->
    @element.focus()
