// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TrixObject
import BasicObject from "trix/core/basic_object"
import UTF16String from "trix/core/utilities/utf16_string"

export default TrixObject = (function() {
  let id = undefined
  TrixObject = class TrixObject extends BasicObject {
    static initClass() {
      id = 0
    }

    static fromJSONString(jsonString) {
      return this.fromJSON(JSON.parse(jsonString))
    }

    constructor() {
      super(...arguments)
      this.id = ++id
    }

    hasSameConstructorAs(object) {
      return this.constructor === object?.constructor
    }

    isEqualTo(object) {
      return this === object
    }

    inspect() {
      const contents = (() => {
        const result = []
        const object = this.contentsForInspection() || {}
        for (const key in object) {
          const value = object[key]
          result.push(`${key}=${value}`)
        }
        return result
      })()

      return `#<${this.constructor.name}:${this.id}${contents.length ? ` ${contents.join(", ")}` : ""}>`
    }

    contentsForInspection() {}

    toJSONString() {
      return JSON.stringify(this)
    }

    toUTF16String() {
      return UTF16String.box(this)
    }

    getCacheKey() {
      return this.id.toString()
    }
  }
  TrixObject.initClass()
  return TrixObject
})()
