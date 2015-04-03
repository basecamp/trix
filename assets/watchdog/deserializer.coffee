class Trix.Watchdog.Deserializer
  constructor: (@document, @snapshot) ->
    {@tree, @selection} = @snapshot
    @deserializeTree()
    @deserializeSelection()

  deserializeTree: ->
    @nodes = {}
    @element = @deserializeNode(@tree)

  deserializeNode: (serializedNode) ->
    node = switch serializedNode.name
      when "#text"
        @deserializeTextNode(serializedNode)
      when "#comment"
        @deserializeComment(serializedNode)
      else
        @deserializeElement(serializedNode)

    @nodes[serializedNode.id] = node
    node

  deserializeTextNode: ({value}) ->
    @document.createTextNode(value)

  deserializeComment: ({value}) ->
    @document.createComment(value)

  deserializeChildren: (serializedNode) ->
    for child in serializedNode.children ? []
      @deserializeNode(child)

  deserializeElement: (serializedNode) ->
    node = @document.createElement(serializedNode.name)
    node.setAttribute(name, value) for name, value of serializedNode.attributes ? {}
    node.removeChild(node.lastChild) while node.lastChild
    node.appendChild(childNode) for childNode in @deserializeChildren(serializedNode)
    node

  deserializeSelection: ->
    return unless @selection
    {start, end} = @selection
    startContainer = @nodes[start.id]
    endContainer = @nodes[end.id]

    @range = @document.createRange()
    @range.setStart(startContainer, start.offset)
    @range.setEnd(endContainer, end.offset)
    @range

  getElement: ->
    @element

  getRange: ->
    @range
