Trix.registerElement "trix-inspector",
  defaultCSS: """
    %t {
      position: absolute;
      background: #fff;
      border: 1px solid #444;
      border-radius: 5px;
      margin-left: 5px;
      padding: 10px;
      font-family: sans-serif;
      font-size: 12px;
    }

    %t details {
      margin-bottom: 10px;
    }

    %t summary:focus {
      outline: none;
    }

    %t details .panel {
      padding: 10px;
    }
  """

  attachedCallback: ->
    @editorElement = document.querySelector("trix-editor[trix-id='#{@dataset.trixId}']")
    @views = @createViews()

    for view in @views
      view.render()
      @appendChild(view.element)

    @editorElement.addEventListener("trix-selectionchange", => @reposition())
    @reposition()

  createViews: ->
    views = for View in Trix.Inspector.views
      new View @editorElement

    views.sort (a, b) ->
      a.title.toLowerCase() > b.title.toLowerCase()

  reposition: ->
    position = @editorElement.editor.getPosition() ? 0
    selectionRect = try @editorElement.editor.getClientRectAtPosition(position)
    elementRect = @editorElement.getBoundingClientRect()

    top = selectionRect?.top ? elementRect.top
    left = elementRect.left + elementRect.width

    @style.top = "#{top}px"
    @style.left = "#{left}px"
