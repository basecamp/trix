export default class ObjectGroup {
  static groupObjects(ungroupedObjects = [], { depth, asTree } = {}) {
    let group
    if (asTree) {
      if (depth == null) {
        depth = 0
      }
    }
    const objects = []

    Array.from(ungroupedObjects).forEach((object) => {
      if (group) {
        if (object.canBeGrouped?.(depth) && group[group.length - 1].canBeGroupedWith?.(object, depth)) {
          group.push(object)
          return
        } else {
          objects.push(new this(group, { depth, asTree }))
          group = null
        }
      }

      if (object.canBeGrouped?.(depth)) {
        group = [ object ]
      } else {
        objects.push(object)
      }
    })

    if (group) {
      objects.push(new this(group, { depth, asTree }))
    }
    return objects
  }

  constructor(objects = [], { depth, asTree }) {
    this.objects = objects
    if (asTree) {
      this.depth = depth
      this.objects = this.constructor.groupObjects(this.objects, { asTree, depth: this.depth + 1 })
    }
  }

  getObjects() {
    return this.objects
  }

  getDepth() {
    return this.depth
  }

  getCacheKey() {
    const keys = [ "objectGroup" ]
    Array.from(this.getObjects()).forEach((object) => {
      keys.push(object.getCacheKey())
    })
    return keys.join("/")
  }
}
