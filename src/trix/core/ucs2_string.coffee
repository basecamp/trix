class Trix.UCS2String
  @box: (value = "") ->
    if value instanceof this
      value
    else
      @fromUTF16String(value)

  @fromUTF16String: (utf16String) ->
    new this utf16String, ucs2decode(utf16String)

  @fromCodepoints: (codepoints) ->
    new this ucs2encode(codepoints), codepoints

  constructor: (@utf16String, @codepoints) ->
    @length = @codepoints.length
    @utf16Length = @utf16String.length

  offsetToUTF16Offset: (offset) ->
    ucs2encode(@codepoints.slice(0, offset)).length

  offsetFromUTF16Offset: (utf16Offset) ->
    ucs2decode(@utf16String.slice(0, utf16Offset)).length

  slice: ->
    @constructor.fromCodepoints(@codepoints.slice(arguments...))

  isEqualTo: (value) ->
    @constructor.box(value).utf16String is @utf16String

  toJSON: ->
    @utf16String

  toKey: ->
    @utf16String

  toString: ->
    @utf16String


# UCS-2 conversion helpers ported from Mathias Bynens' Punycode.js:
# https://github.com/bestiejs/punycode.js#punycodeucs2

# Creates an array containing the numeric code points of each Unicode
# character in the string. While JavaScript uses UCS-2 internally,
# this function will convert a pair of surrogate halves (each of which
# UCS-2 exposes as separate characters) into a single code point,
# matching UTF-16.
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
        # unmatched surrogate; only append this code unit, in case the next
        # code unit is the high surrogate of a surrogate pair
        counter--
    output.push(value)

  output

# Creates a string based on an array of numeric code points.
ucs2encode = (array) ->
  characters = for value in array
    output = ""
    if value > 0xFFFF
      value -= 0x10000
      output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800)
      value = 0xDC00 | value & 0x3FF
    output + String.fromCharCode(value)

  characters.join("")

