#= require rich_text/text
#= require rich_text/input
#= require rich_text/renderer

class RichText.Controller
  constructor: (@element) ->
    @element.setAttribute("contenteditable", "true")
    @text = new RichText.Text
    @input = new RichText.Input @element
    @input.delegate = this
    @input.install()
    @renderer = new RichText.Renderer(@text)

  getPosition: ->
    selection = window.getSelection()
    selection.collapseToEnd()
    range = selection.getRangeAt(0)
    position = @text.getLength()

    node = range.startContainer
    if node.nodeType is Node.TEXT_NODE
      parent = node.parentNode
      if parent.nodeType is Node.ELEMENT_NODE and parent.tagName?.toLowerCase() is "span"
        position = parseInt(parent.getAttribute("data-position"), 10)
        position += range.startOffset

    position

  didTypeCharacter: (character) ->
    @insertString(character)

  didPressBackspace: ->
    @backspace()

  didPressReturn: ->
    @insertString("\n")

  insertString: (string) ->
    @text.insertTextAtPosition(new RichText.Text(string), @getPosition())
    @render()

  backspace: ->
    position = @getPosition()
    @text.removeTextAtRange([position - 1, position]) if position > 0
    @render()

  render: ->
    @element.innerHTML = ""
    @element.appendChild(@renderer.render())
    @updateSelection()

  updateSelection: ->
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.selectAllChildren(@element)
    selection.collapseToEnd()
