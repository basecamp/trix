import BasicObject from "trix/core/basic_object"

export default class SelectionChangeObserver extends BasicObject
  constructor: ->
    super(arguments...)
    @selectionManagers = []

  start: ->
    unless @started
      @started = true
      if "onselectionchange" of document
        document.addEventListener "selectionchange", @update, true
      else
        @run()

  stop: ->
    if @started
      @started = false
      document.removeEventListener "selectionchange", @update, true

  registerSelectionManager: (selectionManager) ->
    unless selectionManager in @selectionManagers
      @selectionManagers.push(selectionManager)
      @start()

  unregisterSelectionManager: (selectionManager) ->
    @selectionManagers = (s for s in @selectionManagers when s isnt selectionManager)
    @stop() if @selectionManagers.length is 0

  notifySelectionManagersOfSelectionChange: ->
    for selectionManager in @selectionManagers
      selectionManager.selectionDidChange()

  update: =>
    domRange = getDOMRange()
    unless domRangesAreEqual(domRange, @domRange)
      @domRange = domRange
      @notifySelectionManagersOfSelectionChange()

  reset: ->
    @domRange = null
    @update()

  # Private

  run: =>
    if @started
      @update()
      requestAnimationFrame(@run)

  domRangesAreEqual = (left, right) ->
    left?.startContainer is right?.startContainer and
      left?.startOffset is right?.startOffset and
      left?.endContainer is right?.endContainer and
      left?.endOffset is right?.endOffset

export selectionChangeObserver = new SelectionChangeObserver

export getDOMSelection = ->
  selection = window.getSelection()
  selection if selection.rangeCount > 0

export getDOMRange = ->
  if domRange = getDOMSelection()?.getRangeAt(0)
    unless domRangeIsPrivate(domRange)
      domRange

export setDOMRange = (domRange) ->
  selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(domRange)
  selectionChangeObserver.update()

# In Firefox, clicking certain <input> elements changes the selection to a
# private element used to draw its UI. Attempting to access properties of those
# elements throws an error.
# https://bugzilla.mozilla.org/show_bug.cgi?id=208427
domRangeIsPrivate = (domRange) ->
  nodeIsPrivate(domRange.startContainer) or nodeIsPrivate(domRange.endContainer)

nodeIsPrivate = (node) ->
  not Object.getPrototypeOf(node)
