Trix.DOM = dom =
  handleEvent: (eventName, {onElement, matchingSelector, withCallback, inPhase, preventDefault}) ->
    element = onElement ? document.documentElement
    selector = matchingSelector
    callback = withCallback
    useCapture = inPhase is "capturing"

    handler = (event) ->
      target = if selector? then dom.closest(event.target, selector) else element
      withCallback?.call(target, event, target) if target?
      event.preventDefault() if preventDefault

    handler.destroy = ->
      element.removeEventListener(eventName, handler, useCapture)

    element.addEventListener(eventName, handler, useCapture)
    handler

  triggerEvent: (eventName, {onElement, bubbles, cancelable}) ->
    element = onElement ? document.documentElement
    bubbles = bubbles isnt false
    cancelable = cancelable isnt false

    event = document.createEvent("Events")
    event.initEvent(eventName, bubbles, cancelable)
    element.dispatchEvent(event)
    event

  elementMatchesSelector: (element, selector) ->
    if element?.nodeType is 1
      match.call(element, selector)

  closest: (element, selector) ->
    while element
      return element if dom.elementMatchesSelector(element, selector)
      element = element.parentNode

  closestElementNode: (node) ->
    return unless node
    node = node.parentNode until node.nodeType is Node.ELEMENT_NODE
    node

  getDimensions: (element) ->
    width:  element.offsetWidth
    height: element.offsetHeight

  createTreeWalker: (root, whatToShow = NodeFilter.SHOW_ALL, filter = null, entityReferenceExpansion = false) ->
    document.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion)

  findNodeForContainerAtOffset: (container, offset) ->
    return unless container
    if container.nodeType is Node.TEXT_NODE
      container
    else if offset is 0
      container.firstChild ? container
    else
      container.childNodes.item(offset - 1)

  findElementForContainerAtOffset: (container, offset) ->
    dom.closestElementNode(dom.findNodeForContainerAtOffset(container, offset))

html = document.documentElement
match = html.matchesSelector ? html.webkitMatchesSelector ? html.msMatchesSelector ? html.mozMatchesSelector
