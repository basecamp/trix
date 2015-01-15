#= require trix/models/operation

class Trix.PreloadImageOperation extends Trix.Operation
  constructor: (@url) ->

  perform: (callback) ->
    image = new Image
    image.onload = -> callback(true, image)
    image.onerror = -> callback(false)
    image.src = @url

