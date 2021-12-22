if (!window.JST) {
  window.JST = {}
}

window.JST["trix/inspector/templates/render"] = function() {
  return `\
Syncs: ${this.syncCount}\
`
}
