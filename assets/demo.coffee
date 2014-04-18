Trix.attributes["code"] = { tagName: "code", inheritable: true }

document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    delegate:
      addAttachment: (attachment) ->
        console.log "Host delegate received attachment:", attachment

        if file = attachment.file
          if /image/.test(file.type)
            setTimeout ->
              attributes = { url: "basecamp.png" }
              console.log "Host delegate setting attributes for attachment:", attachment, attributes
              attachment.setAttributes(attributes)

              #setTimeout ->
              #  console.log "Host delegate removing attachment:", attachment
              #  attachment.remove()
              #, 1000
            , 1000
          else
            console.log "Host delegate rejected non-image:", file.name, file.type
            false

      removeAttachment: (attachment) ->
        console.log "Host delegate received removed attachment:", attachment

  window.controller = Trix.install(config)
