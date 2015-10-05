---
---

document.addEventListener "trix-attachment-add", (event) ->
  {attachment} = event
  if attachment.file
    uploadAttachment(attachment)

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
