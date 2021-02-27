#= require trix/core/helpers/global
#= require ./test_helpers/index
#= require_tree ./system
#= require_tree ./unit

Trix.config.undoInterval = 0

QUnit.config.hidepassed = true
QUnit.config.testTimeout = 20000

document.head.insertAdjacentHTML "beforeend", """
  <style type="text/css">
    #trix-container { height: 150px; }
    trix-toolbar { margin-bottom: 10px; }
    trix-toolbar button { border: 1px solid #ccc; background: #fff; }
    trix-toolbar button.active { background: #d3e6fd; }
    trix-toolbar button:disabled { color: #ccc; }
  </style>
"""
