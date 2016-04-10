Trix.registerElement "trix-inspector",
  defaultCSS: """
    %t {
      position: fixed;
      background: #fff;
      border: 1px solid #444;
      border-radius: 5px;
      padding: 10px;
      font-family: sans-serif;
      font-size: 12px;
      overflow: auto;
      word-wrap: break-word;
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

    %t .performance .metrics {
      margin: 0 0 5px 5px;
    }
  """

  attachedCallback: ->
    @editorElement = document.querySelector("trix-editor[trix-id='#{@dataset.trixId}']")
    @views = @createViews()

    for view in @views
      view.render()
      @appendChild(view.element)

    @reposition()

    @resizeHandler = @reposition.bind(this)
    addEventListener("resize", @resizeHandler)

  detachedCallback: ->
    removeEventListener("resize", @resizeHandler)

  createViews: ->
    views = for View in Trix.Inspector.views
      new View @editorElement

    views.sort (a, b) ->
      a.title.toLowerCase() > b.title.toLowerCase()

  reposition: ->
    {top, right} = @editorElement.getBoundingClientRect()

    @style.top = "#{top}px"
    @style.left = "#{right + 10}px"
    @style.maxWidth = "#{window.innerWidth - right - 30}px"
    @style.maxHeight = "#{window.innerHeight - top - 30}px"
