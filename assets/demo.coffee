document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    attachmentHandler: (attachment, callback) ->
      setTimeout ->
        callback({ id: attachment.id, src: "basecamp.png" })
      , 500

  window.controller = Trix.install(config)
