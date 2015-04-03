class Trix.Watchdog.Recorder
  constructor: (@element) ->

  start: ->
    return if @started
    @recording = new Trix.Watchdog.Recording
    @installMutationObserver()
    @started = true

  stop: ->
    return unless @started
    @uninstallMutationObserver()
    @started = false

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

  recordSnapshot: ->
    @recording.recordSnapshot(@getSnapshot())

  getSnapshot: ->
    serializer = new Trix.Watchdog.Serializer @element
    serializer.getSnapshot()
