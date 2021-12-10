import BasicObject from "trix/core/basic_object"
import UTF16String from "trix/core/utilities/utf16_string"

let id = 0

export default class TrixObject extends BasicObject {
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
    const parts = []
    const contents = this.contentsForInspection() || {}

    for (const key in contents) {
      const value = contents[key]
      parts.push(`${key}=${value}`)
    }

    return `#<${this.constructor.name}:${this.id}${parts.length ? ` ${parts.join(", ")}` : ""}>`
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
