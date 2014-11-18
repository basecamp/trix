module "Trix.DocumentView"

test "bold text", ->
  doc = createDocument(["abc", bold: true])
  expectHTML doc, "<div><strong>abc</strong></div>"

test "bold, italic text", ->
  doc = createDocument(["abc", bold: true, italic: true])
  expectHTML doc, "<div><strong><em>abc</em></strong></div>"

test "text with newline", ->
  doc = createDocument(["ab\nc"])
  expectHTML doc, "<div>ab<br>c</div>"

test "text with link", ->
  doc = createDocument(["abc", href: "http://example.com"])
  expectHTML doc, """<div><a href="http://example.com">abc</a></div>"""

test "text with link and formatting", ->
  doc = createDocument(["abc", italic: true, href: "http://example.com"])
  expectHTML doc, """<div><a href="http://example.com"><em>abc</em></a></div>"""

test "partially formatted link", ->
  piece1 = new Trix.StringPiece "ab", href: "http://example.com"
  piece2 = new Trix.StringPiece "c", href: "http://example.com", italic: true
  text = new Trix.Text [piece1, piece2]
  doc = new Trix.Document [new Trix.Block text]
  expectHTML doc, """<div><a href="http://example.com">ab<em>c</em></a></div>"""

test "quote formatted block", ->
  doc = createDocument(["abc", {}, quote: true])
  expectHTML doc, "<blockquote>abc</blockquote>"

test "code formatted block", ->
  doc = createDocument(["123", {}, code: true])
  expectHTML doc, "<pre>123</pre>"

test "code with newline", ->
  doc = createDocument(["12\n3", {}, code: true])
  expectHTML doc, "<pre>12\n3</pre>"


createDocument = (parts...) ->
  blocks = for part in parts
    [string, textAttributes, blockAttributes] = part
    text = Trix.Text.textForStringWithAttributes(string, textAttributes)
    new Trix.Block text, blockAttributes
  new Trix.Document blocks

expectHTML = (trixDocument, html) ->
  element = document.createElement("div")
  view = new Trix.DocumentView trixDocument, {element}
  view.render()
  equal element.innerHTML, html
