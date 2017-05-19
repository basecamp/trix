class Trix.DataUri extends Trix.Object
  @parse: (uri) ->
    string = decodeURI(uri.toString())
    if matches = string.match(/^data:(((?!base64)[^;,]+)?(;charset=([^;,]+))?)?;?(base64)?,(.*)/)
      [_, _, contentType, _, charset, encoding, data] = matches
      base64Data = if encoding is "base64" then data else btoa(data)
      new this contentType, base64Data, charset

  constructor: (@contentType, @base64Data, @charset) ->
    @mediaType = @contentType ? ""
    @mediaType += ";charset=#{@charset}" if @charset?
    super

  isEqualTo: (uri) ->
    super or (
      @hasSameConstructorAs(uri) and
      @getContentType() is uri.getContentType() and
      @getCharset() is uri.getCharset() and
      @getData() is uri.getData()
    )

  getContentType: ->
    @contentType ? "text/plain"

  getCharset: ->
    @charset ? "US-ASCII"

  getData: ->
    atob(@base64Data)

  toString: ->
    "data:#{[@mediaType + ";" if @mediaType.length]}base64,#{@base64Data}"
