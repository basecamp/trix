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

  didTypeCharacter: (character) ->
    @insertString(character)

  didPressBackspace: ->
    @backspace()

  didPressReturn: ->
    @insertString("\n")

  insertString: (string) ->
    @text.appendText(new RichText.Text(string))
    @render()

  backspace: ->
    position = @text.getLength()
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
