{assert, test, testGroup} = Trix.TestHelpers

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
