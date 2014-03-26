#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/controllers/debug_controller
#= require trix/html_parser

class Trix.EditorController
  constructor: (@textElement, toolbarElement, @inputElement, debugElement) ->
    @text = @createText()
    @textController = new Trix.TextController textElement, @text
    @textController.delegate = this
    @toolbarController = new Trix.ToolbarController toolbarElement
    @toolbarController.delegate = this
    @debugController = new Trix.DebugController debugElement, @textController
    @debugController.render()

  createText: ->
    if @textElement.textContent.trim()
      Trix.HTMLParser.createTextFrom(@textElement)
    else if @inputElement?.value
      Trix.Text.fromJSON(@inputElement.value)
    else
      new Trix.Text

  saveSerializedText: ->
    @inputElement?.value = @text.asJSON()

  # Text controller delegate

  textControllerDidRender: ->
    @saveSerializedText()
    @debugController.render()

  textControllerDidFocus: ->
    @toolbarController.hideDialogsThatFocus()

  textControllerDidChangeCurrentAttributes: (currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  textControllerDidChangeSelection: ->
    @debugController.render()

  # Toolbar controller delegate

  toolbarDidToggleAttribute: (attributeName) ->
    @textController.toggleCurrentAttribute(attributeName)
    @textController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @textController.setCurrentAttribute(attributeName, value)
    @textController.focus()

  toolbarDidHideDialog: ->
    @textController.focus()

  toolbarWillShowDialog: ->
    @textController.lockSelection()
