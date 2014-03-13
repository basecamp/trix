class Trix.DebugController
  constructor: (@element, @textController) ->

  render: ->
    @element.innerHTML = ""
    @element.appendChild(document.createTextNode(@renderDebugOutput()))

  renderDebugOutput: ->
    positionOrRange = if selectedRange = @textController.getSelectedRange()
      "Selected range: #{JSON.stringify(selectedRange)}"
    else
      position = @textController.getPosition() ? 0
      "Cursor position: #{position}"

    positionOrRange += " (locked)" if @textController.textView.lockedRange?
    lines = [positionOrRange, ""]

    if position?
      [container, offset] = @textController.textView.findContainerAndOffsetForPosition(position)
      lines.push("textView#findContainerAndOffsetForPosition:")
      lines.push(indent(@renderSelection(container, offset)))
      lines.push("")

      selection = window.getSelection()
      if selection.rangeCount > 0
        {startContainer, startOffset} = selection.getRangeAt(0)
        lines.push("window#getSelection:")
        lines.push(indent(@renderSelection(startContainer, startOffset)))
        lines.push("")

    @textController.text.eachRun (run) ->
      for key, value of run
        lines.push("#{key}: #{JSON.stringify(value)}")
      lines.push("")

    lines.join("\n")

  renderSelection: (container, offset) ->
    position = @textController.textView.findPositionFromContainerAtOffset(container, offset)

    containerContent =
      if container.nodeType is Node.TEXT_NODE
        '"'+container.textContent+'"'
      else
        container.outerHTML

    """
    Offset: #{offset}
    Container: #{containerContent}
    textView#findPositionFromContainerAtOffset: #{position}
    """

  indent = (string) ->
    string.replace(/^/mg, " ")
