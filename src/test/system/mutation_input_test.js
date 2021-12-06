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
import config from "trix/config"

import { TEST_IMAGE_URL, assert, clickToolbarButton, defer, insertNode, isToolbarButtonActive, testGroup, testIf, triggerEvent, typeCharacters } from "test/test_helper"

const test = function() {
  return testIf(config.input.getLevel() === 0, ...arguments)
}

testGroup("Mutation input", { template: "editor_empty" }, function() {
  test("deleting a newline", function(expectDocument) {
    const element = getEditorElement()
    element.editor.insertString("a\n\nb")

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    const br = element.querySelectorAll("br")[1]
    br.parentNode.removeChild(br)
    return requestAnimationFrame(() => expectDocument("a\nb\n"))
  })

  test("typing a space in formatted text at the end of a block", function(expectDocument) {
    const element = getEditorElement()

    return clickToolbarButton({ attribute: "bold" }, () => typeCharacters("a", function() {
      // Press space key
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 32, which: 32 })
      triggerEvent(element, "keypress", { charCode: 32, keyCode: 32, which: 32 })

      const boldElement = element.querySelector("strong")
      boldElement.appendChild(document.createTextNode(" "))
      boldElement.appendChild(document.createElement("br"))

      return requestAnimationFrame(function() {
        assert.ok(isToolbarButtonActive({ attribute: "bold" }))
        assert.textAttributes([ 0, 2 ], { bold: true })
        return expectDocument("a \n")
      })
    }))
  })

  test("typing formatted text after a newline at the end of block", function(expectDocument) {
    const element = getEditorElement()
    element.editor.insertHTML("<ul><li>a</li><li><br></li></ul>")
    element.editor.setSelectedRange(3)

    return clickToolbarButton({ attribute: "bold" }, function() {
      // Press B key
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 66, which: 66 })
      triggerEvent(element, "keypress", { charCode: 98, keyCode: 98, which: 98 })

      const node = document.createTextNode("b")
      const extraBR = element.querySelectorAll("br")[1]
      extraBR.parentNode.insertBefore(node, extraBR)
      extraBR.parentNode.removeChild(extraBR)

      return requestAnimationFrame(function() {
        assert.ok(isToolbarButtonActive({ attribute: "bold" }))
        assert.textAttributes([ 0, 1 ], {})
        assert.textAttributes([ 3, 4 ], { bold: true })
        return expectDocument("a\n\nb\n")
      })
    })
  })

  test("typing an emoji after a newline at the end of block", function(expectDocument) {
    const element = getEditorElement()

    return typeCharacters("\n", function() {
      // Tap 👏🏻 on iOS
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 0, which: 0, key: "👏🏻" })
      triggerEvent(element, "keypress", { charCode: 128079, keyCode: 128079, which: 128079, key: "👏🏻" })

      const node = document.createTextNode("👏🏻")
      const extraBR = element.querySelectorAll("br")[1]
      extraBR.parentNode.insertBefore(node, extraBR)
      extraBR.parentNode.removeChild(extraBR)

      return requestAnimationFrame(() => expectDocument("\n👏🏻\n"))
    })
  })

  test("backspacing an attachment at the beginning of an otherwise empty document", function(expectDocument) {
    const element = getEditorElement()
    element.editor.loadHTML(`<img src="${TEST_IMAGE_URL}" width="10" height="10">`)

    return requestAnimationFrame(function() {
      element.editor.setSelectedRange([ 0, 1 ])
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 8, which: 8 })

      element.firstElementChild.innerHTML = "<br>"

      return requestAnimationFrame(function() {
        assert.locationRange({ index: 0, offset: 0 })
        return expectDocument("\n")
      })
    })
  })

  test("backspacing a block comment node", function(expectDocument) {
    const element = getEditorElement()
    element.editor.loadHTML("<blockquote>a</blockquote><div>b</div>")
    return defer(function() {
      element.editor.setSelectedRange(2)
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 8, which: 8 })
      const commentNode = element.lastChild.firstChild
      commentNode.parentNode.removeChild(commentNode)
      return defer(function() {
        assert.locationRange({ index: 0, offset: 1 })
        return expectDocument("ab\n")
      })
    })
  })

  return test("typing formatted text with autocapitalization on", function(expectDocument) {
    const element = getEditorElement()

    return clickToolbarButton({ attribute: "bold" }, function() {
      // Type "b", autocapitalize to "B"
      triggerEvent(element, "keydown", { charCode: 0, keyCode: 66, which: 66 })
      triggerEvent(element, "keypress", { charCode: 98, keyCode: 98, which: 98 })
      triggerEvent(element, "textInput", { data: "B" })

      return insertNode(document.createTextNode("B"), function() {
        assert.ok(isToolbarButtonActive({ attribute: "bold" }))
        assert.textAttributes([ 0, 1 ], { bold: true })
        return expectDocument("B\n")
      })
    })
  })
})
