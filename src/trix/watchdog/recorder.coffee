#= require trix/watchdog/recording
#= require trix/watchdog/serializer

class Trix.Watchdog.Recorder
  constructor: (@element, {@snapshotLimit} = {}) ->
    @recording = new Trix.Watchdog.Recording

  start: ->
    return if @started
    @installMutationObserver()
    @installEventListeners()
    @recordSnapshot()
    @started = true

  stop: ->
    return unless @started
    @uninstallMutationObserver()
    @uninstallEventListeners()
    @started = false

  log: (message) ->
    @recording.recordEvent(type: "log", message: message)

  installMutationObserver: ->
    @mutationObserver = new MutationObserver @recordSnapshotDuringNextAnimationFrame
    @mutationObserver.observe(@element, attributes: true, characterData: true, childList: true, subtree: true)

  uninstallMutationObserver: ->
    @mutationObserver.disconnect()
    @mutationObserver = null

  recordSnapshotDuringNextAnimationFrame: =>
    @animationFrameRequest ?= requestAnimationFrame =>
      @animationFrameRequest = null
      @recordSnapshot()

  installEventListeners: ->
    @element.addEventListener("input", @handleEvent, true)
    @element.addEventListener("keypress", @handleEvent, true)
    document.addEventListener("selectionchange", @handleEvent, true)

  uninstallEventListeners: ->
    @element.removeEventListener("input", @handleEvent, true)
    @element.removeEventListener("keypress", @handleEvent, true)
    document.removeEventListener("selectionchange", @handleEvent, true)

  handleEvent: (event) =>
    switch event.type
      when "input"
        @recordInputEvent(event)
      when "keypress"
        @recordKeypressEvent(event)
      when "selectionchange"
        @recordSnapshotDuringNextAnimationFrame()

  recordInputEvent: (event) ->
    @recording.recordEvent(type: "input")

  recordKeypressEvent: (event) ->
    @recording.recordEvent
      type: "keypress"
      altKey: event.altKey
      ctrlKey: event.ctrlKey
      metaKey: event.metaKey
      shiftKey: event.shiftKey
      keyCode: event.keyCode
      charCode: event.charCode
      character: characterFromKeyboardEvent(event)

  recordSnapshot: ->
    @recording.recordSnapshot(@getSnapshot())
    @recording.truncateToSnapshotCount(@snapshotLimit) if @snapshotLimit?

  getSnapshot: ->
    serializer = new Trix.Watchdog.Serializer @element
    serializer.getSnapshot()

  characterFromKeyboardEvent = (event) ->
    if event.which is null
      String.fromCharCode(event.keyCode)
    else if event.which isnt 0 and event.charCode isnt 0
      String.fromCharCode(event.charCode)
