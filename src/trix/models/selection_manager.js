/* eslint-disable
    no-cond-assign,
    no-this-before-super,
    no-unused-vars,
    no-var,
    prefer-const,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SelectionManager
import BasicObject from "trix/core/basic_object"

import LocationMapper from "trix/models/location_mapper"
import PointMapper from "trix/models/point_mapper"
import SelectionChangeObserver, { selectionChangeObserver } from "trix/observers/selection_change_observer"

import { elementContainsNode, getDOMRange, getDOMSelection, handleEvent,
 innerElementIsActive, nodeIsCursorTarget, normalizeRange, rangeIsCollapsed,
 rangesAreEqual, setDOMRange } from "trix/core/helpers"

export default SelectionManager = (function() {
  SelectionManager = class SelectionManager extends BasicObject {
    static initClass() {

      // Private

      this.proxyMethod("locationMapper.findLocationFromContainerAndOffset")
      this.proxyMethod("locationMapper.findContainerAndOffsetFromLocation")
      this.proxyMethod("locationMapper.findNodeAndOffsetFromLocation")
      this.proxyMethod("pointMapper.createDOMRangeFromPoint")
      this.proxyMethod("pointMapper.getClientRectsForDOMRange")
    }
    constructor(element) {
      super(...arguments)
      this.didMouseDown = this.didMouseDown.bind(this)
      this.selectionDidChange = this.selectionDidChange.bind(this)
      this.element = element
      this.locationMapper = new LocationMapper(this.element)
      this.pointMapper = new PointMapper
      this.lockCount = 0
      handleEvent("mousedown", { onElement: this.element, withCallback: this.didMouseDown })
    }

    getLocationRange(options = {}) {
      let locationRange

      locationRange =
        options.strict === false ?
          this.createLocationRangeFromDOMRange(getDOMRange(), { strict: false })
        : options.ignoreLock ?
          this.currentLocationRange
        :
          this.lockedLocationRange != null ? this.lockedLocationRange : this.currentLocationRange
    }

    setLocationRange(locationRange) {
      let domRange
      if (this.lockedLocationRange) { return }
      locationRange = normalizeRange(locationRange)
      if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
        setDOMRange(domRange)
        return this.updateCurrentLocationRange(locationRange)
      }
    }

    setLocationRangeFromPointRange(pointRange) {
      pointRange = normalizeRange(pointRange)
      const startLocation = this.getLocationAtPoint(pointRange[0])
      const endLocation = this.getLocationAtPoint(pointRange[1])
      return this.setLocationRange([ startLocation, endLocation ])
    }

    getClientRectAtLocationRange(locationRange) {
      let domRange
      if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
        return this.getClientRectsForDOMRange(domRange)[1]
      }
    }

    locationIsCursorTarget(location) {
      const [ node, offset ] = Array.from(this.findNodeAndOffsetFromLocation(location))
      return nodeIsCursorTarget(node)
    }

    lock() {
      if (this.lockCount++ === 0) {
        this.updateCurrentLocationRange()
        this.lockedLocationRange = this.getLocationRange()
      }
    }

    unlock() {
      if (--this.lockCount === 0) {
        const {
          lockedLocationRange
        } = this
        this.lockedLocationRange = null
        if (lockedLocationRange != null) { return this.setLocationRange(lockedLocationRange) }
      }
    }

    clearSelection() {
      return getDOMSelection()?.removeAllRanges()
    }

    selectionIsCollapsed() {
      return getDOMRange()?.collapsed === true
    }

    selectionIsExpanded() {
      return !this.selectionIsCollapsed()
    }

    createLocationRangeFromDOMRange(domRange, options) {
      let end, start
      if (domRange == null || !this.domRangeWithinElement(domRange)) { return }
      if (!(start = this.findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset, options))) { return }
      if (!domRange.collapsed) { end = this.findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset, options) }
      return normalizeRange([ start, end ])
    }

    didMouseDown() {
      return this.pauseTemporarily()
    }

    pauseTemporarily() {
      let resumeHandlers
      this.paused = true

      const resume = () => {
        this.paused = false
        clearTimeout(resumeTimeout)

        Array.from(resumeHandlers).forEach((handler) => {
          handler.destroy()
        })

        if (elementContainsNode(document, this.element)) {
          return this.selectionDidChange()
        }
      }

      var resumeTimeout = setTimeout(resume, 200)

      resumeHandlers = [ "mousemove", "keydown" ].map((eventName) =>
        handleEvent(eventName, { onElement: document, withCallback: resume }))
    }

    selectionDidChange() {
      if (!this.paused && !innerElementIsActive(this.element)) {
        return this.updateCurrentLocationRange()
      }
    }

    updateCurrentLocationRange(locationRange) {
      if (locationRange != null ? locationRange : locationRange = this.createLocationRangeFromDOMRange(getDOMRange())) {
        if (!rangesAreEqual(locationRange, this.currentLocationRange)) {
          this.currentLocationRange = locationRange
          return this.delegate?.locationRangeDidChange?.(this.currentLocationRange.slice(0))
        }
      }
    }

    createDOMRangeFromLocationRange(locationRange) {
      const rangeStart = this.findContainerAndOffsetFromLocation(locationRange[0])
      const rangeEnd = rangeIsCollapsed(locationRange) ?
        rangeStart
      :
        this.findContainerAndOffsetFromLocation(locationRange[1]) || rangeStart

      if (rangeStart != null && rangeEnd != null) {
        const domRange = document.createRange()
        domRange.setStart(...Array.from(rangeStart || []))
        domRange.setEnd(...Array.from(rangeEnd || []))
        return domRange
      }
    }

    getLocationAtPoint(point) {
      let domRange
      if (domRange = this.createDOMRangeFromPoint(point)) {
        return this.createLocationRangeFromDOMRange(domRange)?.[0]
      }
    }

    domRangeWithinElement(domRange) {
      if (domRange.collapsed) {
        return elementContainsNode(this.element, domRange.startContainer)
      } else {
        return elementContainsNode(this.element, domRange.startContainer) && elementContainsNode(this.element, domRange.endContainer)
      }
    }
  }
  SelectionManager.initClass()
  return SelectionManager
})()
