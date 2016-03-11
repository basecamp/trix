{after, assert, getHTML, test, testGroup} = Trix.TestHelpers

testGroup "Trix.HTMLParser", ->
  eachFixture (name, {html, serializedHTML, document}) ->
    test name, (done) ->
      getReferenceElement (referenceElement) ->
        parsedDocument = Trix.HTMLParser.parse(html, {referenceElement}).getDocument()
        assert.documentHTMLEqual parsedDocument.copyUsingObjectsFromDocument(document), html
        done()

  eachFixture (name, {html, serializedHTML, document}) ->
    if serializedHTML?
      test "#{name} (serialized)", (done) ->
        getReferenceElement (referenceElement) ->
          parsedDocument = Trix.HTMLParser.parse(serializedHTML, {referenceElement}).getDocument()
          assert.documentHTMLEqual parsedDocument.copyUsingObjectsFromDocument(document), html
          done()

  test "parses absolute image URLs", ->
    src = "#{getOrigin()}/test_helpers/fixtures/logo.png"
    pattern = ///src="#{src}"///
    html = """<img src="#{src}">"""

    finalHTML = getHTML(Trix.HTMLParser.parse(html).getDocument())
    assert.ok pattern.test(finalHTML), "#{pattern} not found in #{JSON.stringify(finalHTML)}"

  test "parses relative image URLs", ->
    src = "/test_helpers/fixtures/logo.png"
    pattern = ///src="#{src}"///
    html = """<img src="#{src}">"""

    finalHTML = getHTML(Trix.HTMLParser.parse(html).getDocument())
    assert.ok pattern.test(finalHTML), "#{pattern} not found in #{JSON.stringify(finalHTML)}"

  test "parses unfamiliar html", ->
    html = """<meta charset="UTF-8"><span style="font-style: italic">abc</span><span>d</span><section style="margin:0"><blink>123</blink><a href="http://example.com">45<b>6</b></a>x<br />y</section><p style="margin:0">9</p>"""
    expectedHTML = """<div><!--block--><em>abc</em>d</div><div><!--block-->123<a href="http://example.com">45<strong>6</strong></a>x\ny</div><div><!--block-->9</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores leading whitespace before <meta> tag", ->
    html = """ \n <meta charset="UTF-8"><pre>abc</pre>"""
    expectedHTML = """<pre><!--block-->abc</pre>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores whitespace between block elements", ->
    html = """<div>a</div> \n <div>b</div>"""
    expectedHTML = """<div><!--block-->a</div><div><!--block-->b</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "preserves consecutive spaces", ->
    html = """<div>a   b  c</div>"""
    expectedHTML = """<div><!--block-->a   b  c</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "converts newlines to spaces", ->
    html = "<div>a\nb \nc \n d \n\ne</div><pre>1\n2</pre>"
    expectedHTML = """<div><!--block-->a b c d e</div><pre><!--block-->1\n2</pre>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "preserves newlines if the reference element can render them", (done) ->
    html = "<div>a\n\nb</div>"
    expectedHTML = """<div><!--block-->a\n\nb</div>"""
    getReferenceElement (referenceElement) ->
      assert.documentHTMLEqual Trix.HTMLParser.parse(html, {referenceElement}).getDocument(), expectedHTML
      done()

  test "parses entire HTML document", ->
    html = """<html><head><style>.bold {font-weight: bold}</style></head><body><span class="bold">abc</span></body></html>"""
    expectedHTML = """<div><!--block--><strong>abc</strong></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses inline element following block element", ->
    html = """<blockquote>abc</blockquote><strong>123</strong>"""
    expectedHTML = """<blockquote><!--block-->abc</blockquote><div><!--block--><strong>123</strong></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "translates tables into plain text", ->
    html = """<table><tr><td>a</td><td>b</td></tr><tr><td>1</td><td><p>2</p></td></tr><table>"""
    expectedHTML = """<div><!--block-->a | b\n1 | 2</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "translates block element margins to newlines", ->
    html = """<p style="margin: 0 0 1em 0">a</p><p style="margin: 0">b</p><article style="margin: 1em 0 0 0">c</article>"""
    expectedHTML = """<div><!--block-->a\n<br></div><div><!--block-->b</div><div><!--block-->\nc</div>"""
    document = Trix.HTMLParser.parse(html).getDocument()
    assert.documentHTMLEqual document, expectedHTML

  test "sanitizes unsafe html", (done) ->
    window.unsanitized = []
    Trix.HTMLParser.parse """
      <img onload="window.unsanitized.push('img.onload');" src="#{TEST_IMAGE_URL}">
      <img onerror="window.unsanitized.push('img.onerror');" src="data:image/gif;base64,TOTALLYBOGUS">
      <script>
        window.unsanitized.push('script tag');
      </script>
    """
    after 20, ->
      assert.deepEqual window.unsanitized, []
      delete window.unsanitized
      done()

getOrigin = ->
  {protocol, hostname, port} = window.location
  "#{protocol}//#{hostname}#{if port then ":#{port}" else ""}"

getReferenceElement = (callback) ->
  if element = document.getElementById("reference_element")
    callback(element)
  else
    element = document.createElement("trix-editor")
    element.id = "reference_element"
    element.addEventListener "trix-initialize", -> callback(element)

    container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"

    container.appendChild(element)
    document.body.appendChild(container)
