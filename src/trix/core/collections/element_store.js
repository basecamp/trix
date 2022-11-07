export default class ElementStore {
  constructor(elements) {
    this.reset(elements)
  }

  add(element) {
    const key = getKey(element)
    this.elements[key] = element
  }

  remove(element) {
    const key = getKey(element)
    const value = this.elements[key]
    if (value) {
      delete this.elements[key]
      return value
    }
  }

  reset(elements = []) {
    this.elements = {}
    Array.from(elements).forEach((element) => {
      this.add(element)
    })
    return elements
  }
}

const getKey = (element) => element.dataset.trixStoreKey
