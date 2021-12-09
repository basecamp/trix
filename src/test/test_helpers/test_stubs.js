import { normalizeRange, rangeIsCollapsed } from "trix/core/helpers"

export class TestCompositionDelegate {
  compositionDidRequestChangingSelectionToLocationRange() {
    return this.getSelectionManager().setLocationRange(...arguments)
  }

  getSelectionManager() {
    if (!this.selectionManager) this.selectionManager = new TestSelectionManager()
    return this.selectionManager
  }
}

export class TestSelectionManager {
  constructor() {
    this.setLocationRange({ index: 0, offset: 0 })
  }

  getLocationRange() {
    return this.locationRange
  }

  setLocationRange(locationRange) {
    this.locationRange = normalizeRange(locationRange)
  }

  preserveSelection(block) {
    const locationRange = this.getLocationRange()
    block()
    this.locationRange = locationRange
  }

  setLocationRangeFromPoint(point) {}

  locationIsCursorTarget() {
    return false
  }

  selectionIsExpanded() {
    return !rangeIsCollapsed(this.getLocationRange())
  }
}
