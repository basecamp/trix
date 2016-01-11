composition = null
setup = ->
  composition = new Trix.Composition
  composition.delegate = new Trix.TestCompositionDelegate

trix.testGroup "Trix.Composition", {setup}, ->
  trix.test "deleteInDirection respects UTF-16 character boundaries", ->
    composition.insertString("abc😭")
    composition.deleteInDirection("backward")
    composition.insertString("d")
    trix.assert.equal composition.document.toString(), "abcd\n"
