Trix.registerElement "trix-toolbar",
  defaultCSS: """
    %t {
      white-space: nowrap;
    }

    %t [data-trix-dialog] {
      display: none;
    }

    %t [data-trix-dialog][data-trix-active] {
      display: block;
    }

    %t [data-trix-dialog] [data-trix-validate]:invalid {
      background-color: #ffdddd;
    }
  """

  # Element lifecycle

  # `attachedCallback` (defined as `connect` here) doesn't run in Firefox when
  # an element is dynamically inserted while the document is still loading. Most
  # likely due to a bug in the v0 polyfill. For this element, the result is a
  # blank toolbar. Workaround: Render when created too in `createdCallback`.
  createdCallback: ->
    @render()

  connect: ->
    @render()

  # Private

  render: ->
    @innerHTML ||= Trix.config.toolbar.getDefaultHTML()
