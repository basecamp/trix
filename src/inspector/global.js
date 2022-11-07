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
