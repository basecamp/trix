Trix.attributes["code"] = { tagName: "code", inheritable: true }

document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    delegate:
      shouldAcceptFile: (file) ->
        true

      didAddAttachment: (attachment) ->
        console.log "Host received attachment:", attachment

        if file = attachment.file
          setTimeout ->
            if /image/.test(file.type)
             attributes = { url: "basecamp.png" }
            else
              filename = "basecamp-#{file.name}.rb"
              attributes = { url: filename, filename }

            console.log "Host setting attributes for attachment:", attachment, attributes
            attachment.update(attributes)
          , 1000

      didRemoveAttachment: (attachment) ->
        console.log "Host received removed attachment:", attachment

  window.controller = Trix.install(config)
