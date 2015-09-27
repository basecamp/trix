#= require trix/inspector/view

{handleEvent} = Trix

class Trix.Inspector.DebugView extends Trix.Inspector.View
  constructor: ->
    super

    handleEvent "change", onElement: @element, matchingSelector: "input[name=viewCaching]", withCallback: @didToggleViewCaching
    handleEvent "click", onElement: @element, matchingSelector: "button[data-action=render]", withCallback: @didClickRenderButton
    handleEvent "click", onElement: @element, matchingSelector: "button[data-action=parse]", withCallback: @didClickParseButton

  didToggleViewCaching: ({target}) =>
    if target.checked
      @compositionController.enableViewCaching()
    else
      @compositionController.disableViewCaching()

  didClickRenderButton: =>
    @editorController.render()

  didClickParseButton: =>
    @editorController.reparse()
