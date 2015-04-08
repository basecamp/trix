#= require trix/watchdog/recording
#= require trix/watchdog/player_controller

Trix.defineElement class extends Trix.Element
  @tagName: "trix-watchdog-player"

  @defaultCSS: """
    %t > div { display: -webkit-flex; display: flex; font-size: 14px; margin: 10px 0 }
    %t > div > button { width: 65px }
    %t > div > input { width: 100%; -webkit-align-self: stretch; align-self: stretch; margin: 0 20px }
    %t > div > div { display: -webkit-inline-flex; display: inline-flex; width: 110px }
    %t > div > div { -webkit-justify-content: space-between; justify-content: space-between }
  """

  attachedCallback: ->
    if url = @getAttribute("src")
      @fetchRecordingAtURL(url)

  attributeChangedCallback: (attributeName, oldValue, newValue) ->
    if attributeName is "src"
      @fetchRecordingAtURL(newValue)

  fetchRecordingAtURL: (url) ->
    @activeRequest?.abort()
    @activeRequest = new XMLHttpRequest
    @activeRequest.open("GET", url)
    @activeRequest.send()
    @activeRequest.onload = =>
      json = @activeRequest.responseText
      @activeRequest = null
      recording = Trix.Watchdog.Recording.fromJSON(JSON.parse(json))
      @loadRecording(recording)

  loadRecording: (recording) ->
    @controller = new Trix.Watchdog.PlayerController this, recording
