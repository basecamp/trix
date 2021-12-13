// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import View from "inspector/view"

export default class RenderView extends View {
  static initClass() {
    this.prototype.title = "Renders"
    this.prototype.template = "render"
    this.prototype.events = {
      "trix-render": function() {
        this.renderCount++
        return this.render()
      },

      "trix-sync": function() {
        this.syncCount++
        return this.render()
      },
    }
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

RenderView.initClass()

Trix.Inspector.registerView(RenderView)
