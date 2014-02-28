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

html = document.documentElement
match = html.matchesSelector ? html.webkitMatchesSelector ? html.msMatchesSelector ? html.mozMatchesSelector
