{after, assert, test, testGroup} = Trix.TestHelpers

testGroup "HTML loading", ->
  testGroup "inline elements", template: "editor_with_styled_content", ->
    cases =
      "BR before block element styled otherwise":
        html: """a<br><figure class="attachment"><img src="#{TEST_IMAGE_URL}"></figure>"""
        expectedDocument: "a\n#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

      "BR in text before block element styled otherwise":
        html: """<div>a<br>b<figure class="attachment"><img src="#{TEST_IMAGE_URL}"></figure></div>"""
        expectedDocument: "a\nb#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

    for name, details of cases
      do (name, details) ->
        test name, (expectDocument) ->
          getEditor().loadHTML(details.html)
          expectDocument(details.expectedDocument)

  testGroup "bold elements", template: "editor_with_bold_styles", ->
    test "<strong> with font-weight: 500", (expectDocument) ->
      getEditor().loadHTML("<strong>a</strong>")
      assert.textAttributes([0, 1], bold: true)
      expectDocument("a\n")

    test "<span> with font-weight: 600", (expectDocument) ->
      getEditor().loadHTML("<span>a</span>")
      assert.textAttributes([0, 1], bold: true)
      expectDocument("a\n")

    test "<article> with font-weight: bold", (expectDocument) ->
      getEditor().loadHTML("<article>a</article>")
      assert.textAttributes([0, 1], bold: true)
      expectDocument("a\n")

  testGroup "styled block elements", template: "editor_with_block_styles", ->
    test "<em> in <blockquote> with font-style: italic", (expectDocument) ->
      getEditor().loadHTML("<blockquote>a<em>b</em></blockquote>")
      assert.textAttributes([0, 1], {})
      assert.textAttributes([1, 2], italic: true)
      assert.blockAttributes([0, 2], ["quote"])
      expectDocument("ab\n")

    test "<strong> in <li> with font-weight: bold", (expectDocument) ->
      getEditor().loadHTML("<ul><li>a<strong>b</strong></li></ul>")
      assert.textAttributes([0, 1], {})
      assert.textAttributes([1, 2], bold: true)
      assert.blockAttributes([0, 2], ["bulletList","bullet"])
      expectDocument("ab\n")

    test "newline in <li> with font-weight: bold", (expectDocument) ->
      getEditor().loadHTML("<ul><li>a<br>b</li></ul>")
      assert.textAttributes([0, 2], {})
      assert.blockAttributes([0, 2], ["bulletList","bullet"])
      expectDocument("a\nb\n")

  testGroup "in a table", template: "editor_in_table", ->
    test "block elements", (expectDocument) ->
      getEditor().loadHTML("<h1>a</h1><blockquote>b</blockquote>")
      assert.blockAttributes([0, 2], ["heading1"])
      assert.blockAttributes([2, 4], ["quote"])
      expectDocument("a\nb\n")

  testGroup "images", template: "editor_empty", ->
    test "without dimensions", (expectDocument) ->
      getEditor().loadHTML("""<img src="#{TEST_IMAGE_URL}">""")
      after 20, ->
        attachment = getDocument().getAttachments()[0]
        image = getEditorElement().querySelector("img")
        assert.equal(attachment.getWidth(), 1)
        assert.equal(attachment.getHeight(), 1)
        assert.equal(image.getAttribute("width"), "1")
        assert.equal(image.getAttribute("height"), "1")
        expectDocument("#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n")

    test "with dimensions", (expectDocument) ->
      getEditor().loadHTML("""<img src="#{TEST_IMAGE_URL}" width="10" height="20">""")
      after 20, ->
        attachment = getDocument().getAttachments()[0]
        image = getEditorElement().querySelector("img")
        assert.equal(attachment.getWidth(), 10)
        assert.equal(attachment.getHeight(), 20)
        assert.equal(image.getAttribute("width"),  "10")
        assert.equal(image.getAttribute("height"), "20")
        expectDocument("#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n")

  testGroup "text after closing tag", template: "editor_empty", ->
    test "parses text as separate block", (expectDocument) ->
      getEditor().loadHTML("<h1>a</h1>b")
      assert.blockAttributes([0, 2], ["heading1"])
      assert.blockAttributes([2, 4], [])
      expectDocument("a\nb\n")
