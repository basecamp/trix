class Trix.DebugController
  @sections = "PositionOrRange Selections TextRuns".split(" ")

  constructor: (@element, @textView, @composition) ->

  render: ->
    @element.innerHTML = ""
    @element.appendChild(document.createTextNode(@renderDebugOutput()))

  renderDebugOutput: ->
    strings = []
    for section in @constructor.sections
      if result = @["render#{section}"].call(this)
        strings.push(result)
    strings.join("\n\n")

  renderPositionOrRange: ->
    string = if selectedRange = @composition.getSelectedRange()
      "Selected range: #{JSON.stringify(selectedRange)}"
    else
      position = @composition.getPosition() ? 0
      "Cursor position: #{position}"

    string += " (frozen)" if @composition.hasFrozenSelection()
    string

  renderSelections: ->
    position = @composition.getPosition()
    return unless position?

    [container, offset] = @textView.findContainerAndOffsetForPosition(position)
    string = """
    textView#findContainerAndOffsetForPosition:
    #{indent(@renderSelection(container, offset))}
    """

    selection = window.getSelection()
    if selection.rangeCount > 0
      {startContainer, startOffset} = selection.getRangeAt(0)
      string += """\n
      window#getSelection:
      #{indent(@renderSelection(startContainer, startOffset))}
      """
    string

  renderSelection: (container, offset) ->
    position = @textView.findPositionFromContainerAtOffset(container, offset)

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
    @composition.text.eachRun (run) ->
      for key, value of run
        string += "#{key}: #{JSON.stringify(value)}\n"
      string += "\n"
    string

  indent = (string) ->
    string.replace(/^/mg, " ")
