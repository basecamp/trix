document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"

    className: "formatted"

    fileHandler:
      onAdd: (file, callback) ->
        console.log "onAdd:", file, this
        setTimeout ->
          console.log "File handler calling back"
          callback(url: "basecamp.png")
        , 1000

      onRemove: (fileAttributes) ->
        console.log "onRemove:", fileAttributes, this

  window.controller = Trix.install(config)
