class Trix.Inspector.ControlElement
  keyEvents = "keydown keypress input".split(" ")
  compositionEvents = "compositionstart compositionupdate compositionend textInput".split(" ")

  observerOptions =
    attributes: true
    childList: true
    characterData: true
    characterDataOldValue: true
    subtree: true

  constructor: (@editorElement) ->
    @install()

  install: ->
    @createElement()
    @logInputEvents()
    @logMutations()

  uninstall: ->
    @observer.disconnect()
    @element.parentNode.removeChild(@element)

  createElement: ->
    @element = document.createElement("div")
    @element.setAttribute("contenteditable", "")
    @element.style.width = getComputedStyle(@editorElement).width
    @element.style.minHeight = "50px"
    @element.style.border = "1px solid green"
    @editorElement.parentNode.insertBefore(@element, @editorElement.nextSibling)

  logInputEvents: ->
    for eventName in keyEvents
      @element.addEventListener eventName, (event) ->
        console.log "#{event.type}: keyCode = #{event.keyCode}"

    for eventName in compositionEvents
      @element.addEventListener eventName, (event) ->
        console.log "#{event.type}: data = #{JSON.stringify(event.data)}"

  logMutations: ->
    @observer = new window.MutationObserver @didMutate
    @observer.observe(@element, observerOptions)

  didMutate: (mutations) =>
    console.log "Mutations (#{mutations.length}):"
    for mutation, index in mutations
      console.log " #{index + 1}. #{mutation.type}:"
      switch mutation.type
        when "characterData"
          console.log "  oldValue = #{JSON.stringify(mutation.oldValue)}, newValue = #{JSON.stringify(mutation.target.data)}"
        when "childList"
          console.log "  node added #{inspectNode(node)}" for node in mutation.addedNodes
          console.log "  node removed #{inspectNode(node)}" for node in mutation.removedNodes

  inspectNode = (node) ->
    if node.data?
      JSON.stringify(node.data)
    else
      JSON.stringify(node.outerHTML)
