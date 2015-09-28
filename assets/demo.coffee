#= require_self
#= require trix/core/helpers/global
#= require trix/core/utilities/debugger
#= require trix/watchdog
#= require trix/inspector

{handleEvent, defer} = Trix

document.addEventListener "trix-initialize", ->
  editorElement = document.querySelector("trix-editor")
  editorElement = editorElement

  editorElement.recorder = new Trix.Watchdog.Recorder editorElement
  editorElement.recorder.start()

  new Trix.Inspector.install(editorElement)

  handleEvent "trix-attachment-add", onElement: editorElement, withCallback: (event) ->
    {attachment} = event
    console.log "HOST: attachment added", attachment
    if attachment.file
      uploadAttachment(attachment)

  handleEvent "trix-attachment-remove", onElement: editorElement, withCallback: (event) ->
    {attachment} = event
    console.log "HOST: attachment removed", attachment

  form = document.querySelector("form#submit-trix-content")
  handleEvent "submit", onElement: form, withCallback: (event) ->
    event.preventDefault()
    data = new FormData form
    xhr = new XMLHttpRequest
    xhr.open("POST", "/submit", true)
    xhr.onload = ->
      if xhr.status is 200
        console.log "Form data submit:", JSON.parse(xhr.responseText)
    xhr.send(data)

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
