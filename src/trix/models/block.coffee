class Trix.Block
  @fromJSONString: (string) ->
    @fromJSON JSON.parse(string)

  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (@text = new Trix.Text, attributes = {}) ->
    @attributes = Trix.Hash.box(attributes)
    @text.delegate = this

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

  # Text delegate

  didEditText: (text) ->
    @delegate?.didEditBlock?(this)
