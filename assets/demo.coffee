document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    attachmentHandler: (file, callback) ->
      setTimeout ->
        callback(src: "basecamp.png")
      , 500

  window.controller = Trix.install(config)
