#= require trix/models/attachment

class Trix.AttachmentController
  @create = (attachment, element, container) ->
    if attachment.isImage()
      new Trix.ImageAttachmentController attachment, element, container

  constructor: (@attachment, @element, @container) ->
    @install()

  install: ->

  uninstall: ->
    @delegate?.attachmentControllerDidUninstall()

  getDimensions: (element) ->
    {width, height} = window.getComputedStyle(element)
    {width, height}

  setStyle: (element, attributes) ->
    element.style[key] = value for key, value of attributes
