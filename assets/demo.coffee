Trix.attributes["code"] = { tagName: "code", inheritable: true }

document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"

  window.controller = Trix.install(config)
