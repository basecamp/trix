#= require trix/watchdog/recording
#= require trix/watchdog/player_controller

Trix.registerElement "trix-watchdog-player",
  defaultCSS: """
    %t > div { display: -webkit-flex; display: flex; font-size: 14px; margin: 10px 0 }
    %t > div > button { width: 65px }
    %t > div > input { width: 100%; -webkit-align-self: stretch; align-self: stretch; margin: 0 20px }
    %t > div > span { display: inline-block; text-align: center; width: 110px }
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
