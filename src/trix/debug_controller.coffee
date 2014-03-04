class Trix.DebugController
  constructor: (@element, @textController) ->

  render: ->
    text = @renderText()
    @element.innerHTML = ""
    @element.appendChild(document.createTextNode(@renderText()))

  renderText: ->
    positionOrRange = if selectedRange = @textController.getSelectedRange()
      "Selected range: #{JSON.stringify(selectedRange)}"
    else
      position = @textController.getPosition() ? 0
      "Cursor position: #{position}"

    positionOrRange += " (locked)" if @textController.textView.lockedRange?
    lines = [positionOrRange, ""]

    @textController.text.eachRun (run) ->
      for key, value of run
        lines.push("#{key}: #{JSON.stringify(value)}")
      lines.push("")

    lines.join("\n")
