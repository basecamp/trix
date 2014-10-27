module "Install",
  setup: ->
    html = """
      <div id="container">
        <div id="toolbar"></div>
        <textarea id="content" placeholder="Say hello..." style="height: 33px">Hello world</textarea>
      <div>
    """
    document.body.insertAdjacentHTML("beforeend", html)

  teardown: ->
    document.body.removeChild(document.getElementById("container"))


test "Trix.install", ->
  editor = Trix.install(textarea: "content", toolbar: "toolbar")

  ok editor instanceof Trix.EditorController
  ok element = document.querySelector("div.trix-editor[contenteditable]")
  equal element.innerHTML, "<div>Hello world</div>"
  equal element.getAttribute("data-placeholder"), "Say hello..."
  equal element.style.minHeight, "33px"
