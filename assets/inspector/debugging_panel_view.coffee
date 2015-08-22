#= require ./inspector_panel_view

class Trix.DebuggingPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    {@documentController, @inputController} = @editorController
    @handleEvent "click", onElement: @element, matchingSelector: "label", withCallback: @didClickCheckbox
    @handleEvent "click", onElement: @element, matchingSelector: "button[data-action=render]", withCallback: @didClickRenderButton
    @handleEvent "click", onElement: @element, matchingSelector: "button[data-action=parse]", withCallback: @didClickParseButton

  render: =>
    super
    for checkbox in @element.querySelectorAll("input")
      checkbox.checked = @["#{checkbox.name}CheckboxIsChecked"]?()

  didClickCheckbox: (event, label) =>
    checkbox = label.querySelector("input")
    @["didClick#{capitalize checkbox.name}Checkbox"]?(checkbox.checked)

  didClickViewCachingCheckbox: (checked) ->
    if checked
      @documentController.enableViewCaching()
    else
      @documentController.disableViewCaching()

  viewCachingCheckboxIsChecked: ->
    @documentController.isViewCachingEnabled()

  didClickRenderButton: =>
    @editorController.render()

  didClickParseButton: =>
    @editorController.reparse()

  capitalize = (string) ->
    string.charAt(0).toUpperCase() + string.substring(1)
