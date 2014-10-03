class Trix.Object
  id = 0

  @fromJSONString: (jsonString) ->
    @fromJSON JSON.parse(jsonString)

  constructor: ->
    @id = ++id

  hasSameConstructorAs: (object) ->
    @constructor is object?.constructor

  isEqualTo: (object) ->
    this is object

  inspect: ->
    contents = for key, value of @contentsForInspection() ? {}
      "#{key}=#{value}"

    "#<#{@constructor.name}:#{@id}#{if contents.length then " #{contents.join(", ")}" else ""}>"

  contentsForInspection: ->

  toKey: ->
    @id.toString()

  toJSONString: ->
    JSON.stringify this
