// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.Trix.Inspector = {
  views: [],

  registerView(constructor) {
    return this.views.push(constructor)
  },

  install(editorElement) {
    this.editorElement = editorElement
    const element = document.createElement("trix-inspector")
    element.dataset.trixId = this.editorElement.trixId
    return document.body.appendChild(element)
  },
}
