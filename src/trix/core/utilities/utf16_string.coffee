class Trix.UTF16String extends Trix.BasicObject
  @box: (value = "") ->
    if value instanceof this
      value
    else
      @fromUCS2String(value?.toString())

  @fromUCS2String: (ucs2String) ->
    new this ucs2String, ucs2decode(ucs2String)

  @fromCodepoints: (codepoints) ->
    new this ucs2encode(codepoints), codepoints

  constructor: (@ucs2String, @codepoints) ->
    @length = @codepoints.length
    @ucs2Length = @ucs2String.length

  offsetToUCS2Offset: (offset) ->
    ucs2encode(@codepoints.slice(0, Math.max(0, offset))).length

  offsetFromUCS2Offset: (ucs2Offset) ->
    ucs2decode(@ucs2String.slice(0, Math.max(0, ucs2Offset))).length

  slice: ->
    @constructor.fromCodepoints(@codepoints.slice(arguments...))

  charAt: (offset) ->
    @slice(offset, offset + 1)

  isEqualTo: (value) ->
    @constructor.box(value).ucs2String is @ucs2String

  toJSON: ->
    @ucs2String

  getCacheKey: ->
    @ucs2String

  toString: ->
    @ucs2String

hasArrayFrom = Array.from?("\ud83d\udc7c").length is 1
hasStringCodePointAt = " ".codePointAt?(0)?
hasStringFromCodePoint = String.fromCodePoint?(32, 128124) is " \ud83d\udc7c"

# UCS-2 conversion helpers ported from Mathias Bynens' Punycode.js:
# https://github.com/bestiejs/punycode.js#punycodeucs2

# Creates an array containing the numeric code points of each Unicode
# character in the string. While JavaScript uses UCS-2 internally,
# this function will convert a pair of surrogate halves (each of which
# UCS-2 exposes as separate characters) into a single code point,
# matching UTF-16.
if hasArrayFrom and hasStringCodePointAt
  ucs2decode = (string) ->
    Array.from(string).map (char) -> char.codePointAt(0)
else
  ucs2decode = (string) ->
    output = []
    counter = 0
    length = string.length

    while counter < length
      value = string.charCodeAt(counter++)
      if 0xD800 <= value <= 0xDBFF && counter < length
        # high surrogate, and there is a next character
        extra = string.charCodeAt(counter++)
        if (extra & 0xFC00) is 0xDC00
          # low surrogate
          value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000
        else
          # unmatched surrogate; only append this code unit, in case the
          # next code unit is the high surrogate of a surrogate pair
          counter--
      output.push(value)

    output

# Creates a string based on an array of numeric code points.
if hasStringFromCodePoint
  ucs2encode = (array) ->
    String.fromCodePoint(array...)
else
  ucs2encode = (array) ->
    characters = for value in array
      output = ""
      if value > 0xFFFF
        value -= 0x10000
        output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800)
        value = 0xDC00 | value & 0x3FF
      output + String.fromCharCode(value)

    characters.join("")
