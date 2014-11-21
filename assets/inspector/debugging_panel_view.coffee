#= require ./inspector_panel_view

{capitalize} = Trix.Helpers

class Trix.DebuggingPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    {@documentController, @inputController} = @editorController
    @handleEvent "click", onElement: @element, matchingSelector: "label", withCallback: @didClickCheckbox
    @handleEvent "click", onElement: @element, matchingSelector: "button", withCallback: @didClickRenderButton

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

  didClickMobileInputModeCheckbox: (checked) ->
    if checked
      @inputController.enableMobileInputMode()
    else
      @inputController.disableMobileInputMode()

  mobileInputModeCheckboxIsChecked: ->
    @inputController.isMobileInputModeEnabled()

  didClickRenderButton: =>
    @documentController.render()

