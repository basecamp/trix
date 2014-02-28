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

    @textController.text.eachRun (string, attributes, position) ->
      lines.push("Position: #{position}")
      lines.push("String: #{JSON.stringify(string)}")
      lines.push("Attributes: #{JSON.stringify(attributes)}")
      lines.push("")

    lines.join("\n")
