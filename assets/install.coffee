document.addEventListener "DOMContentLoaded", ->
  config =
    text: "text"
    toolbar: "toolbar"
    debug: "debug"

  window.controller = Trix.install(config)
