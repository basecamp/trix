#= require trix/utilities/object

class Trix.Block extends Trix.Object
  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (@text = new Trix.Text, attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)

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

  toJSON: ->
    text: @text
    attributes: @getAttributes()

  # Splittable

  getLength: ->
    @text.getLength()

  canBeConsolidatedWith: (block) ->
    false

  splitAtOffset: (offset) ->
