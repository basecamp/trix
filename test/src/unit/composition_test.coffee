return
composition = null

module "Trix.Composition",
  setup: ->
    composition = new Trix.Composition
    composition.delegate = new Trix.TestCompositionDelegate

test "deleteInDirection respects UTF-16 character boundaries", ->
  composition.insertString("abc😭")
  composition.deleteInDirection("backward")
  composition.insertString("d")
  equal composition.getDocument().toString(), "abcd\n"
