{test, testGroup} = Trix.TEST_HELPERS

testGroup "HTML loading", template: "editor_with_styled_content", ->
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
