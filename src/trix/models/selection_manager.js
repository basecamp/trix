/* eslint-disable
*/
import BasicObject from "trix/core/basic_object"

import LocationMapper from "trix/models/location_mapper"
import PointMapper from "trix/models/point_mapper"

import {
  elementContainsNode,
  getDOMRange,
  getDOMSelection,
  handleEvent,
  innerElementIsActive,
  nodeIsCursorTarget,
  normalizeRange,
  rangeIsCollapsed,
  rangesAreEqual,
  setDOMRange,
} from "trix/core/helpers"

export default class SelectionManager extends BasicObject {
  constructor(element) {
    super(...arguments)
    this.didMouseDown = this.didMouseDown.bind(this)
    this.selectionDidChange = this.selectionDidChange.bind(this)
    this.element = element
    this.locationMapper = new LocationMapper(this.element)
    this.pointMapper = new PointMapper()
    this.lockCount = 0
    handleEvent("mousedown", { onElement: this.element, withCallback: this.didMouseDown })
  }
  getLocationRange(options = {}) {
    if (options.strict === false) {
      return this.createLocationRangeFromDOMRange(getDOMRange())
    } else if (options.ignoreLock) {
      return this.currentLocationRange
    } else if (this.lockedLocationRange) {
      return this.lockedLocationRange
    } else {
      return this.currentLocationRange
    }
  }

  setLocationRange(locationRange) {
    if (this.lockedLocationRange) return
    locationRange = normalizeRange(locationRange)

    const domRange = this.createDOMRangeFromLocationRange(locationRange)
    if (domRange) {
      setDOMRange(domRange)
      this.updateCurrentLocationRange(locationRange)
    }
  }

  setLocationRangeFromPointRange(pointRange) {
    pointRange = normalizeRange(pointRange)
    const startLocation = this.getLocationAtPoint(pointRange[0])
    const endLocation = this.getLocationAtPoint(pointRange[1])
    this.setLocationRange([ startLocation, endLocation ])
  }

  getClientRectAtLocationRange(locationRange) {
    const domRange = this.createDOMRangeFromLocationRange(locationRange)
    if (domRange) {
      return this.getClientRectsForDOMRange(domRange)[1]
    }
  }

  locationIsCursorTarget(location) {
    const node = Array.from(this.findNodeAndOffsetFromLocation(location))[0]
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
      const { lockedLocationRange } = this
      this.lockedLocationRange = null
      if (lockedLocationRange != null) {
        return this.setLocationRange(lockedLocationRange)
      }
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
    if (domRange == null || !this.domRangeWithinElement(domRange)) return

    const start = this.findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset, options)
    if (!start) return

    const end = domRange.collapsed
      ? undefined
      : this.findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset, options)

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

    const resumeTimeout = setTimeout(resume, 200)

    resumeHandlers = [ "mousemove", "keydown" ].map((eventName) =>
      handleEvent(eventName, { onElement: document, withCallback: resume })
    )
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
    const rangeEnd = rangeIsCollapsed(locationRange)
      ? rangeStart
      : this.findContainerAndOffsetFromLocation(locationRange[1]) || rangeStart

    if (rangeStart != null && rangeEnd != null) {
      const domRange = document.createRange()
      domRange.setStart(...Array.from(rangeStart || []))
      domRange.setEnd(...Array.from(rangeEnd || []))
      return domRange
    }
  }

  getLocationAtPoint(point) {
    const domRange = this.createDOMRangeFromPoint(point)
    if (domRange) {
      return this.createLocationRangeFromDOMRange(domRange)?.[0]
    }
  }

  domRangeWithinElement(domRange) {
    if (domRange.collapsed) {
      return elementContainsNode(this.element, domRange.startContainer)
    } else {
      return (
        elementContainsNode(this.element, domRange.startContainer) &&
        elementContainsNode(this.element, domRange.endContainer)
      )
    }
  }
}

SelectionManager.proxyMethod("locationMapper.findLocationFromContainerAndOffset")
SelectionManager.proxyMethod("locationMapper.findContainerAndOffsetFromLocation")
SelectionManager.proxyMethod("locationMapper.findNodeAndOffsetFromLocation")
SelectionManager.proxyMethod("pointMapper.createDOMRangeFromPoint")
SelectionManager.proxyMethod("pointMapper.getClientRectsForDOMRange")

