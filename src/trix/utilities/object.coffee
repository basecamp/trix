class Trix.Object
  id = 0

  @fromJSONString: (jsonString) ->
    @fromJSON JSON.parse(jsonString)

  constructor: ->
    @id = ++id

  isEqualTo: (object) ->
    this is object

  inspect: ->
    contents = for key, value of @contentsForInspection() ? {}
      "#{key}=#{value}"

    "#<#{@constructor.name}:#{@id}#{if contents.length then " #{contents.join(", ")}" else ""}>"

  contentsForInspection: ->

  toJSONString: ->
    JSON.stringify this
