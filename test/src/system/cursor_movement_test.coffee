trix.testGroup "Cursor movement", template: "editor_empty", ->
  trix.test "move cursor around attachment", (done) ->
    trix.insertFile(trix.createFile())
    trix.assert.locationRange(index: 0, offset: 1)
    trix.moveCursor "left", ->
      trix.assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
      trix.moveCursor "left", ->
        trix.assert.locationRange(index: 0, offset: 0)
        trix.moveCursor "right", ->
          trix.assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
          trix.moveCursor "right", ->
            trix.assert.locationRange(index: 0, offset: 1)
            done()

  trix.test "move cursor around attachment and text", (done) ->
    trix.insertString("a")
    trix.insertFile(trix.createFile())
    trix.insertString("b")
    trix.assert.locationRange(index: 0, offset: 3)
    trix.moveCursor "left", ->
      trix.assert.locationRange(index: 0, offset: 2)
      trix.moveCursor "left", ->
        trix.assert.locationRange({index: 0, offset: 1}, {index: 0, offset: 2})
        trix.moveCursor "left", ->
          trix.assert.locationRange(index: 0, offset: 1)
          trix.moveCursor "left", ->
            trix.assert.locationRange(index: 0, offset: 0)
            done()

  trix.test "expand selection over attachment", (done) ->
    trix.insertFile(trix.createFile())
    trix.assert.locationRange(index: 0, offset: 1)
    trix.expandSelection "left", ->
      trix.assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
      trix.moveCursor "left", ->
        trix.assert.locationRange(index: 0, offset: 0)
        trix.expandSelection "right", ->
          trix.assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
          done()

  trix.test "expand selection over attachment and text", (done) ->
    trix.insertString("a")
    trix.insertFile(trix.createFile())
    trix.insertString("b")
    trix.assert.locationRange(index: 0, offset: 3)
    trix.expandSelection "left", ->
      trix.assert.locationRange({index: 0, offset: 2}, {index: 0, offset: 3})
      trix.expandSelection "left", ->
        trix.assert.locationRange({index: 0, offset: 1}, {index: 0, offset: 3})
        trix.expandSelection "left", ->
          trix.assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 3})
          done()
