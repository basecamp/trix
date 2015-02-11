#= require_self
#= require trix/core/helpers/global
#= require ./documents
#= require ./inspector/inspector_controller

{handleEvent, defer} = Trix

addEventListener "DOMContentLoaded", ->
  defer ->
    editorElement = document.querySelector("trix-editor")
    inspectorElement = document.querySelector("#inspector")
    inspectorController = new Trix.InspectorController inspectorElement, editorElement.editorController
    inspectorElement.style.visibility = "visible"

    handleEvent "selectionchange", onElement: editorElement, withCallback: ->
      inspectorController.render()

    handleEvent "trix-render", onElement: editorElement, withCallback: ->
      inspectorController.render()
      inspectorController.incrementRenderCount()

    handleEvent "trix-attachment-add", onElement: editorElement, withCallback: (event) ->
      {attachment} = event
      console.log "HOST: attachment added", attachment
      if {file} = attachment
        uploadAttachment(attachment)
      else
        saveAttachment(attachment)

    handleEvent "trix-attachment-remove", onElement: editorElement, withCallback: (event) ->
      {attachment} = event
      console.log "HOST: attachment removed", attachment
      removeAttachment(attachment)

saveAttachment = (attachment) ->
  item = document.createElement("li")
  item.setAttribute("id", "attachment_#{attachment.id}")
  item.textContent = "#{attachment.getFilename() ? attachment.getURL()} "

  link = document.createElement("a")
  link.setAttribute("href", "#")
  link.textContent = "(remove)"
  link.addEventListener "click",  (event) ->
    event.preventDefault()
    attachment.remove()

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
          attachment.setUploadProgress(progress)
          if progress is 100
            attributes = JSON.parse(xhr.responseText)
            attributes.href = attributes.url
            attachment.setAttributes(attributes)
          else
            progress += 5
            setTimeout(fakeProgress, 30)
        fakeProgress()
      else
        console.warn "Host failed to upload file:", file
  xhr.send(file)
