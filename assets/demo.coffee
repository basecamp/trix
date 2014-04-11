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
      , 3000
    fileRemoved: (attributes) ->
      console.log "File was removed:", attributes

  window.controller = Trix.install(config)
