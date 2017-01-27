helpers = Trix.TestHelpers

helpers.extend
  setFixture: (name, callback) ->
    element = findOrCreateTrixContainer()
    if callback?
      element.addEventListener "trix-initialize", handler = ({target}) ->
        element.removeEventListener("trix-initialize", handler)
        if target.hasAttribute("autofocus")
          target.editor.setSelectedRange(0)
        callback(target)

    html = JST["test_helpers/fixtures/#{name}"]()
    element.innerHTML = html

  clearFixture: ->
    findOrCreateTrixContainer().innerHTML = ""

findOrCreateTrixContainer = ->
  if container = document.getElementById("trix-container")
    container
  else
    document.body.insertAdjacentHTML("afterbegin", """<form id="trix-container"></form>""")
    document.getElementById("trix-container")
