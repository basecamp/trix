document.addEventListener "DOMContentLoaded", ->
  config =
    text: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"

  window.controller = Trix.install(config)
