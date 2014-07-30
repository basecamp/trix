#= require trix/utilities/object

class Trix.Block extends Trix.Object
  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (@text = new Trix.Text, attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)

  isEmpty: ->
    @text.toString() is ""

  copyWithText: (text) ->
    new @constructor text, @attributes

  copyWithAttributes: (attributes) ->
    new @constructor @text, attributes

  addAttribute: (attribute, value) ->
    @copyWithAttributes @attributes.add(attribute, value)

  removeAttribute: (attribute) ->
    @copyWithAttributes @attributes.remove(attribute)

  getAttributes: ->
    @attributes.toObject()

  hasAttributes: ->
    @attributes.getKeys().length > 0

  contentsForInspection: ->
    text: @text.inspect()
    attributes: @attributes.inspect()

  toJSON: ->
    text: @text
    attributes: @getAttributes()

  # Splittable

  getLength: ->
    @text.getLength()

  canBeConsolidatedWith: (block) ->
    false

  consolidateWith: (block) ->
    @copyWithText(@text.appendText(block.text))

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @getLength()
      left = this
      right = null
    else
      left = @copyWithText(@text.getTextAtRange([0, offset]))
      right = @copyWithText(@text.getTextAtRange([offset, @getLength()]))
    [left, right]

  toString: ->
    @text.toString()
