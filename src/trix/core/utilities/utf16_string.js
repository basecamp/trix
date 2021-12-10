// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ucs2decode, ucs2encode
import BasicObject from "trix/core/basic_object"

export default class UTF16String extends BasicObject {
  static box(value = "") {
    if (value instanceof this) {
      return value
    } else {
      return this.fromUCS2String(value?.toString())
    }
  }

  static fromUCS2String(ucs2String) {
    return new this(ucs2String, ucs2decode(ucs2String))
  }

  static fromCodepoints(codepoints) {
    return new this(ucs2encode(codepoints), codepoints)
  }

  constructor(ucs2String, codepoints) {
    super(...arguments)
    this.ucs2String = ucs2String
    this.codepoints = codepoints
    this.length = this.codepoints.length
    this.ucs2Length = this.ucs2String.length
  }

  offsetToUCS2Offset(offset) {
    return ucs2encode(this.codepoints.slice(0, Math.max(0, offset))).length
  }

  offsetFromUCS2Offset(ucs2Offset) {
    return ucs2decode(this.ucs2String.slice(0, Math.max(0, ucs2Offset))).length
  }

  slice() {
    return this.constructor.fromCodepoints(this.codepoints.slice(...arguments))
  }

  charAt(offset) {
    return this.slice(offset, offset + 1)
  }

  isEqualTo(value) {
    return this.constructor.box(value).ucs2String === this.ucs2String
  }

  toJSON() {
    return this.ucs2String
  }

  getCacheKey() {
    return this.ucs2String
  }

  toString() {
    return this.ucs2String
  }
}

const hasArrayFrom = Array.from?.("\ud83d\udc7c").length === 1
const hasStringCodePointAt = " ".codePointAt?.(0) != null
const hasStringFromCodePoint = String.fromCodePoint?.(32, 128124) === " \ud83d\udc7c"

// UCS-2 conversion helpers ported from Mathias Bynens' Punycode.js:
// https://github.com/bestiejs/punycode.js#punycodeucs2

// Creates an array containing the numeric code points of each Unicode
// character in the string. While JavaScript uses UCS-2 internally,
// this function will convert a pair of surrogate halves (each of which
// UCS-2 exposes as separate characters) into a single code point,
// matching UTF-16.
if (hasArrayFrom && hasStringCodePointAt) {
  ucs2decode = string => Array.from(string).map(char => char.codePointAt(0))
} else {
  ucs2decode = function(string) {
    const output = []
    let counter = 0
    const {
      length
    } = string

    while (counter < length) {
      let value = string.charCodeAt(counter++)
      if (0xD800 <= value && value <= 0xDBFF && counter < length) {
        // high surrogate, and there is a next character
        const extra = string.charCodeAt(counter++)
        if ((extra & 0xFC00) === 0xDC00) {
          // low surrogate
          value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000
        } else {
          // unmatched surrogate; only append this code unit, in case the
          // next code unit is the high surrogate of a surrogate pair
          counter--
        }
      }
      output.push(value)
    }

    return output
  }
}

// Creates a string based on an array of numeric code points.
if (hasStringFromCodePoint) {
  ucs2encode = array => String.fromCodePoint(...Array.from(array || []))
} else {
  ucs2encode = function(array) {
    const characters = (() => {
      const result = []

      Array.from(array).forEach((value) => {
        let output = ""
        if (value > 0xFFFF) {
          value -= 0x10000
          output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800)
          value = 0xDC00 | value & 0x3FF
        }
        result.push(output + String.fromCharCode(value))
      })

      return result
    })()

    return characters.join("")
  }
}
