#= require trix/controllers/abstract_editor_controller
#= require trix/controllers/input_controller
#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/controllers/debug_controller
#= require trix/models/composition
#= require trix/lib/selection_observer
#= require trix/lib/mutation_observer

class Trix.EditorController extends Trix.AbstractEditorController
  initialize: ->
    @textController = new Trix.TextController @textElement, @text, @config
    @textController.delegate = this

    @composition = new Trix.Composition @text, @config
    @composition.delegate = this
    @composition.selectionDelegate = @textController

    if @config.useInputEvents
      @inputController = new Trix.InputController @textElement
      @inputController.delegate = this
      @inputController.responder = @composition

    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

    @mutationObserver = new Trix.MutationObserver @textElement
    @mutationObserver.delegate = this

    @toolbarController = new Trix.ToolbarController @toolbarElement
    @toolbarController.delegate = this

    @debugController = new Trix.DebugController @debugElement, @textController.textView, @composition
    @debugController.render()

  # Composition controller delegate

  compositionDidChangeText: (composition, text) ->
    @textController.render()
    @saveSerializedText()

  compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  # Text controller delegate

  textControllerWillRender: ->
    @mutationObserver.stop()

  textControllerDidRender: ->
    @debugController.render()
    @mutationObserver.start()

  textControllerDidFocus: ->
    @toolbarController.hideDialog() if @dialogWantsFocus

  textControllerDidChangeSelection: ->
    @debugController.render()

  # Input controller delegate

  inputControllerWillComposeCharacters: ->
    @textController.lockSelection()

  inputControllerDidComposeCharacters: (composedString) ->
    @textController.render()
    @textController.unlockSelection()
    @composition.insertString(composedString)

  # Selection observer delegate

  selectionDidChange: (range) ->
    @textController.selectionDidChange(range)
    @composition.updateCurrentAttributes()
    @debugController.render()

  # Mutation observer delegate

  elementDidMutate: (mutations) ->
    @composition.replaceHTML(@textElement.innerHTML)

  # Toolbar controller delegate

  toolbarDidToggleAttribute: (attributeName) ->
    @composition.toggleCurrentAttribute(attributeName)
    @textController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @composition.setCurrentAttribute(attributeName, value)
    @textController.focus()

  toolbarWillShowDialog: (wantsFocus) ->
    @dialogWantsFocus = wantsFocus
    @expandSelectionForEditing()
    @freezeSelection() if wantsFocus

  toolbarDidHideDialog: ->
    @textController.focus()
    @thawSelection()
    delete @dialogWantsFocus

  # Selection management

  freezeSelection: ->
    unless @selectionFrozen
      @textController.lockSelection()
      @composition.freezeSelection()
      @selectionFrozen = true

  thawSelection: ->
    if @selectionFrozen
      @textController.unlockSelection()
      @composition.thawSelection()
      delete @selectionFrozen

  expandSelectionForEditing: ->
    for key, value of Trix.attributes when value.parent
      if @composition.hasCurrentAttribute(key)
        @textController.expandSelectedRangeAroundCommonAttribute(key)
        break
