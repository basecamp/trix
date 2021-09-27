import Trix from "trix/global"
import ObjectView from "trix/views/object_view"
import AttachmentView from "trix/views/attachment_view"
import PreviewableAttachmentView from "trix/views/previewable_attachment_view"

import { makeElement, findInnerElement, getTextConfig } from "trix/core/helpers"

export default class PieceView extends ObjectView
  constructor: ->
    super(arguments...)
    @piece = @object
    @attributes = @piece.getAttributes()
    {@textConfig, @context} = @options

    if @piece.attachment
      @attachment = @piece.attachment
    else
      @string = @piece.toString()

  createNodes: ->
    nodes = if @attachment
      @createAttachmentNodes()
    else
      @createStringNodes()

    if element = @createElement()
      innerElement = findInnerElement(element)
      innerElement.appendChild(node) for node in nodes
      nodes = [element]
    nodes

  createAttachmentNodes: ->
    constructor = if @attachment.isPreviewable()
      PreviewableAttachmentView
    else
      AttachmentView

    view = @createChildView(constructor, @piece.attachment, {@piece})
    view.getNodes()

  createStringNodes: ->
    if @textConfig?.plaintext
      [document.createTextNode(@string)]
    else
      nodes = []
      for substring, index in @string.split("\n")
        if index > 0
          element = makeElement("br")
          nodes.push(element)

        if length = substring.length
          node = document.createTextNode(@preserveSpaces(substring))
          nodes.push(node)
      nodes

  createElement: ->
    styles = {}

    for key, value of @attributes when config = getTextConfig(key)
      if config.tagName
        pendingElement = makeElement(config.tagName)

        if innerElement
          innerElement.appendChild(pendingElement)
          innerElement = pendingElement
        else
          element = innerElement = pendingElement

      if config.styleProperty
        styles[config.styleProperty] = value

      if config.style
        styles[key] = value for key, value of config.style

    if Object.keys(styles).length
      element ?= makeElement("span")
      element.style[key] = value for key, value of styles
    element

  createContainerElement: ->
    for key, value of @attributes when config = getTextConfig(key)
      if config.groupTagName
        attributes = {}
        attributes[key] = value
        return makeElement(config.groupTagName, attributes)

  nbsp = Trix.NON_BREAKING_SPACE

  preserveSpaces: (string) ->
    if @context.isLast
      string = string.replace(/\ $/, nbsp)

    string = string
      .replace(/(\S)\ {3}(\S)/g, "$1 #{nbsp} $2")
      .replace(/\ {2}/g, "#{nbsp} ")
      .replace(/\ {2}/g, " #{nbsp}")

    if @context.isFirst or @context.followsWhitespace
      string = string.replace(/^\ /, nbsp)

    string
