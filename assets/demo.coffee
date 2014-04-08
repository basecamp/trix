document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    fileHandler: (file, callback) ->
      setTimeout ->
        console.log "File handler calling back"
        callback(url: "basecamp.png")
      , 5000

  window.controller = Trix.install(config)
