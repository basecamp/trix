#= require trix/view

class Trix.EditorView extends Trix.View
  constructor: (@editor, @outerElement) ->
    @element = @createElement "div", "editor_view", """
      position: absolute;
      overflow: auto;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    """
    @outerElement.appendChild @element
    @outerElement.addEventListener "focus", @onFocus, false
    @outerElement.addEventListener "blur", @onBlur, false

  onFocus: =>
    @editor.didReceiveFocus()

  onBlur: =>
    @editor.didLoseFocus()
