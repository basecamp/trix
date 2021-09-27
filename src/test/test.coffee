import Trix from "trix/trix"
import "trix/core/helpers/global"
import "test/test_helpers"

import "test/unit"
import "test/system"

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
