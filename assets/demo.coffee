Trix.attributes["code"] = { tagName: "code", inheritable: true }

delegate =
  attachmentAdded: (attachment) ->
    file = attachment.file
    console.log "Host delegate received attachment: %O in context: %O", attachment, this

    if /image/.test(file.type)
      setTimeout ->
        attributes = { url: "basecamp.png" }
        console.log "Host delegate setting attributes for attachment:", attachment, attributes
        attachment.setAttributes(attributes)
      , 1000
    else
      console.log "Host delegate rejected non-image:", file.name, file.type
      false

  attachmentRemoved: (attachment) ->
    console.log "Host delegate received removed attachment:", attachment


document.addEventListener "DOMContentLoaded", ->
  config =
    textarea: "text"
    toolbar: "toolbar"
    input: "data"
    debug: "debug"
    className: "formatted"
    delegate: delegate

  window.controller = Trix.install(config)
