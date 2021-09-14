Trix.registerElement "trix-inspector",
  defaultCSS: """
    %t {
      display: block;
    }

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

    %t .selection .characters {
      margin-top: 10px;
    }

    %t .selection .character {
      display: inline-block;
      font-size: 8px;
      font-family: courier, monospace;
      line-height: 10px;
      vertical-align: middle;
      text-align: center;
      width: 10px;
      height: 10px;
      margin: 0 1px 1px 0;
      border: 1px solid #333;
      border-radius: 1px;
      background: #676666;
      color: #fff;
    }

    %t .selection .character.selected {
      background: yellow;
      color: #000;
    }
  """

  connect: ->
    @editorElement = document.querySelector("trix-editor[trix-id='#{@dataset.trixId}']")
    @views = @createViews()

    for view in @views
      view.render()
      @appendChild(view.element)

    @reposition()

    @resizeHandler = @reposition.bind(this)
    addEventListener("resize", @resizeHandler)

  disconnect: ->
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
    @style.maxWidth = "#{window.innerWidth - right - 40}px"
    @style.maxHeight = "#{window.innerHeight - top - 30}px"
