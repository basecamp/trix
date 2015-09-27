#= require trix
#= require ./test_helpers
#= require ./test_stubs
#= require ./formatting_helpers
#= require_tree ./fixtures
#= require_tree ./system
#= require_tree ./unit

Trix.config.undoInterval = 0

document.head.insertAdjacentHTML "beforeend", """
  <style type="text/css">
    body {
      margin: 5px;
    }

    #qunit-fixture {
      position: absolute !important;
      top: 5px !important;
      left: 5px !important;
      width: auto !important;
      height: 150px !important;
    }

    #qunit {
      margin-top: 160px !important;
    }

    trix-toolbar { margin-bottom: 10px; }
    trix-toolbar button { border: 1px solid #ccc; background: #fff; }
    trix-toolbar button.active { background: #d3e6fd; }
    trix-toolbar button:disabled { color: #ccc; }
  </style>
"""
