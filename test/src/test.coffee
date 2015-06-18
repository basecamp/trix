#= require trix
#= require ./test_helpers
#= require ./test_stubs
#= require ./formatting_helpers
#= require_tree ./fixtures
#= require_tree ./system
#= require_tree ./unit

document.addEventListener "DOMContentLoaded", ->
  container = """
    <div id="trix-container" style="height: 150px"></div>
  """
  document.body.insertAdjacentHTML("afterbegin", container)

  styles = """
    <style type="text/css">
      trix-toolbar { margin-bottom: 10px }
      trix-toolbar button { border: 1px solid #ccc; background: #fff }
      trix-toolbar button.active { background: #d3e6fd }
      trix-toolbar button:disabled { color: #ccc }
    </style>
  """
  document.head.insertAdjacentHTML("beforeend", styles)
