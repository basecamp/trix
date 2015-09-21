{cloneFragment} = Trix

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

  createdCallback: ->
    if @innerHTML is ""
      @appendChild(cloneFragment(Trix.config.toolbar.content))
