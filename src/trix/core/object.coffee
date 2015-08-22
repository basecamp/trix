#= require trix/core/basic_object

class Trix.Object extends Trix.BasicObject
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

  toJSONString: ->
    JSON.stringify(this)

  toUTF16String: ->
    Trix.UTF16String.box(this)

  getCacheKey: ->
    @id.toString()
