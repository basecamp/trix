#= require trix/models/object

class Trix.Block extends Trix.Object
  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (@text = new Trix.Text, attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)

  addAttribute: (attribute, value) ->
    @attributes = @attributes.add(attribute, value)
    @delegate?.didEditBlock?(this)

  removeAttribute: (attribute) ->
    @attributes = @attributes.remove(attribute)
    @delegate?.didEditBlock?(this)

  getAttributes: ->
    @attributes.toObject()

  toJSON: ->
    text: @text
    attributes: @getAttributes()
