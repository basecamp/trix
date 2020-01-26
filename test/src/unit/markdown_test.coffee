{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.markdown.mdToHtml", ->
  test 'inline code is wrapped with "pre" tags', ->
    assert.equal Trix.markdown.mdToHtml('`Hello!`'), "<pre>Hello!</pre>"

  test 'strikethrough is wrapped with "del" tags', ->
    assert.equal Trix.markdown.mdToHtml('~~Hello!~~'), "<del>Hello!</del>"

testGroup "Trix.markdown.htmlToMd", ->
  test 'pre tags are converted to inline code syntax', ->
    assert.equal Trix.markdown.htmlToMd('<pre>Hello!</pre>'), "`Hello!`"

  test 'del tags are converted to strikethrough syntax', ->
    assert.equal Trix.markdown.htmlToMd('<del>Hello!</del>'), "~~Hello!~~"
