#= require rich_text/text

class RichText.Controller
  constructor: (@element) ->
    @element.setAttribute("contenteditable", "true")
    @element.addEventListener("keydown", @onKeyDown, true)
    @element.addEventListener("keypress", @onKeyPress, true)
    @element.addEventListener("drop", @onDrop, true)
    @element.addEventListener("cut", @onCut, true)
    @element.addEventListener("copy", @onCopy, true)
    @element.addEventListener("paste", @onPaste, true)
    @element.addEventListener("input", @onInput, true)

  onKeyDown: (event) =>
    console.log "key down: key code = ", event.keyCode

  onKeyPress: (event) =>
    if event.which is null
      character = String.fromCharCode event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      character = String.fromCharCode event.charCode

    console.log "key press: character = ", character
    event.preventDefault()

  onDrop: (event) =>
    console.log "drop: event =", event, "content =", event.dataTransfer.getData("text")
    event.preventDefault()

  onCut: (event) =>
    console.log "cut: event =", event
    event.preventDefault()

  onCopy: (event) =>
    console.log "copy: event =", event
    event.preventDefault()

  onPaste: (event) =>
    console.log "paste: event =", event, "content =", event.clipboardData.getData("text")
    event.preventDefault()

  onInput: (event) =>
    console.log "input"
    event.preventDefault()
