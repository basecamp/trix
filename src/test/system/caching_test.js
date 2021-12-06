/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, clickToolbarButton, moveCursor, test, testGroup, typeCharacters } from "test/test_helper"

testGroup("View caching", { template: "editor_empty" }, function() {
  test("reparsing and rendering identical texts", done => typeCharacters("a\nb\na", () => moveCursor({ direction: "left", times: 2 }, () => clickToolbarButton({ attribute: "quote" }, function() {
    const html = getEditorElement().innerHTML
    getEditorController().reparse()
    getEditorController().render()
    assert.equal(getEditorElement().innerHTML, html)
    return done()
  }))))

  return test("reparsing and rendering identical blocks", done => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a\na", function() {
    const html = getEditorElement().innerHTML
    getEditorController().reparse()
    getEditorController().render()
    assert.equal(getEditorElement().innerHTML, html)
    return done()
  })))
})
