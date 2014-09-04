#= require ./inspector/inspector_controller

config =
  textarea: "text"
  toolbar: "toolbar"
  input: "data"
  className: "formatted"
  delegate:
    shouldAcceptFile: (file) ->
      true

    didAddAttachment: (attachment) ->
      console.log "Host received attachment:", attachment
      if file = attachment.file
        uploadAttachment(attachment)
      else
        saveAttachment(attachment)

    didRemoveAttachment: (attachment) ->
      console.log "Host received removed attachment:", attachment
      removeAttachment(attachment)

    didChangeSelection: ->
      inspectorController.render()

    didRenderDocument: ->
      inspectorController.render()
      inspectorController.incrementRenderCount()

saveAttachment = (attachment) ->
  attributes = attachment.getAttributes()

  item = document.createElement("li")
  item.setAttribute("id", "attachment_#{attachment.id}")
  item.textContent = "#{attributes.filename ? attributes.url} "

  link = document.createElement("a")
  link.setAttribute("href", "#")
  link.textContent = "(remove)"
  link.addEventListener "click",  (event) ->
    event.preventDefault()
    attachment.remove()
    removeAttachment(attachment)

  item.appendChild(link)
  document.getElementById("attachments").appendChild(item)

removeAttachment = (attachment) ->
  if item = document.getElementById("attachment_#{attachment.id}")
    item.parentElement.removeChild(item)

uploadAttachment = (attachment) ->
  {file} = attachment
  e = (string) -> encodeURIComponent(string)
  url = "/attachments?contentType=#{e(file.type)}&filename=#{e(file.name)}"

  xhr = new XMLHttpRequest
  xhr.open("POST", url, true)
  xhr.setRequestHeader("Content-Type", "application/octet-stream")
  xhr.onreadystatechange = (response) =>
    if xhr.readyState is 4
      if xhr.status is 200
        progress = 0
        fakeProgress = =>
          attachment.setUploadProgress(progress++)
          if progress is 100
            attributes = JSON.parse(xhr.responseText)
            #unless attachment.isImage()
            #  attributes.href = attributes.url
            #  delete attributes.url
            attachment.setAttributes(attributes)
          else
            setTimeout(fakeProgress, 20)
        fakeProgress()
      else
        console.warn "Host failed to upload file:", file
  xhr.send(file)

installTrix = ->
  if Trix.isSupported(config)
    window.controller = Trix.install(config)

    toolbarElement = document.getElementById("toolbar")
    toolbarElement.style.display = "block"

    inspectorElement = document.getElementById("inspector")
    inspectorElement.style.visibility = "visible"

    window.inspectorController = new Trix.InspectorController inspectorElement, window.controller

  else
    config.mode = "degraded"
    if Trix.isSupported(config)
      window.controller = Trix.install(config)

document.addEventListener "DOMContentLoaded", installTrix
