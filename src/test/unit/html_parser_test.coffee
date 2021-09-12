{after, assert, createCursorTarget, getHTML, test, testGroup} = Trix.TestHelpers

cursorTargetLeft = createCursorTarget("left").outerHTML
cursorTargetRight = createCursorTarget("right").outerHTML

testGroup "Trix.HTMLParser", ->
  eachFixture (name, {html, serializedHTML, document}) ->
    test name, ->
      parsedDocument = Trix.HTMLParser.parse(html).getDocument()
      assert.documentHTMLEqual parsedDocument.copyUsingObjectsFromDocument(document), html

  eachFixture (name, {html, serializedHTML, document}) ->
    if serializedHTML?
      test "#{name} (serialized)", ->
        parsedDocument = Trix.HTMLParser.parse(serializedHTML).getDocument()
        assert.documentHTMLEqual parsedDocument.copyUsingObjectsFromDocument(document), html

  testGroup "nested line breaks", ->
    cases =
      "<div>a<div>b</div>c</div>": "<div><!--block-->a<br>b<br>c</div>"
      "<div>a<div><div><div>b</div></div></div>c</div>": "<div><!--block-->a<br>b<br>c</div>"
      "<blockquote>a<div>b</div>c</blockquote>": "<blockquote><!--block-->a<br>b<br>c</blockquote>"
      # TODO:
      # "<div><div>a</div><div>b</div>c</div>": "<div><!--block-->a<br>b<br>c</div>"
      # "<blockquote><div>a</div><div>b</div><div>c</div></blockquote>": "<blockquote><!--block-->a<br>b<br>c</blockquote>"
      # "<blockquote><div>a<br></div><div><br></div><div>b<br></div></blockquote>": "<blockquote><!--block-->a<br><br>b</blockquote>"

    for html, expectedHTML of cases
      do (html, expectedHTML) ->
        test html, -> assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

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
    expectedHTML = """<div><!--block--><em>abc</em>d</div><div><!--block-->123<a href="http://example.com">45<strong>6</strong></a>x<br>y</div><div><!--block-->9</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores leading whitespace before <meta> tag", ->
    html = """ \n <meta charset="UTF-8"><pre>abc</pre>"""
    expectedHTML = """<pre><!--block-->abc</pre>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores content after </html>", ->
    html = """
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta http-equiv=Content-Type content="text/html; charset=utf-8">
    <meta name=ProgId content=Word.Document>
    </head>

    <body lang=EN-US link=blue vlink="#954F72" style='tab-interval:.5in'>
    <!--StartFragment--><span lang=EN style='font-size:12.0pt;font-family:
    "Arial",sans-serif;mso-fareast-font-family:"Times New Roman";mso-ansi-language:
    EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA'>abc</span><!--EndFragment-->
    </body>

    </html>
    TAxelFCg��K��
    """
    expectedHTML = """<div><!--block-->abc</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses incorrectly nested list html", ->
    html = """<ul><li>a</li><ul><li>b</li><ol><li>1</li><li>2</li><ol></ul></ul>"""
    expectedHTML = """<ul><li><!--block-->a<ul><li><!--block-->b<ol><li><!--block-->1</li><li><!--block-->2</li></ol></li></ul></li></ul>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores whitespace between block elements", ->
    html = """<div>a</div> \n <div>b</div>     <article>c</article>  \n\n <section>d</section> """
    expectedHTML = """<div><!--block-->a</div><div><!--block-->b</div><div><!--block-->c</div><div><!--block-->d</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ingores whitespace between nested block elements", ->
    html = """<ul> <li>a</li> \n  <li>b</li>  </ul><div>  <div> \n <blockquote>c</blockquote>\n </div>  \n</div>"""
    expectedHTML = """<ul><li><!--block-->a</li><li><!--block-->b</li></ul><blockquote><!--block-->c</blockquote>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores inline whitespace that can't be displayed", ->
    html = """ a  \n b    <span>c\n</span><span>d  \ne </span> f <span style="white-space: pre">  g\n\n h  </span>"""
    expectedHTML = """<div><!--block-->a b c d e f &nbsp; g<br><br>&nbsp;h &nbsp;</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses significant whitespace in empty inline elements", ->
    html = """a<span style='mso-spacerun:yes'> </span>b<span style='mso-spacerun:yes'>  </span>c"""
    expectedHTML = """<div><!--block-->a b c</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses block elements with leading breakable whitespace", ->
    html = """<blockquote> <span>a</span> <blockquote>\n <strong>b</strong> <pre> <span>c</span></pre></blockquote></blockquote>"""
    expectedHTML = """<blockquote><!--block-->a<blockquote><!--block--><strong>b</strong><pre><!--block--> c</pre></blockquote></blockquote>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses block elements with leading non-breaking whitespace", ->
    html = """<blockquote>&nbsp;<span>a</span></blockquote>"""
    expectedHTML = """<blockquote><!--block-->&nbsp;a</blockquote>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "converts newlines to spaces", ->
    html = "<div>a\nb \nc \n d \n\ne</div><pre>1\n2</pre>"
    expectedHTML = """<div><!--block-->a b c d e</div><pre><!--block-->1\n2</pre>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses entire HTML document", ->
    html = """<html><head><style>.bold {font-weight: bold}</style></head><body><span class="bold">abc</span></body></html>"""
    expectedHTML = """<div><!--block--><strong>abc</strong></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses inline element following block element", ->
    html = """<blockquote>abc</blockquote><strong>123</strong>"""
    expectedHTML = """<blockquote><!--block-->abc</blockquote><div><!--block--><strong>123</strong></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses text nodes following block elements", ->
    html = """<ul><li>a</li></ul>b<blockquote>c</blockquote>d"""
    expectedHTML = """<ul><li><!--block-->a</li></ul><div><!--block-->b</div><blockquote><!--block-->c</blockquote><div><!--block-->d</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses whitespace-only text nodes without a containing block element", ->
    html = """a <strong>b</strong> <em>c</em>"""
    expectedHTML = """<div><!--block-->a <strong>b</strong> <em>c</em></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses spaces around cursor targets", ->
    html = """<div>a #{cursorTargetLeft}<span>b</span>#{cursorTargetRight} c</div>"""
    expectedHTML = """<div><!--block-->a b c</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses spanned text elements that don't have a parser function", ->
    assert.notOk Trix.config.textAttributes.strike.parser
    html = """<del>a <strong>b</strong></del>"""
    expectedHTML = """<div><!--block--><del>a </del><strong><del>b</del></strong></div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "translates tables into plain text", ->
    html = """<table><tr><td>a</td><td>b</td></tr><tr><td>1</td><td><p>2</p></td></tr><table>"""
    expectedHTML = """<div><!--block-->a | b<br>1 | 2</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "translates block element margins to newlines", ->
    html = """<p style="margin: 0 0 1em 0">a</p><p style="margin: 0">b</p><article style="margin: 1em 0 0 0">c</article>"""
    expectedHTML = """<div><!--block-->a<br><br></div><div><!--block-->b</div><div><!--block--><br>c</div>"""
    document = Trix.HTMLParser.parse(html).getDocument()
    assert.documentHTMLEqual document, expectedHTML

  test "skips translating empty block element margins to newlines", ->
    html = """<p style="margin: 0 0 1em 0">a</p><p style="margin: 0 0 1em 0"><span></span></p><p style="margin: 0">b</p>"""
    expectedHTML = """<div><!--block-->a<br><br></div><div><!--block--><br></div><div><!--block-->b</div>"""
    document = Trix.HTMLParser.parse(html).getDocument()
    assert.documentHTMLEqual document, expectedHTML

  test "ignores text nodes in script elements", ->
    html = """<div>a<script>alert("b")</script></div>"""
    expectedHTML = """<div><!--block-->a</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores iframe elements", ->
    html = """<div>a<iframe src="data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk7PC9zY3JpcHQ+">b</iframe></div>"""
    expectedHTML = """<div><!--block-->a</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

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

  test "forbids href attributes with javascript: protocol", ->
    html = """<a href="javascript:alert()">a</a> <a href=" javascript: alert()">b</a> <a href="JavaScript:alert()">c</a>"""
    expectedHTML = """<div><!--block-->a b c</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "ignores attachment elements with malformed JSON", ->
    html = """
    <div>a</div>\
    <div data-trix-attachment data-trix-attributes></div>\
    <div data-trix-attachment="" data-trix-attributes=""></div>\
    <div data-trix-attachment="{&quot;x:}" data-trix-attributes="{&quot;x:}"></div>\
    <div>b</div>
    """
    expectedHTML = """<div><!--block-->a</div><div><!--block--><br></div><div><!--block-->b</div>"""
    assert.documentHTMLEqual Trix.HTMLParser.parse(html).getDocument(), expectedHTML

  test "parses attachment caption from large html string", (done) ->
    html = fixtures["image attachment with edited caption"].html

    for i in [1..30]
      html += fixtures["image attachment"].html

    for n in [1..3]
      attachmentPiece = Trix.HTMLParser.parse(html).getDocument().getAttachmentPieces()[0]
      assert.equal attachmentPiece.getCaption(), "Example"

    done()

  test "parses foreground color when configured", ->
    config =
      foregroundColor: styleProperty: "color"

    withTextAttributeConfig config, ->
      html = """<span style="color: rgb(60, 179, 113);">green</span>"""
      expectedHTML = """<div><!--block--><span style="color: rgb(60, 179, 113);">green</span></div>"""
      document = Trix.HTMLParser.parse(html).getDocument()
      assert.documentHTMLEqual document, expectedHTML

  test "parses background color when configured", ->
    config =
      backgroundColor: styleProperty: "backgroundColor"

    withTextAttributeConfig config, ->
      html = """<span style="background-color: yellow;">on yellow</span>"""
      expectedHTML = """<div><!--block--><span style="background-color: yellow;">on yellow</span></div>"""
      document = Trix.HTMLParser.parse(html).getDocument()
      assert.documentHTMLEqual document, expectedHTML

  test "parses configured foreground color on formatted text", ->
    config =
      foregroundColor: styleProperty: "color"

    withTextAttributeConfig config, ->
      html = """<strong style="color: rgb(60, 179, 113);">GREEN</strong>"""
      expectedHTML = """<div><!--block--><strong style="color: rgb(60, 179, 113);">GREEN</strong></div>"""
      document = Trix.HTMLParser.parse(html).getDocument()
      assert.documentHTMLEqual document, expectedHTML

  test "parses foreground color using configured parser function", ->
    config =
      foregroundColor:
        styleProperty: "color"
        parser: (element) ->
          {color} = element.style
          color if color is "rgb(60, 179, 113)"

    withTextAttributeConfig config, ->
      html = """<span style="color: rgb(60, 179, 113);">green</span><span style="color: yellow;">not yellow</span>"""
      expectedHTML = """<div><!--block--><span style="color: rgb(60, 179, 113);">green</span>not yellow</div>"""
      document = Trix.HTMLParser.parse(html).getDocument()
      assert.documentHTMLEqual document, expectedHTML

withTextAttributeConfig = (config = {}, fn) ->
  {textAttributes} = Trix.config
  originalConfig = {}

  for key, value of config
    originalConfig[key] = textAttributes[key]
    textAttributes[key] = value

  try
    fn()
  finally
    for key, value of originalConfig
      if value
        textAttributes[key] = value
      else
        delete textAttributes[key]

getOrigin = ->
  {protocol, hostname, port} = window.location
  "#{protocol}//#{hostname}#{if port then ":#{port}" else ""}"
