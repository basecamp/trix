module "Installation process",
  setup: ->
    html = """
      <div id="container">
        <div id="toolbar"></div>
        <textarea id="content" placeholder="Say hello..." style="height: 33px">Hello world</textarea>
        <textarea id="data">
          [
            {
              "text": [
                {
                  "type": "string",
                  "string": "Hello strange world",
                  "attributes": {}
                }
              ]
            }
          ]
        </textarea>
      <div>
    """
    document.body.insertAdjacentHTML("beforeend", html)

  teardown: ->
    document.body.removeChild(document.getElementById("container"))


test "returns an editor controller", ->
  editor = Trix.install(textarea: "content", toolbar: "toolbar")
  ok editor instanceof Trix.EditorController

test "creates a contenteditable element", ->
  Trix.install(textarea: "content", toolbar: "toolbar")
  ok element = document.querySelector("div.trix-editor[contenteditable]")
  equal document.getElementById("content").style.display, "none"

test "loads the initial document", ->
  Trix.install(textarea: "content", toolbar: "toolbar")
  element = document.querySelector("div.trix-editor[contenteditable]")
  equal element.textContent, "Hello world"

test "loads the initial document from input with JSON", ->
  document.getElementById("content").innerHTML = ""
  Trix.install(textarea: "content", input: "data", toolbar: "toolbar")
  element = document.querySelector("div.trix-editor[contenteditable]")
  equal element.textContent, "Hello strange world"

test "copies attributes from textarea", ->
  Trix.install(textarea: "content", toolbar: "toolbar")
  element = document.querySelector("div.trix-editor[contenteditable]")
  equal element.getAttribute("data-placeholder"), "Say hello..."
  equal element.style.minHeight, "33px"
