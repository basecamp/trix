document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    fileHandler: (file, callback) ->
      setTimeout ->
        reader = new FileReader
        reader.onload = (event) =>
          callback(url: event.target.result)
        reader.readAsDataURL(file)
      , 1000

  window.controller = Trix.install(config)
