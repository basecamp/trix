{defer} = Trix.Helpers

module "Basic input",
  setup: ->
    document.body.insertAdjacentHTML("beforeend", JST["integration/fixtures/basic_editor"]())
    window.editor = Trix.install(toolbar: "toolbar", textarea: "content")

  teardown: ->
    document.body.removeChild(document.getElementById("container"))

asyncTest "typing", ->
  expect 1
  defer ->
    element = getEditorElement()
    Syn.type "foo", element, ->
      equal editor.document.toString(), "foo\n"
      QUnit.start()

getEditorElement = ->
  document.querySelector("div.trix-editor[contenteditable]")

