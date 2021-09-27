import Trix from "trix/global"
import BasicObject from "trix/core/basic_object"
import UTF16String from "trix/core/utilities/utf16_string"

export default class TrixObject extends BasicObject
  id = 0

  @fromJSONString: (jsonString) ->
    @fromJSON JSON.parse(jsonString)

  constructor: ->
    super(arguments...)
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
    UTF16String.box(this)

  getCacheKey: ->
    @id.toString()
