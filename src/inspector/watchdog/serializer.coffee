class Trix.Watchdog.Serializer
  constructor: (@element) ->
    @id = 0
    @serializeTree()
    @serializeSelection()

  serializeTree: ->
    @ids = new Map
    @tree = @serializeNode(@element)

  serializeNode: (node) ->
    object = id: ++@id, name: node.nodeName
    @ids.set(node, object.id)

    switch node.nodeType
      when Node.ELEMENT_NODE
        @serializeElementToObject(node, object)
        @serializeElementChildrenToObject(node, object)

      when Node.TEXT_NODE, Node.COMMENT_NODE
        @serializeNodeValueToObject(node, object)

    object

  serializeElementToObject: (node, object) ->
    attributes = {}
    hasAttributes = false

    for {name} in node.attributes
      if node.hasAttribute(name)
        value = node.getAttribute(name)
        value = "data:" if name is "src" and value[0...5] is "data:"
        attributes[name] = value
        hasAttributes = true

    if hasAttributes
      object.attributes = attributes

  serializeElementChildrenToObject: (node, object) ->
    if node.childNodes.length
      object.children = for childNode in node.childNodes
        @serializeNode(childNode)

  serializeNodeValueToObject: (node, object) ->
    object.value = node.nodeValue

  serializeSelection: ->
    selection = window.getSelection()
    return unless selection.rangeCount > 0

    range = selection.getRangeAt(0)
    startId = @ids.get(range?.startContainer)
    endId = @ids.get(range?.endContainer)

    if startId and endId
      @selection =
        start: id: startId, offset: range.startOffset
        end: id: endId, offset: range.endOffset

  getSnapshot: ->
    {@tree, @selection}
