// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { normalizeRange, rangeIsCollapsed } from "trix/core/helpers"

export class TestCompositionDelegate {
  compositionDidRequestChangingSelectionToLocationRange() {
    return this.getSelectionManager().setLocationRange(...arguments)
  }

  getSelectionManager() {
    return this.selectionManager != null ? this.selectionManager : this.selectionManager = new TestSelectionManager
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
