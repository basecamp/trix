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
        saveAttachment(attachment)

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
        removeAttachment(attachment)

  window.controller = Trix.install(config)

  undoButton = document.getElementById('undo')
  redoButton = document.getElementById('redo')

  undoButton.onclick = ->
    window.controller.composition.undo()

  redoButton.onclick = ->
    window.controller.composition.redo()


saveAttachment = (attachment) ->
  item = document.createElement("li")
  item.setAttribute("id", "attachment_#{attachment.id}")
  item.textContent = "#{attachment.attributes.filename ? attachment.attributes.url} "

  link = document.createElement("a")
  link.setAttribute("href", "#")
  link.textContent = "(remove)"
  link.addEventListener "click", ->
    attachment.remove()
    removeAttachment(attachment)

  item.appendChild(link)
  document.getElementById("attachments").appendChild(item)

removeAttachment = (attachment) ->
  if item = document.getElementById("attachment_#{attachment.id}")
    item.parentElement.removeChild(item)
