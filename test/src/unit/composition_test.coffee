{assert, test, testGroup} = Trix.TestHelpers

composition = null
setup = ->
  composition = new Trix.Composition
  composition.delegate = new Trix.TestCompositionDelegate

testGroup "Trix.Composition", {setup}, ->
  test "deleteInDirection respects UTF-16 character boundaries", ->
    composition.insertString("abc😭")
    composition.deleteInDirection("backward")
    composition.insertString("d")
    assert.equal composition.document.toString(), "abcd\n"
