{classNames} = Trix.config.css

@TEST_IMAGE_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="

createDocument = (parts...) ->
  blocks = for part in parts
    [string, textAttributes, blockAttributes] = part
    text = Trix.Text.textForStringWithAttributes(string, textAttributes)
    new Trix.Block text, blockAttributes
  new Trix.Document blocks

blockComment = "<!--block-->"

cursorTarget = Trix.makeElement(
  tagName: "span"
  textContent: Trix.ZERO_WIDTH_SPACE
  data: trixCursorTarget: true, trixSerialize: false
).outerHTML

removeWhitespace = (string) ->
  string.replace(/\s/g, "")

@fixtures =
  "bold text":
    document: createDocument(["abc", bold: true])
    html: "<div>#{blockComment}<strong>abc</strong></div>"
    serializedHTML: "<div><strong>abc</strong></div>"

  "bold, italic text":
    document: createDocument(["abc", bold: true, italic: true])
    html: "<div>#{blockComment}<strong><em>abc</em></strong></div>"

  "text with newline":
    document: createDocument(["ab\nc"])
    html: "<div>#{blockComment}ab<br>c</div>"

  "text with link":
    document: createDocument(["abc", href: "http://example.com"])
    html: """<div>#{blockComment}<a href="http://example.com">abc</a></div>"""

  "text with link and formatting":
    document: createDocument(["abc", italic: true, href: "http://example.com"])
    html: """<div>#{blockComment}<a href="http://example.com"><em>abc</em></a></div>"""

  "partially formatted link":
    document: new Trix.Document [
      new Trix.Block new Trix.Text [
          new Trix.StringPiece "ab", href: "http://example.com"
          new Trix.StringPiece "c", href: "http://example.com", italic: true
        ]
      ]
    html: """<div>#{blockComment}<a href="http://example.com">ab<em>c</em></a></div>"""

  "spaces 1":
    document: createDocument([" a"])
    html: """<div>#{blockComment}&nbsp;a</div>"""

  "spaces 2":
    document: createDocument(["  a"])
    html: """<div>#{blockComment}&nbsp; a</div>"""

  "spaces 3":
    document: createDocument(["   a"])
    html: """<div>#{blockComment}&nbsp; &nbsp;a</div>"""

  "spaces 4":
    document: createDocument([" a "])
    html: """<div>#{blockComment}&nbsp;a&nbsp;</div>"""

  "spaces 5":
    document: createDocument(["a  b"])
    html: """<div>#{blockComment}a&nbsp; b</div>"""

  "spaces 6":
    document: createDocument(["a   b"])
    html: """<div>#{blockComment}a &nbsp; b</div>"""

  "spaces 7":
    document: createDocument(["a    b"])
    html: """<div>#{blockComment}a&nbsp; &nbsp; b</div>"""

  "spaces 8":
    document: createDocument(["a b "])
    html: """<div>#{blockComment}a b&nbsp;</div>"""

  "spaces 9":
    document: createDocument(["a b c"])
    html: """<div>#{blockComment}a b c</div>"""

  "spaces 10":
    document: createDocument(["a "])
    html: """<div>#{blockComment}a&nbsp;</div>"""

  "spaces 11":
    document: createDocument(["a  "])
    html: """<div>#{blockComment}a &nbsp;</div>"""

  "quote formatted block":
    document: createDocument(["abc", {}, ["quote"]])
    html: "<blockquote>#{blockComment}abc</blockquote>"

  "code formatted block":
    document: createDocument(["123", {}, ["code"]])
    html: "<pre>#{blockComment}123</pre>"

  "code with newline":
    document: createDocument(["12\n3", {}, ["code"]])
    html: "<pre>#{blockComment}12\n3</pre>"

  "multiple blocks with block comments in their text":
    document: createDocument(["a#{blockComment}b", {}, ["quote"]], ["#{blockComment}c", {}, ["code"]])
    html: "<blockquote>#{blockComment}a&lt;!--block--&gt;b</blockquote><pre>#{blockComment}&lt;!--block--&gt;c</pre>"
    serializedHTML: "<blockquote>a&lt;!--block--&gt;b</blockquote><pre>&lt;!--block--&gt;c</pre>"

  "unordered list with one item":
    document: createDocument(["a", {}, ["bulletList", "bullet"]])
    html: "<ul><li>#{blockComment}a</li></ul>"

  "unordered list with bold text":
    document: createDocument(["a", { bold: true }, ["bulletList", "bullet"]])
    html: "<ul><li>#{blockComment}<strong>a</strong></li></ul>"

  "unordered list with partially formatted text":
    document: new Trix.Document [
        new Trix.Block(
          new Trix.Text([
            new Trix.StringPiece("a")
            new Trix.StringPiece("b", italic: true)
          ]),
          ["bulletList", "bullet"]
        )
      ]
    html: "<ul><li>#{blockComment}a<em>b</em></li></ul>"

  "unordered list with two items":
    document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["bulletList", "bullet"]])
    html: "<ul><li>#{blockComment}a</li><li>#{blockComment}b</li></ul>"

  "unordered list surrounded by unformatted blocks":
    document: createDocument(["a"], ["b", {}, ["bulletList", "bullet"]], ["c"])
    html: "<div>#{blockComment}a</div><ul><li>#{blockComment}b</li></ul><div>#{blockComment}c</div>"

  "ordered list":
    document: createDocument(["a", {}, ["numberList", "number"]])
    html: "<ol><li>#{blockComment}a</li></ol>"

  "ordered list and an unordered list":
    document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["numberList", "number"]])
    html: "<ul><li>#{blockComment}a</li></ul><ol><li>#{blockComment}b</li></ol>"

  "empty block with attributes":
    document: createDocument(["", {}, ["quote"]])
    html: "<blockquote>#{blockComment}<br></blockquote>"

  "image attachment": do ->
    attrs = url: TEST_IMAGE_URL, filename: "example.png", filesize: 98203, contentType: "image/png", width: 1, height: 1
    attachment = new Trix.Attachment attrs
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    key = attachment.getCacheKey("imageElement")
    image = Trix.makeElement("img", src: attrs.url, "data-trix-mutable": true, "data-trix-store-key": key, width: 1, height: 1)

    caption = Trix.makeElement(tagName: "figcaption", className: classNames.attachment.caption)
    caption.innerHTML = """#{attrs.filename} <span class="#{classNames.attachment.size}">95.9 KB</span>"""

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment attachment-preview png"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixContentType: "image/png"
      trixId: attachment.id

    figure.dataset[key] = value for key, value of data
    figure.setAttribute("contenteditable", false)
    figure.appendChild(image)
    figure.appendChild(caption)

    serializedFigure = figure.cloneNode(true)
    for attribute in ["data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable"]
      serializedFigure.removeAttribute(attribute)
      for element in serializedFigure.querySelectorAll("[#{attribute}]")
        element.removeAttribute(attribute)

    html: "<div>#{blockComment}#{cursorTarget}#{figure.outerHTML}#{cursorTarget}</div>"
    serializedHTML: "<div>#{serializedFigure.outerHTML}</div>"
    document: new Trix.Document [new Trix.Block text]

  "text with newlines and image attachment": do ->
    stringText = Trix.Text.textForStringWithAttributes("a\nb")

    attrs = url: TEST_IMAGE_URL, filename: "example.png", filesize: 98203, contentType: "image/png", width: 1, height: 1
    attachment = new Trix.Attachment attrs
    attachmentText = Trix.Text.textForAttachmentWithAttributes(attachment)

    key = attachment.getCacheKey("imageElement")
    image = Trix.makeElement("img", src: attrs.url, "data-trix-mutable": true, "data-trix-store-key": key, width: 1, height: 1)

    caption = Trix.makeElement(tagName: "figcaption", className: classNames.attachment.caption)
    caption.innerHTML = """#{attrs.filename} <span class="#{classNames.attachment.size}">95.9 KB</span>"""

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment attachment-preview png"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixContentType: "image/png"
      trixId: attachment.id

    figure.dataset[key] = value for key, value of data
    figure.setAttribute("contenteditable", false)
    figure.appendChild(image)
    figure.appendChild(caption)

    serializedFigure = figure.cloneNode(true)
    for attribute in ["data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable"]
      serializedFigure.removeAttribute(attribute)
      for element in serializedFigure.querySelectorAll("[#{attribute}]")
        element.removeAttribute(attribute)

    text = stringText.appendText(attachmentText)

    html: "<div>#{blockComment}a<br>b#{cursorTarget}#{figure.outerHTML}#{cursorTarget}</div>"
    serializedHTML: "<div>a<br>b#{serializedFigure.outerHTML}</div>"
    document: new Trix.Document [new Trix.Block text]

  "image attachment with edited caption": do ->
    attrs = url: TEST_IMAGE_URL, filename: "example.png", filesize: 123, contentType: "image/png", width: 1, height: 1
    attachment = new Trix.Attachment attrs
    textAttrs = caption: "Example"
    text = Trix.Text.textForAttachmentWithAttributes(attachment, textAttrs)

    key = attachment.getCacheKey("imageElement")
    image = Trix.makeElement("img", src: attrs.url, "data-trix-mutable": true, "data-trix-store-key": key, width: 1, height: 1)

    caption = Trix.makeElement(tagName: "figcaption", className: "#{classNames.attachment.caption} #{classNames.attachment.captionEdited}", textContent: "Example")

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment attachment-preview png"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixContentType: "image/png"
      trixId: attachment.id
      trixAttributes: JSON.stringify(textAttrs)

    figure.dataset[key] = value for key, value of data
    figure.setAttribute("contenteditable", false)
    figure.appendChild(image)
    figure.appendChild(caption)

    html: "<div>#{blockComment}#{cursorTarget}#{figure.outerHTML}#{cursorTarget}</div>"
    document: new Trix.Document [new Trix.Block text]

  "file attachment": do ->
    attrs = href: "http://example.com/example.pdf", filename: "example.pdf", filesize: 34038769, contentType: "application/pdf"
    attachment = new Trix.Attachment attrs
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment attachment-file pdf"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixContentType: "application/pdf"
      trixId: attachment.id

    link = Trix.makeElement("a", href: attrs.href)
    link.dataset[key] = value for key, value of data
    link.setAttribute("contenteditable", false)
    link.appendChild(figure)

    caption = """<figcaption class="#{classNames.attachment.caption}">#{attrs.filename} <span class="#{classNames.attachment.size}">32.46 MB</span></figcaption>"""
    figure.innerHTML = caption

    html: """<div>#{blockComment}#{cursorTarget}#{link.outerHTML}#{cursorTarget}</div>"""
    document: new Trix.Document [new Trix.Block text]

  "content attachment": do ->
    content = """<blockquote class="twitter-tweet" data-cards="hidden"><p>ruby-build 20150413 is out, with definitions for 2.2.2, 2.1.6, and 2.0.0-p645 to address recent security issues: <a href="https://t.co/YEwV6NtRD8">https://t.co/YEwV6NtRD8</a></p>&mdash; Sam Stephenson (@sstephenson) <a href="https://twitter.com/sstephenson/status/587715996783218688">April 13, 2015</a></blockquote>"""
    href = "https://twitter.com/sstephenson/status/587715996783218688"
    contentType = "embed/twitter"

    attachment = new Trix.Attachment {content, contentType, href}
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment attachment-content"

    figure.innerHTML = content

    caption = Trix.makeElement(tagName: "figcaption", className: classNames.attachment.caption)
    figure.appendChild(caption)

    data =
      trixAttachment: JSON.stringify(attachment)
      trixContentType: contentType
      trixId: attachment.id

    figure.dataset[key] = value for key, value of data
    figure.setAttribute("contenteditable", false)

    html: """<div>#{blockComment}#{cursorTarget}#{figure.outerHTML}#{cursorTarget}</div>"""
    document: new Trix.Document [new Trix.Block text]

  "nested quote and code formatted block":
    document: createDocument(["ab3", {}, ["quote", "code"]])
    html: "<blockquote><pre>#{blockComment}ab3</pre></blockquote>"

  "nested code and quote formatted block":
    document: createDocument(["ab3", {}, ["code", "quote"]])
    html: "<pre><blockquote>#{blockComment}ab3</blockquote></pre>"

  "nested code blocks in quote":
    document: createDocument(
      ["a\n", {}, ["quote"]],
      ["b", {}, ["quote", "code"]],
      ["\nc\n", {}, ["quote"]],
      ["d", {}, ["quote", "code"]]
    )
    html: removeWhitespace """
      <blockquote>
        #{blockComment}
        a
        <br>
        <br>
        <pre>
          #{blockComment}
          b
        </pre>
        #{blockComment}
        <br>
        c
        <br>
        <br>
        <pre>
          #{blockComment}
          d
        </pre>
      </blockquote>
    """
    serializedHTML: removeWhitespace """
      <blockquote>
        a
        <br>
        <br>
        <pre>
          b
        </pre>
        <br>
        c
        <br>
        <br>
        <pre>
          d
        </pre>
      </blockquote>
    """

  "nested code, quote, and list in quote":
    document: createDocument(
      ["a\n", {}, ["quote"]],
      ["b", {}, ["quote", "code"]],
      ["\nc\n", {}, ["quote"]],
      ["d", {}, ["quote", "quote"]],
      ["\ne\n", {}, ["quote"]],
      ["f", {}, ["quote", "bulletList", "bullet"]]
    )
    html: removeWhitespace """
     <blockquote>
      #{blockComment}
      a
      <br>
      <br>
      <pre>
        #{blockComment}
        b
      </pre>
      #{blockComment}
      <br>
      c
      <br>
      <br>
      <blockquote>
        #{blockComment}
        d
      </blockquote>
      #{blockComment}
      <br>
      e
      <br>
      <br>
      <ul>
        <li>
          #{blockComment}
          f
        </li>
      </ul>
    </blockquote>
    """
    serializedHTML: removeWhitespace """
      <blockquote>
        a
        <br>
        <br>
        <pre>
          b
        </pre>
        <br>
        c
        <br>
        <br>
        <blockquote>
          d
        </blockquote>
        <br>
        e
        <br>
        <br>
        <ul>
          <li>
            f
          </li>
        </ul>
      </blockquote>
    """

  "nested quote and list":
    document: createDocument(["ab3", {}, ["quote", "bulletList", "bullet"]])
    html: "<blockquote><ul><li>#{blockComment}ab3</li></ul></blockquote>"

  "nested list and quote":
    document: createDocument(["ab3", {}, ["bulletList", "bullet", "quote"]])
    html: "<ul><li><blockquote>#{blockComment}ab3</blockquote></li></ul>"

  "nested lists and quotes":
    document: createDocument(["a", {}, ["bulletList", "bullet", "quote"]], ["b", {}, ["bulletList", "bullet", "quote"]])
    html: "<ul><li><blockquote>#{blockComment}a</blockquote></li><li><blockquote>#{blockComment}b</blockquote></li></ul>"

  "nested quote and list with two items":
    document: createDocument(["a", {}, ["quote", "bulletList", "bullet"]], ["b", {}, ["quote", "bulletList", "bullet"]])
    html: "<blockquote><ul><li>#{blockComment}a</li><li>#{blockComment}b</li></ul></blockquote>"

  "nested unordered lists":
    document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["bulletList", "bullet", "bulletList", "bullet"]], ["c", {}, ["bulletList", "bullet", "bulletList", "bullet"]])
    html: "<ul><li>#{blockComment}a<ul><li>#{blockComment}b</li><li>#{blockComment}c</li></ul></li></ul>"

  "nested lists":
    document: createDocument(["a", {}, ["numberList", "number"]], ["b", {}, ["numberList", "number", "bulletList", "bullet"]], ["c", {}, ["numberList", "number", "bulletList", "bullet"]])
    html: "<ol><li>#{blockComment}a<ul><li>#{blockComment}b</li><li>#{blockComment}c</li></ul></li></ol>"

  "blocks beginning with newlines":
    document: createDocument(["\na", {}, ["quote"]], ["\nb", {}, []], ["\nc", {}, ["quote"]])
    html: "<blockquote>#{blockComment}<br>a</blockquote><div>#{blockComment}<br>b</div><blockquote>#{blockComment}<br>c</blockquote>"

  "blocks beginning with formatted text":
    document: createDocument(["a", { bold: true }, ["quote"]], ["b", { italic: true }, []], ["c", { bold: true }, ["quote"]])
    html: "<blockquote>#{blockComment}<strong>a</strong></blockquote><div>#{blockComment}<em>b</em></div><blockquote>#{blockComment}<strong>c</strong></blockquote>"

  "text with newlines before block":
    document: createDocument(["a\nb"], ["c", {}, ["quote"]])
    html: "<div>#{blockComment}a<br>b</div><blockquote>#{blockComment}c</blockquote>"

@eachFixture = (callback) ->
  for name, details of @fixtures
    callback(name, details)
