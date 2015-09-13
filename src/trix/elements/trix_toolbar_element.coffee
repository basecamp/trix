{cloneFragment, triggerEvent} = Trix

Trix.registerElement "trix-toolbar",
  defaultCSS: """
    %t {
      white-space: collapse;
    }

    %t .dialog {
      display: none;
    }

    %t .dialog.active {
      display: block;
    }

    %t .dialog input.validate:invalid {
      background-color: #ffdddd;
    }

    %t[native] {
      display: none;
    }
  """

  attachedCallback: ->
    if @innerHTML is ""
      @appendChild(cloneFragment(Trix.config.toolbar.content))

    if @hasAttribute("native")
      if Trix.NativeToolbarController
        @toolbarController = new Trix.NativeToolbarController this
      else
        throw "Host application must implement Trix.NativeToolbarController"
    else
      @toolbarController = new Trix.ToolbarController this

    triggerEvent("trix-element-attached", onElement: this)
