document.addEventListener "DOMContentLoaded", ->
  textElement = document.getElementById("text")
  toolbarElement = document.getElementById("toolbar")
  inputElement = document.getElementById("data")
  debugElement = document.getElementById("debug")

  window.controller = Trix.install({textElement, toolbarElement, inputElement, debugElement})
  textElement.focus()
