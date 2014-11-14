class Trix.String
  @box: (value = "") ->
    if value instanceof this
      value
    else
      new this ucs2decode(value)

  constructor: (@codepoints) ->
    @length = @codepoints.length
    @value = ucs2encode(@codepoints)
    @jsLength = @value.length

  translateOffset: (offset) ->
    ucs2encode(@codepoints.slice(0, offset)).length

  translateJSOffset: (jsOffset) ->
    ucs2decode(@value.slice(0, jsOffset)).length

  slice: ->
    new @constructor @codepoints.slice(arguments...)

  isEqualTo: (string) ->
    @constructor.box(string).value is @value

  toJSON: ->
    @value

  toKey: ->
    @value

  toString: ->
    @value


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

