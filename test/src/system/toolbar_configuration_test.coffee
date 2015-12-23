editorModule "Toolbar configuration"

editorConfigTest "toolbar button lang",
  setup: ->
    Trix.config.lang.bold = "Bold!"
  , (done) ->
    button = find(".button-bold")
    equal button.title, "Bold!"
    equal button.textContent, "Bold!"
    done()

editorConfigTest "single toolbar button group and button",
  setup: ->
    Trix.config.toolbar.groups = [ ["bold"] ]
  , (done) ->
    groups = findAll(".button-group")
    buttons = findAll(".button")
    equal groups.length, 1
    equal buttons.length, 1
    equal buttons[0].title, "Bold"
    equal buttons[0].textContent, "Bold"
    ok buttons[0].classList.contains("button-bold")
    done()

editorConfigTest "multiple toolbar button groups and buttons",
  setup: ->
    Trix.config.toolbar.groups = [ ["italic", "bold"], ["quote"] ]
  , (done) ->
    groups = findAll(".button-group")
    buttons = findAll(".button")
    equal groups.length, 2
    equal buttons.length, 3
    ok groups[0].querySelector(".button-italic")
    ok groups[0].querySelector(".button-bold")
    ok groups[1].querySelector(".button-quote")
    done()

editorConfigTest "toolbar dialog function",
  setup: ->
    Trix.config.toolbar.buttons.link.dialog = -> "link!"
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    equal dialog.textContent, "link!"
    done()

editorConfigTest "toolbar dialog string",
  setup: ->
    Trix.config.toolbar.buttons.link.dialog = "link!"
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    equal dialog.textContent, "link!"
    done()

editorConfigTest "toolbar dialog element",
  setup: ->
    element = document.createElement("span")
    element.textContent = "link!"
    Trix.config.toolbar.buttons.link.dialog = element
  , (done) ->
    dialog = find(".dialogs .dialog-link")
    equal dialog.textContent, "link!"
    done()

find = (selector) ->
  document.querySelector("trix-toolbar #{selector}")

findAll = (selector) ->
  document.querySelectorAll("trix-toolbar #{selector}")
