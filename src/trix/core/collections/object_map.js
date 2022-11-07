import BasicObject from "trix/core/basic_object"

export default class ObjectMap extends BasicObject {
  constructor(objects = []) {
    super(...arguments)
    this.objects = {}

    Array.from(objects).forEach((object) => {
      const hash = JSON.stringify(object)
      if (this.objects[hash] == null) {
        this.objects[hash] = object
      }
    })
  }

  find(object) {
    const hash = JSON.stringify(object)
    return this.objects[hash]
  }
}
