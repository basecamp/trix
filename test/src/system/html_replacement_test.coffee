{assert, clickToolbarButton, collapseSelection, defer, moveCursor, selectNode, typeCharacters, test, testGroup, triggerEvent} = Trix.TestHelpers

testGroup "HTML replacement", ->
  testGroup "deleting with command+backspace", template: "editor_empty", ->
    test "from the end of a line", (expectDocument) ->
      getEditor().loadHTML("<div>a</div><blockquote>b</blockquote><div>c</div>")
      getSelectionManager().setLocationRange(index: 1, offset: 1)
      pressCommandBackspace replaceText: "b", ->
        assert.locationRange(index: 1, offset: 0)
        assert.blockAttributes [0, 2], []
        assert.blockAttributes [2, 3], ["quote"]
        assert.blockAttributes [3, 5], []
        expectDocument("a\n\nc\n")

    test "in the first block", (expectDocument) ->
      getEditor().loadHTML("<div>a</div><blockquote>b</blockquote>")
      getSelectionManager().setLocationRange(index: 0, offset: 1)
      pressCommandBackspace replaceText: "a", ->
        assert.locationRange(index: 0, offset: 0)
        assert.blockAttributes [0, 1], []
        assert.blockAttributes [1, 3], ["quote"]
        expectDocument("\nb\n")

    test "from the middle of a line", (expectDocument) ->
      getEditor().loadHTML("<div>a</div><blockquote>bc</blockquote><div>d</div>")
      getSelectionManager().setLocationRange(index: 1, offset: 1)
      pressCommandBackspace replaceText: "b", ->
        assert.locationRange(index: 1, offset: 0)
        assert.blockAttributes [0, 2], []
        assert.blockAttributes [2, 4], ["quote"]
        assert.blockAttributes [4, 6], []
        expectDocument("a\nc\nd\n")

    test "from the middle of a line in a multi-line block", (expectDocument) ->
      getEditor().loadHTML("<div>a</div><blockquote>bc<br>d</blockquote><div>e</div>")
      getSelectionManager().setLocationRange(index: 1, offset: 1)
      pressCommandBackspace replaceText: "b", ->
        assert.locationRange(index: 1, offset: 0)
        assert.blockAttributes([0, 2], [])
        assert.blockAttributes([2, 6], ["quote"])
        expectDocument("a\nc\nd\ne\n")

    test "from the end of a list item", (expectDocument) ->
      getEditor().loadHTML("<ul><li>a</li><li>b</li></ul>")
      getSelectionManager().setLocationRange(index: 1, offset: 1)
      pressCommandBackspace replaceText: "b", ->
        assert.locationRange(index: 1, offset: 0)
        assert.blockAttributes([0, 2], ["bulletList", "bullet"])
        assert.blockAttributes([2, 4], ["bulletList", "bullet"])
        expectDocument("a\n\n")

    test "a character that is its text node's only data", (expectDocument) ->
      getEditor().loadHTML("<div>a<br>b<br><strong>c</strong></div>")
      getSelectionManager().setLocationRange(index: 0, offset: 3)
      pressCommandBackspace replaceText: "b", ->
        assert.locationRange(index: 0, offset: 2)
        expectDocument("a\n\nc\n")

pressCommandBackspace = ({replaceText}, callback) ->
  triggerEvent(document.activeElement, "keydown", charCode: 0, keyCode: 8, which: 8, metaKey: true)

  range = rangy.getSelection().getRangeAt(0)
  range.findText(replaceText, direction: "backward")
  range.splitBoundaries()

  node = range.getNodes()[0]
  {previousSibling, nextSibling, parentNode} = node

  if previousSibling?.nodeType is Node.COMMENT_NODE
    parentNode.removeChild(previousSibling)

  node.data = ""
  parentNode.removeChild(node)

  unless parentNode.hasChildNodes()
    parentNode.appendChild(document.createElement("br"))

  range.collapseBefore(nextSibling ? parentNode.firstChild)
  range.select()

  requestAnimationFrame(callback)
