{getDOMRange} = Trix

class Trix.SelectionChangeObserver extends Trix.BasicObject
  constructor: ->
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

Trix.selectionChangeObserver ?= new Trix.SelectionChangeObserver
