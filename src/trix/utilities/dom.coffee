Trix.DOM = dom =
  on: (element, eventName, selector, callback, useCapture = false) ->
    unless callback?
      callback = selector
      selector = null

    if selector?
      handler = (event) ->
        if target = dom.closest(event.target, selector)
          callback.call(target, event, target)
    else
      handler = (event) ->
        callback.call(element, event, element)

    element.addEventListener(eventName, handler, useCapture)
    handler

  match: (element, selector) ->
    if element?.nodeType is 1
      match.call(element, selector)

  closest: (element, selector) ->
    while element
      return element if dom.match(element, selector)
      element = element.parentNode

  closestElementNode: (node) ->
    node = node.parentNode until node.nodeType is Node.ELEMENT_NODE
    node

  getDimensions: (element) ->
    width:  element.offsetWidth
    height: element.offsetHeight

  trigger: (element, eventName) ->
    event = document.createEvent("Events")
    event.initEvent(eventName, true, true)
    element.dispatchEvent(event)

  createTreeWalker: (root, whatToShow = NodeFilter.SHOW_ALL, filter = null, entityReferenceExpansion = false) ->
    document.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion)

  findNodeForContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE or offset is 0
      container
    else
      container.childNodes.item(offset - 1)

html = document.documentElement
match = html.matchesSelector ? html.webkitMatchesSelector ? html.msMatchesSelector ? html.mozMatchesSelector
