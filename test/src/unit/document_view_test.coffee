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

test "grouped quote blocks", ->
  document = new Trix.Document [
      new Trix.Block(Trix.Text.textForStringWithAttributes("a"), ["quote"])
      new Trix.Block(Trix.Text.textForStringWithAttributes("b"), ["quote"])
    ]
  html = "<blockquote><!--block-->a<br><!--block-->b</blockquote>"
  expectHTML document, html
