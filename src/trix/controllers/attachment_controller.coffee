#= require trix/models/attachment

class Trix.AttachmentController
  @create = ({attachment, element, container}) ->
    if attachment.isImage()
      new Trix.ImageAttachmentController attachment, element, container

  constructor: (@attachment, @element, @container) ->
    @install()

  install: ->

  uninstall: ->
    @delegate?.attachmentControllerDidUninstall()

  getDimensions: (element) ->
    style = window.getComputedStyle(element)
    dimensions = {}
    dimensions[key] = style[key] for key in ["width", "height"]
    dimensions

  setStyle: (element, attributes) ->
    element.style[key] = value for key, value of attributes
