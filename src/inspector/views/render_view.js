import View from "inspector/view"

export default class RenderView extends View {
  static title = "Renders"
  static template = "render"
  static events = {
    "trix-render": function() {
      this.renderCount++
      return this.render()
    },

    "trix-sync": function() {
      this.syncCount++
      return this.render()
    },
  }

  constructor() {
    super(...arguments)
    this.renderCount = 0
    this.syncCount = 0
  }

  getTitle() {
    return `${this.title} (${this.renderCount})`
  }
}

Trix.Inspector.registerView(RenderView)
