class Trix.Block
  @fromJSONString: (string) ->
    @fromJSON JSON.parse(string)

  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (@text = new Trix.Text, attributes = {}) ->
    @attributes = Trix.Hash.box(attributes)
    @text.delegate = this

  setAttributes: (attributes) ->
    @attributes = @attributes.merge(attributes)
    @delegate?.didEditBlock?(this)

  getAttributes: ->
    @attributes.toObject()

  toJSON: ->
    text: @text
    attributes: @getAttributes()

  # Text delegate

  didEditText: (text) ->
    @delegate?.didEditBlock?(this)
