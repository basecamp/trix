class Trix.DebugController
  constructor: (@element, @textController) ->

  render: ->
    @element.innerHTML = ""
    @element.appendChild(document.createTextNode(@renderDebugOutput()))

  renderDebugOutput: ->
    output = []
    for section in ["PositionOrRange", "Selections", "TextRuns"]
      if result = @["render#{section}"].call(this)
        output.push(result)
    output.join("\n\n")

  renderPositionOrRange: ->
    positionOrRange = if selectedRange = @textController.getSelectedRange()
      "Selected range: #{JSON.stringify(selectedRange)}"
    else
      position = @textController.getPosition() ? 0
      "Cursor position: #{position}"

    positionOrRange += " (locked)" if @textController.textView.lockedRange?
    positionOrRange

  renderSelections: ->
    position = @textController.getPosition()
    return unless position?
    lines = []

    [container, offset] = @textController.textView.findContainerAndOffsetForPosition(position)
    lines.push("textView#findContainerAndOffsetForPosition:")
    lines.push(indent(@renderSelection(container, offset)))

    selection = window.getSelection()
    if selection.rangeCount > 0
      {startContainer, startOffset} = selection.getRangeAt(0)
      lines.push("")
      lines.push("window#getSelection:")
      lines.push(indent(@renderSelection(startContainer, startOffset)))

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

  renderTextRuns: ->
    string = ""
    @textController.text.eachRun (run) ->
      for key, value of run
        string += "#{key}: #{JSON.stringify(value)}\n"
    string

  indent = (string) ->
    string.replace(/^/mg, " ")
