/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { pressKey, test, testGroup, typeCharacters } from "test/test_helper"

const testOptions = {
  template: "editor_empty",
  setup() {
    let handler
    addEventListener("keydown", cancel, true)
    return addEventListener("trix-before-initialize", handler = function({ target }) {
      removeEventListener("trix-before-initialize", handler)
      return target.addEventListener("keydown", cancel)
    }
    )
  },
  teardown() {
    return removeEventListener("keydown", cancel, true)
  }
}

let cancelingInCapturingPhase = false
let cancelingAtTarget = false

var cancel = function(event) {
  switch (event.eventPhase) {
    case Event.prototype.CAPTURING_PHASE:
      if (cancelingInCapturingPhase) { return event.preventDefault() }
      break
    case Event.prototype.AT_TARGET:
      if (cancelingAtTarget) { return event.preventDefault() }
      break
  }
}

testGroup("Canceled input", testOptions, function() {
  test("ignoring canceled input events in capturing phase", expectDocument => typeCharacters("a", function() {
    cancelingInCapturingPhase = true
    return pressKey("backspace", () => pressKey("return", function() {
      cancelingInCapturingPhase = false
      return typeCharacters("b", () => expectDocument("ab\n"))
    }))
  }))

  return test("ignoring canceled input events at target", expectDocument => typeCharacters("a", function() {
    cancelingAtTarget = true
    return pressKey("backspace", () => pressKey("return", function() {
      cancelingAtTarget = false
      return typeCharacters("b", () => expectDocument("ab\n"))
    }))
  }))
})
