module "Trix.HTMLParser"

eachFixture (name, {html, serializedHTML, document}) ->
  test name, ->
    parsedDocument = Trix.HTMLParser.parse(html).getDocument()
    expectHTML parsedDocument.copyUsingObjectsFromDocument(document), html

eachFixture (name, {html, serializedHTML, document}) ->
  if serializedHTML?
    test "#{name} (serialized)", ->
      parsedDocument = Trix.HTMLParser.parse(serializedHTML).getDocument()
      expectHTML parsedDocument.copyUsingObjectsFromDocument(document), html

test "parses absolute image URLs", ->
  src = "#{getOrigin()}/test_helpers/fixtures/logo.png"
  pattern = ///src="#{src}"///
  html = """<img src="#{src}">"""

  finalHTML = getHTML(Trix.HTMLParser.parse(html).getDocument())
  ok pattern.test(finalHTML), "#{pattern} not found in #{JSON.stringify(finalHTML)}"

test "parses relative image URLs", ->
  src = "/test_helpers/fixtures/logo.png"
  pattern = ///src="#{src}"///
  html = """<img src="#{src}">"""

  finalHTML = getHTML(Trix.HTMLParser.parse(html).getDocument())
  ok pattern.test(finalHTML), "#{pattern} not found in #{JSON.stringify(finalHTML)}"

test "parses unfamiliar html", ->
  html = """<meta charset="UTF-8"><span style="font-style: italic">abc</span><span>d</span><section style="margin:0"><blink>123</blink><a href="http://example.com">45<b>6</b></a>x<br />y</section><p style="margin:0">9</p>"""
  expectedHTML = """<div><!--block--><em>abc</em>d</div><div><!--block-->123<a href="http://example.com">45<strong>6</strong></a>x<br>y</div><div><!--block-->9</div>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "ignores leading whitespace before <meta> tag", ->
  html = """ \n <meta charset="UTF-8"><pre>abc</pre>"""
  expectedHTML = """<pre><!--block-->abc</pre>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "ignores whitespace between block elements", ->
  html = """<div>a</div> \n <div>b</div>"""
  expectedHTML = """<div><!--block-->a</div><div><!--block-->b</div>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "parses entire HTML document", ->
  html = """<html><head><style>.bold {font-weight: bold}</style></head><body><span class="bold">abc</span></body></html>"""
  expectedHTML = """<div><!--block--><strong>abc</strong></div>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "parses inline element following block element", ->
  html = """<blockquote>abc</blockquote><strong>123</strong>"""
  expectedHTML = """<blockquote><!--block-->abc</blockquote><div><!--block--><strong>123</strong></div>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "translates tables into plain text", ->
  html = """<table><tr><td>a</td><td>b</td></tr><tr><td>1</td><td><p>2</p></td></tr><table>"""
  expectedHTML = """<div><!--block-->a | b<br>1 | 2</div>"""
  expectHTML Trix.HTMLParser.parse(html).getDocument(), expectedHTML

test "translates block element margins to newlines", ->
  html = """<p style="margin: 0 0 1em 0">a</p><p style="margin: 0">b</p><article style="margin: 1em 0 0 0">c</article>"""
  expectedHTML = """<div><!--block-->a<br><br></div><div><!--block-->b</div><div><!--block--><br>c</div>"""
  document = Trix.HTMLParser.parse(html).getDocument()
  expectHTML document, expectedHTML

asyncTest "sanitizes unsafe html", ->
  window.unsanitized = []
  Trix.HTMLParser.parse """
    <img onload="window.unsanitized.push('img.onload');" src="#{TEST_IMAGE_URL}">
    <img onerror="window.unsanitized.push('img.onerror');" src="data:image/gif;base64,TOTALLYBOGUS">
    <script>
      window.unsanitized.push('script tag');
    </script>
  """
  after 20, ->
    deepEqual window.unsanitized, []
    delete window.unsanitized
    QUnit.start()

getOrigin = ->
  {protocol, hostname, port} = window.location
  "#{protocol}//#{hostname}#{if port then ":#{port}" else ""}"
