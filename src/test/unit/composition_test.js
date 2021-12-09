import { assert, test, testGroup } from "test/test_helper"

import Composition from "trix/models/composition"
import { TestCompositionDelegate } from "test/test_helpers/test_stubs"

let composition = null
const setup = () => {
  composition = new Composition()
  composition.delegate = new TestCompositionDelegate()
}

testGroup("Composition", { setup }, () =>
  test("deleteInDirection respects UTF-16 character boundaries", () => {
    composition.insertString("abc😭")
    composition.deleteInDirection("backward")
    composition.insertString("d")
    assert.equal(composition.document.toString(), "abcd\n")
  })
)
