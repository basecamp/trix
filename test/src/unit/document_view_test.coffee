module "Trix.DocumentView"

eachFixture (name, details) ->
  test name, ->
    expectHTML details.document, details.html

test "grouped code blocks", ->
  document = new Trix.Document [
      new Trix.Block(Trix.Text.textForStringWithAttributes("a"), ["code"])
      new Trix.Block(Trix.Text.textForStringWithAttributes("b"), ["code"])
    ]
  html = "<pre><!--block-->a\n<!--block-->b</pre>"
  expectHTML document, html
