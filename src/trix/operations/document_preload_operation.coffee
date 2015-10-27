class Trix.DocumentPreloadOperation extends Trix.Operation
  constructor: (@url) ->

  perform: (callback) ->
    request = new XMLHttpRequest
    request.open("GET", @url)

    request.onload = =>
      callback(true, request.responseText)

    request.onerror = ->
      callback(false)

    request.send()
