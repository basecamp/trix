#= require_self

html = document.documentElement
match = html.matchesSelector ? html.webkitMatchesSelector ? html.msMatchesSelector ? html.mozMatchesSelector

Trix.extend
  handleEvent: (eventName, {onElement, matchingSelector, withCallback, inPhase, preventDefault, times} = {}) ->
    element = onElement ? html
    selector = matchingSelector
    callback = withCallback
    useCapture = inPhase is "capturing"

    handler = (event) ->
      handler.destroy() if times? and --times is 0
      target = Trix.findClosestElementFromNode(event.target, matchingSelector: selector)
      if target?
        withCallback?.call(target, event, target)
        event.preventDefault() if preventDefault

    handler.destroy = ->
      element.removeEventListener(eventName, handler, useCapture)

    element.addEventListener(eventName, handler, useCapture)
    handler

  handleEventOnce: (eventName, options = {}) ->
    options.times = 1
    Trix.handleEvent(eventName, options)

  triggerEvent: (eventName, {onElement, bubbles, cancelable, attributes} = {}) ->
    element = onElement ? html
    bubbles = bubbles isnt false
    cancelable = cancelable isnt false

    event = document.createEvent("Events")
    event.initEvent(eventName, bubbles, cancelable)
    Trix.extend.call(event, attributes) if attributes?
    element.dispatchEvent(event)

  elementMatchesSelector: (element, selector) ->
    if element?.nodeType is 1
      match.call(element, selector)

  findClosestElementFromNode: (node, {matchingSelector, untilNode} = {}) ->
    node = node.parentNode until not node? or node.nodeType is Node.ELEMENT_NODE
    return unless node?

    if matchingSelector?
      if node.closest and not untilNode?
        node.closest(matchingSelector)
      else
        while node and node isnt untilNode
          return node if Trix.elementMatchesSelector(node, matchingSelector)
          node = node.parentNode
    else
      node

  findInnerElement: (element) ->
    element = element.firstElementChild while element?.firstElementChild
    element

  innerElementIsActive: (element) ->
    document.activeElement isnt element and Trix.elementContainsNode(element, document.activeElement)

  elementContainsNode: (element, node) ->
    return unless element and node
    while node
      return true if node is element
      node = node.parentNode

  findNodeFromContainerAndOffset: (container, offset) ->
    return unless container
    if container.nodeType is Node.TEXT_NODE
      container
    else if offset is 0
      container.firstChild ? container
    else
      container.childNodes.item(offset - 1)

  findElementFromContainerAndOffset: (container, offset) ->
    node = Trix.findNodeFromContainerAndOffset(container, offset)
    Trix.findClosestElementFromNode(node)

  findChildIndexOfNode: (node) ->
    return unless node?.parentNode
    childIndex = 0
    childIndex++ while node = node.previousSibling
    childIndex

  removeNode: (node) ->
    node?.parentNode?.removeChild(node)

  walkTree: (tree, {onlyNodesOfType, usingFilter, expandEntityReferences} = {}) ->
    whatToShow = switch onlyNodesOfType
      when "element" then NodeFilter.SHOW_ELEMENT
      when "text"    then NodeFilter.SHOW_TEXT
      when "comment" then NodeFilter.SHOW_COMMENT
      else NodeFilter.SHOW_ALL

    document.createTreeWalker(tree, whatToShow, usingFilter ? null, expandEntityReferences is true)

  tagName: (element) ->
    element?.tagName?.toLowerCase()

  makeElement: (tagName, options = {}) ->
    if typeof tagName is "object"
      options = tagName
      {tagName} = options
    else
      options = attributes: options

    element = document.createElement(tagName)

    if options.editable?
      options.attributes ?= {}
      options.attributes.contenteditable = options.editable

    if options.attributes
      for key, value of options.attributes
        element.setAttribute(key, value)

    if options.style
      for key, value of options.style
        element.style[key] = value

    if options.data
      for key, value of options.data
        element.dataset[key] = value

    if options.className
      for className in options.className.split(" ")
        element.classList.add(className)

    if options.textContent
      element.textContent = options.textContent

    if options.childNodes
      for childNode in [].concat(options.childNodes)
        element.appendChild(childNode)

    element

  getBlockTagNames: ->
    Trix.blockTagNames ?= (tagName for key, {tagName} of Trix.config.blockAttributes when tagName)

  nodeIsBlockContainer: (node) ->
    Trix.nodeIsBlockStartComment(node?.firstChild)

  nodeProbablyIsBlockContainer: (node) ->
    Trix.tagName(node) in Trix.getBlockTagNames() and
      Trix.tagName(node.firstChild) not in Trix.getBlockTagNames()

  nodeIsBlockStart: (node, {strict} = strict: true) ->
    if strict
      Trix.nodeIsBlockStartComment(node)
    else
      Trix.nodeIsBlockStartComment(node) or
        (not Trix.nodeIsBlockStartComment(node.firstChild) and Trix.nodeProbablyIsBlockContainer(node))

  nodeIsBlockStartComment: (node) ->
    Trix.nodeIsCommentNode(node) and node?.data is "block"

  nodeIsCommentNode: (node) ->
    node?.nodeType is Node.COMMENT_NODE

  nodeIsCursorTarget: (node, {name} = {}) ->
    return unless node
    if Trix.nodeIsTextNode(node)
      if node.data is Trix.ZERO_WIDTH_SPACE
        if name
          node.parentNode.dataset.trixCursorTarget is name
        else
          true
    else
      Trix.nodeIsCursorTarget(node.firstChild)

  nodeIsAttachmentElement: (node) ->
    Trix.elementMatchesSelector(node, Trix.AttachmentView.attachmentSelector)

  nodeIsEmptyTextNode: (node) ->
    Trix.nodeIsTextNode(node) and node?.data is ""

  nodeIsTextNode: (node) ->
    node?.nodeType is Node.TEXT_NODE
