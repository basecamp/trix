{cloneFragment} = Trix

Trix.registerElement "trix-toolbar",
  defaultCSS: """
    %t {
      white-space: nowrap;
    }

    %t .trix-dialog {
      display: none;
    }

    %t .trix-dialog.active {
      display: block;
    }

    %t .trix-dialog input.validate:invalid {
      background-color: #ffdddd;
    }

    %t[native] {
      display: none;
    }
  """

  createdCallback: ->
    if @innerHTML is ""
      @appendChild(cloneFragment(Trix.config.toolbar.content))
