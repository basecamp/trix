/* eslint-disable
    func-style,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Composition from "trix/models/composition"
import { TestCompositionDelegate } from "test/test_helpers/test_stubs"
import { assert, test, testGroup } from "test/test_helper"

let composition = null
const setup = function() {
  composition = new Composition
  return composition.delegate = new TestCompositionDelegate
}

testGroup("Composition", { setup }, () => test("deleteInDirection respects UTF-16 character boundaries", function() {
  composition.insertString("abc😭")
  composition.deleteInDirection("backward")
  composition.insertString("d")
  return assert.equal(composition.document.toString(), "abcd\n")
}))
