class Trix.Object
  id = 0

  @fromJSONString: (jsonString) ->
    @fromJSON JSON.parse(jsonString)

  constructor: ->
    @id = ++id

  isEqualTo: (object) ->
    this is object

  toJSONString: ->
    JSON.stringify this
