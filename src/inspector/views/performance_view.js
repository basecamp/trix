/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import View from "inspector/view"
const now = window.performance?.now != null ? () => performance.now() : () => new Date().getTime()

class PerformanceView extends View {
  static initClass() {
    this.prototype.title = "Performance"
    this.prototype.template = "performance"
  }

  constructor() {
    super(...arguments)
    this.documentView = this.compositionController.documentView

    this.data = {}
    this.track("documentView.render")
    this.track("documentView.sync")
    this.track("documentView.garbageCollectCachedViews")
    this.track("composition.replaceHTML")

    this.render()
  }

  track(methodPath) {
    this.data[methodPath] = { calls: 0, total: 0, mean: 0, max: 0, last: 0 }

    const array = methodPath.split("."),
      adjustedLength = Math.max(array.length, 1),
      propertyNames = array.slice(0, adjustedLength - 1),
      methodName = array[adjustedLength - 1]
    let object = this

    Array.from(propertyNames).forEach((propertyName) => {
      object = object[propertyName]
    })

    const original = object[methodName]

    object[methodName] = function() {
      const started = now()
      const result = original.apply(object, arguments)
      const timing = now() - started
      this.record(methodPath, timing)
      return result
    }.bind(this)
  }

  record(methodPath, timing) {
    const data = this.data[methodPath]
    data.calls += 1
    data.total += timing
    data.mean = data.total / data.calls
    if (timing > data.max) {
      data.max = timing
    }
    data.last = timing
    return this.render()
  }

  round(ms) {
    return Math.round(ms * 1000) / 1000
  }
}

PerformanceView.initClass()

Trix.Inspector.registerView(PerformanceView)
