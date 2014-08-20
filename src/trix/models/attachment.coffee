#= require trix/utilities/object

class Trix.Attachment extends Trix.Object
  constructor: (@file) ->
    super

  getPreviewURL: (callback) ->
    if @previewURL?
      callback(@previewURL)
    else if @file?
      reader = new FileReader
      reader.onload = (event) =>
        return unless @file?
        callback(@previewURL = event.target.result)
      reader.readAsDataURL(@file)

  cleanup: ->
    delete @file
    delete @previewURL
