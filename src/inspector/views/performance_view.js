import View from "inspector/view"
const now = window.performance?.now ? () => performance.now() : () => new Date().getTime()

class PerformanceView extends View {
  static title = "Performance"
  static template = "performance"

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
    const parts = methodPath.split(".")
    const propertyNames = parts.slice(0, parts.length - 1)
    const methodName = parts[parts.length - 1]

    let object = this

    propertyNames.forEach((propertyName) => {
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

Trix.Inspector.registerView(PerformanceView)
