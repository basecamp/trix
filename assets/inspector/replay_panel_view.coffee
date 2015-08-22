#= require ./inspector_panel_view

class Trix.ReplayPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    @playerElement = @element.querySelector("trix-watchdog-player")
    @documentElement = @editorController.documentElement

    @recorder = @documentElement.recorder
    @recording = @recorder.recording

  show: ->
    @recorder.stop()

    super

    @playerElement.loadRecording(@recording)
    @iframeElement = @playerElement.querySelector("iframe")
    @documentElement.parentNode.insertBefore(@iframeElement, @documentElement)
    @playerElement.controller.playerDidSeekToIndex(0)

  hide: ->
    super

    @iframeElement.parentNode.removeChild(@iframeElement)
    @recorder.start()
