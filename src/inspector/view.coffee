{handleEvent} = Trix

class Trix.Inspector.View
  constructor: (@editorElement) ->
    {@editorController, @editor} = @editorElement
    {@compositionController, @composition} = @editorController

    @element = document.createElement("details")
    @element.open = true if @getSetting("open") is "true"
    @element.classList.add(@template)

    @titleElement = document.createElement("summary")
    @element.appendChild(@titleElement)

    @panelElement = document.createElement("div")
    @panelElement.classList.add("panel")
    @element.appendChild(@panelElement)

    @element.addEventListener "toggle", (event) =>
      if event.target is @element
        @didToggle()

    @installEventHandlers() if @events

  installEventHandlers: ->
    for eventName, handler of @events then do (eventName, handler) =>
      handleEvent eventName, onElement: @editorElement, withCallback: (event) =>
        requestAnimationFrame =>
          handler.call(this, event)

  didToggle: (event) ->
    @saveSetting("open", @isOpen())
    @render()

  isOpen: ->
    @element.hasAttribute("open")

  getTitle: ->
    @title ? ""

  render: ->
    @renderTitle()
    if @isOpen()
      @panelElement.innerHTML = JST["trix/inspector/templates/#{@template}"](this)

  renderTitle: ->
    @titleElement.innerHTML = @getTitle()

  getSetting: (key) ->
    key = @getSettingsKey(key)
    window.sessionStorage?[key]

  saveSetting: (key, value) ->
    key = @getSettingsKey(key)
    window.sessionStorage?[key] = value

  getSettingsKey: (key) ->
    "trix/inspector/#{@template}/#{key}"
