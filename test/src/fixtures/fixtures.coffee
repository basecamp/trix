createDocument = (parts...) ->
  blocks = for part in parts
    [string, textAttributes, blockAttributes] = part
    text = Trix.Text.textForStringWithAttributes(string, textAttributes)
    new Trix.Block text, blockAttributes
  new Trix.Document blocks

@fixtures =
  "bold text":
    document: createDocument(["abc", bold: true])
    html: "<div><strong>abc</strong></div>"

  "bold, italic text":
    document: createDocument(["abc", bold: true, italic: true])
    html: "<div><strong><em>abc</em></strong></div>"

  "text with newline":
    document: createDocument(["ab\nc"])
    html: "<div>ab<br>c</div>"

  "text with link":
    document: createDocument(["abc", href: "http://example.com"])
    html: """<div><a href="http://example.com">abc</a></div>"""

  "text with link and formatting":
    document: createDocument(["abc", italic: true, href: "http://example.com"])
    html: """<div><a href="http://example.com"><em>abc</em></a></div>"""

  "partially formatted link":
    document: new Trix.Document [
      new Trix.Block new Trix.Text [
          new Trix.StringPiece "ab", href: "http://example.com"
          new Trix.StringPiece "c", href: "http://example.com", italic: true
        ]
      ]
    html: """<div><a href="http://example.com">ab<em>c</em></a></div>"""

  "quote formatted block":
    document: createDocument(["abc", {}, ["quote"]])
    html: "<blockquote>abc</blockquote>"

  "code formatted block":
    document: createDocument(["123", {}, ["code"]])
    html: "<pre>123</pre>"

  "code with newline":
    document: createDocument(["12\n3", {}, ["code"]])
    html: "<pre>12\n3</pre>"

  "unordered list with one item":
    document: createDocument(["a", {}, ["bullet"]])
    html: "<ul><li>a</li></ul>"

  "unordered list with  bold text":
    document: createDocument(["a", { bold: true }, ["bullet"]])
    html: "<ul><li><strong>a</strong></li></ul>"

  "unordered list with two items":
    document: createDocument(["a", {}, ["bullet"]], ["b", {}, ["bullet"]])
    html: "<ul><li>a</li><li>b</li></ul>"

  "unordered list surrounded by unformatted blocks":
    document: createDocument(["a"], ["b", {}, ["bullet"]], ["c"])
    html: "<div>a</div><ul><li>b</li></ul><div>c</div>"

  "ordered list":
    document: createDocument(["a", {}, ["number"]])
    html: "<ol><li>a</li></ol>"

  "ordered list and an unordered list":
    document: createDocument(["a", {}, ["bullet"]], ["b", {}, ["number"]])
    html: "<ul><li>a</li></ul><ol><li>b</li></ol>"

  "empty block with attributes":
    document: createDocument(["", {}, ["quote"]])
    html: "<blockquote><br></blockquote>"

  "image attachment": do ->
    imageData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="
    attrs = url: imageData, filename: "example.png", filesize: 123, contentType: "image/png"
    attachment = new Trix.Attachment attrs
    text = Trix.Text.textForAttachmentWithAttributes(attachment, width: 10, height: 20)

    image = Trix.DOM.makeElement("img", src: attrs.url, width: 10, height: 20)

    figure = Trix.DOM.makeElement
      tagName: "figure"
      className: "attachment image"
      editable: false
      data:
        trixAttachment: JSON.stringify(attachment)
        trixId: attachment.id

    figure.appendChild(image)

    html: "<div>#{figure.outerHTML}</div>"
    document: new Trix.Document [new Trix.Block text]

  "file attachment": do ->
    attrs = url: "http://example.com/example.pdf", filename: "example.pdf", filesize: "345", contentType: "application/pdf"
    attachment = new Trix.Attachment attrs
    text = Trix.Text.textForAttachmentWithAttributes(attachment)

    figure = Trix.DOM.makeElement
      tagName: "figure"
      className: "attachment file pdf"
      editable: false
      data:
        trixAttachment: JSON.stringify(attachment)
        trixId: attachment.id

    caption = """<figcaption>#{attrs.filename}<span class="size">#{attrs.filesize}</span></figcaption>"""
    figure.innerHTML = caption

    html: """<div><a href="#{attrs.url}">#{figure.outerHTML}</a></div>"""
    document: new Trix.Document [new Trix.Block text]

  "nested quote and code formatted block":
    document: createDocument(["ab3", {}, ["quote", "code"]])
    html: "<blockquote><pre>ab3</pre></blockquote>"

  "nested code and quote formatted block":
    document: createDocument(["ab3", {}, ["code", "quote"]])
    html: "<pre><blockquote>ab3</blockquote></pre>"

  "nested quote and list":
    document: createDocument(["ab3", {}, ["quote", "bullet"]])
    html: "<blockquote><ul><li>ab3</li></ul></blockquote>"

  "nested quote and list with two items":
    document: createDocument(["a", {}, ["quote", "bullet"]], ["b", {}, ["quote", "bullet"]])
    html: "<blockquote><ul><li>a</li><li>b</li></ul></blockquote>"

  "nested unordered lists":
    document: createDocument(["a", {}, ["bullet"]], ["b", {}, ["bullet", "bullet"]], ["c", {}, ["bullet", "bullet"]])
    html: "<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>"

  "nested lists":
    document: createDocument(["a", {}, ["number"]], ["b", {}, ["number", "bullet"]], ["c", {}, ["number", "bullet"]])
    html: "<ol><li>a<ul><li>b</li><li>c</li></ul></li></ol>"

@eachFixture = (callback) ->
  for name, details of @fixtures
    callback(name, details)
