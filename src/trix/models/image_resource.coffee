#= require trix/models/resource

class Trix.ImageResource extends Trix.Resource
  fetch: (callback) ->
    @image = new Image
    @image.onload = callback
    @image.src = @url

  release: ->
    super
    delete @image

  getImageDimensions: (callback) ->
    @performWhenLoaded ->
      callback(width: @image.width, height: @image.height)
