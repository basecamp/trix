initialized = false
initializedCallbacks = []

document.addEventListener "trix-initialize", ->
  initialized = true
  callback() while callback = initializedCallbacks.shift()

editorInitialized = (callback) ->
  if initialized
    callback()
  else
    initializedCallbacks.push(callback)

setFixtureHTML = (html) ->
  element = findOrCreateTrixContainer()
  element.innerHTML = html

findOrCreateTrixContainer = ->
  if container = document.getElementById("trix-container")
    container
  else
    document.body.insertAdjacentHTML("afterbegin", """<form id="trix-container"></form>""")
    document.getElementById("trix-container")

@editorModule = (name, {template, setup, teardown} = {}, callback) ->
  beforeEach = ->
    initialized = false
    if template?
      setFixtureHTML(JST["test_helpers/fixtures/#{template}"]())
    setup?()

  afterEach = ->
    if template?
      setFixtureHTML("")
    teardown?()

  if callback?
    QUnit.module name, (hooks) ->
      hooks.beforeEach(beforeEach)
      hooks.afterEach(afterEach)
      callback()
  else
    QUnit.module(name, {beforeEach, afterEach})

@editorTest = (name, callback) ->
  QUnit.test name, (assert) ->
    doneAsync = assert.async()

    done = (expectedDocumentValue) ->
      if expectedDocumentValue
        equal getDocument().toString(), expectedDocumentValue
      doneAsync()

    editorInitialized ->
      if getEditorElement().hasAttribute("autofocus")
        getEditorController().setLocationRange(index: 0, offset: 0)

      if callback.length is 0
        callback()
        done()
      else
        callback(done)
