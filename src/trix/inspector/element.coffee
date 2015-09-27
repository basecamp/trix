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
