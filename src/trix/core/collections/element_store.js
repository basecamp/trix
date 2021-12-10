/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class ElementStore {
  constructor(elements) {
    this.reset(elements);
  }

  add(element) {
    const key = getKey(element);
    return this.elements[key] = element;
  }

  remove(element) {
    let value;
    const key = getKey(element);
    if (value = this.elements[key]) {
      delete this.elements[key];
      return value;
    }
  }

  reset(elements = []) {
    this.elements = {};
    for (let element of Array.from(elements)) { this.add(element); }
    return elements;
  }
}

var getKey = element => element.dataset.trixStoreKey;
