import { assert, test, testGroup } from "test/test_helper"

import Composition from "trix/models/composition"
import { TestCompositionDelegate } from "test/test_helpers/test_stubs"
import * as config from "trix/config"

let composition = null
const setup = () => {
  composition = new Composition()
  composition.delegate = new TestCompositionDelegate()
}

testGroup("Composition", { setup }, () => {
  test("deleteInDirection respects UTF-16 character boundaries", () => {
    composition.insertString("abc😭")
    composition.deleteInDirection("backward")
    composition.insertString("d")
    assert.equal(composition.document.toString(), "abcd\n")
  })

  test("insertHTML sanitizes for XML even when the config turns it off", () => {
    withSafeForXML(false, () => composition.insertHTML("<a href=\"https://example.com/#-->\">link</a>"))

    const [ piece ] = composition.document.getPieces()
    assert.equal(piece.toString(), "link")
    assert.notOk(piece.getAttribute("href"), "SAFE_FOR_XML drops an attribute whose value carries -->")
  })
})

const withSafeForXML = (value, fn) => {
  const original = config.dompurify.SAFE_FOR_XML
  config.dompurify.SAFE_FOR_XML = value
  try {
    fn()
  } finally {
    config.dompurify.SAFE_FOR_XML = original
  }
}
