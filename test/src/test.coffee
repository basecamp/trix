#= require trix
#= require ./test_helpers
#= require ./formatting_helpers
#= require_tree ./fixtures
#= require_tree ./system
#= require_tree ./unit

document.addEventListener "DOMContentLoaded", ->
  container = """<div id="trix-container" style="height: 150px"></div>"""
  document.body.insertAdjacentHTML("afterbegin", container)
