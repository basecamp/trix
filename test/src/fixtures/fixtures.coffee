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

@fixtures =
  "bold text":
    document: createDocument(["abc", bold: true])
    html: "<div>#{blockComment}<strong>abc</strong></div>"

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
    imageData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="
    attrs = url: imageData, filename: "example.png", filesize: "123", contentType: "image/png", width: 1, height: 1
    attachment = Trix.Attachment.attachmentForAttributes(attrs)
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    image = Trix.makeElement("img", src: attrs.url, "data-trix-mutable": true, width: 1, height: 1)

    caption = Trix.makeElement("figcaption")
    caption.innerHTML = """#{attrs.filename}<span class="size">#{attrs.filesize}</span>"""

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment image preview"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixId: attachment.id

    figure.dataset[key] = value for key, value of data
    figure.setAttribute("contenteditable", false)
    figure.appendChild(image)
    figure.appendChild(caption)

    html: "<div>#{blockComment}#{cursorTarget}#{figure.outerHTML}#{cursorTarget}</div>"
    document: new Trix.Document [new Trix.Block text]

  "file attachment": do ->
    attrs = href: "http://example.com/example.pdf", filename: "example.pdf", filesize: "345", contentType: "application/pdf"
    attachment = new Trix.Attachment attrs
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    figure = Trix.makeElement
      tagName: "figure"
      className: "attachment file pdf"

    data =
      trixAttachment: JSON.stringify(attachment)
      trixId: attachment.id

    link = Trix.makeElement("a", href: attrs.href)
    link.dataset[key] = value for key, value of data
    link.setAttribute("contenteditable", false)
    link.appendChild(figure)

    caption = """<figcaption>#{attrs.filename}<span class="size">#{attrs.filesize}</span></figcaption>"""
    figure.innerHTML = caption

    html: """<div>#{blockComment}#{cursorTarget}#{link.outerHTML}#{cursorTarget}</div>"""
    document: new Trix.Document [new Trix.Block text]

  "nested quote and code formatted block":
    document: createDocument(["ab3", {}, ["quote", "code"]])
    html: "<blockquote><pre>#{blockComment}ab3</pre></blockquote>"

  "nested code and quote formatted block":
    document: createDocument(["ab3", {}, ["code", "quote"]])
    html: "<pre><blockquote>#{blockComment}ab3</blockquote></pre>"

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

@eachFixture = (callback) ->
  for name, details of @fixtures
    callback(name, details)
