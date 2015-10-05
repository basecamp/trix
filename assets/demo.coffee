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

host = "https://d13txem1unpe48.cloudfront.net/"

uploadAttachment = (attachment) ->
  {file} = attachment
  key = createStorageKey(file)

  form = new FormData
  form.append("key", key)
  form.append("Content-Type", file.type)
  form.append("file", file)

  xhr = new XMLHttpRequest
  xhr.open("POST", host, true)

  xhr.upload.onprogress = (event) ->
    progress = event.loaded / event.total * 100
    attachment.setUploadProgress(progress)

  xhr.onload = ->
    if xhr.status is 204
      url = href = host + key
      attachment.setAttributes({url, href})

  xhr.send(form)

createStorageKey = (file) ->
  date = new Date()
  day = date.toISOString().slice(0,10)
  time = date.getTime()
  "tmp/#{day}/#{time}-#{file.name}"
