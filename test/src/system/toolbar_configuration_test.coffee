{assert, clearFixture, setFixture, test, testGroup} = Trix.TestHelpers

configTest = (name, setup, callback) ->
  test name, (done) ->
    originalConfig = deepCopy(Trix.config)
    setup()
    setFixture "editor_empty", ->
      configTestDone = ->
        Trix.config = originalConfig
        clearFixture()
        requestAnimationFrame(done)
      callback(configTestDone)

testGroup "Toolbar configuration", ->
  configTest "toolbar button lang", ->
    Trix.config.lang.bold = "Bold!"
  , (done) ->
    button = find(".button-bold")
    assert.equal button.title, "Bold!"
    assert.equal button.textContent, "Bold!"
    done()

  configTest "single toolbar button group and button", ->
    Trix.config.toolbar.groups = [ ["bold"] ]
  , (done) ->
    groups = findAll(".button-group")
    buttons = findAll(".button")
    assert.equal groups.length, 1
    assert.equal buttons.length, 1
    assert.equal buttons[0].title, "Bold"
    assert.equal buttons[0].textContent, "Bold"
    assert.ok buttons[0].classList.contains("button-bold")
    done()

  configTest "multiple toolbar button groups and buttons", ->
    Trix.config.toolbar.groups = [ ["italic", "bold"], ["quote"] ]
  , (done) ->
    groups = findAll(".button-group")
    buttons = findAll(".button")
    assert.equal groups.length, 2
    assert.equal buttons.length, 3
    assert.ok groups[0].querySelector(".button-italic")
    assert.ok groups[0].querySelector(".button-bold")
    assert.ok groups[1].querySelector(".button-quote")
    done()

  configTest "toolbar dialog function", ->
    Trix.config.toolbar.buttons.link.dialog = -> "link!"
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    assert.equal dialog.textContent, "link!"
    done()

  configTest "toolbar dialog string", ->
    Trix.config.toolbar.buttons.link.dialog = "link!"
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    assert.equal dialog.textContent, "link!"
    done()

  configTest "toolbar dialog element", ->
    element = document.createElement("span")
    element.textContent = "link!"
    Trix.config.toolbar.buttons.link.dialog = element
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    assert.equal dialog.textContent, "link!"
    done()

deepCopy = (object) ->
  result = {}
  for key, value of object
    result[key] = switch
      when Array.isArray(value)
        value.slice(0)
      when typeof value is "object"
        deepCopy(value)
      else
        value
  result

find = (selector) ->
  document.querySelector("trix-toolbar #{selector}")

findAll = (selector) ->
  document.querySelectorAll("trix-toolbar #{selector}")
