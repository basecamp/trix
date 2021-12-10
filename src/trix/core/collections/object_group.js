/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class ObjectGroup {
  static groupObjects(ungroupedObjects = [], {depth, asTree} = {}) {
    let group;
    if (asTree) { if (depth == null) { depth = 0; } }
    const objects = [];
    for (let object of Array.from(ungroupedObjects)) {
      if (group) {
        if (object.canBeGrouped?.(depth) && group[group.length - 1].canBeGroupedWith?.(object, depth)) {
          group.push(object);
          continue;
        } else {
          objects.push(new (this)(group, {depth, asTree}));
          group = null;
        }
      }

      if (object.canBeGrouped?.(depth)) {
        group = [object];
      } else {
        objects.push(object);
      }
    }

    if (group) {
      objects.push(new (this)(group, {depth, asTree}));
    }
    return objects;
  }

  constructor(objects = [], {depth, asTree}) {
    this.objects = objects;
    if (asTree) {
      this.depth = depth;
      this.objects = this.constructor.groupObjects(this.objects, {asTree, depth: this.depth + 1});
    }
  }

  getObjects() {
    return this.objects;
  }

  getDepth() {
    return this.depth;
  }

  getCacheKey() {
    const keys = ["objectGroup"];
    for (let object of Array.from(this.getObjects())) { keys.push(object.getCacheKey()); }
    return keys.join("/");
  }
}
