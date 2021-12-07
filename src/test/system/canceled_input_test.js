import { pressKey, test, testGroup, typeCharacters } from "test/test_helper"

const testOptions = {
  template: "editor_empty",
  setup() {
    let handler
    addEventListener("keydown", cancel, true)
    addEventListener(
      "trix-before-initialize",
      handler = function ({ target }) {
        removeEventListener("trix-before-initialize", handler)
        target.addEventListener("keydown", cancel)
      }
    )
  },
  teardown() {
    removeEventListener("keydown", cancel, true)
  },
}

let cancelingInCapturingPhase = false
let cancelingAtTarget = false

const cancel = (event) => {
  switch (event.eventPhase) {
    case Event.prototype.CAPTURING_PHASE:
      if (cancelingInCapturingPhase) {
        event.preventDefault()
      }
      break
    case Event.prototype.AT_TARGET:
      if (cancelingAtTarget) {
        event.preventDefault()
      }
      break
  }
}

testGroup("Canceled input", testOptions, () => {
  test("ignoring canceled input events in capturing phase", (expectDocument) =>
    typeCharacters("a", () => {
      cancelingInCapturingPhase = true
      pressKey("backspace", () =>
        pressKey("return", () => {
          cancelingInCapturingPhase = false
          typeCharacters("b", () => expectDocument("ab\n"))
        })
      )
    }))

  test("ignoring canceled input events at target", (expectDocument) =>
    typeCharacters("a", () => {
      cancelingAtTarget = true
      pressKey("backspace", () =>
        pressKey("return", () => {
          cancelingAtTarget = false
          typeCharacters("b", () => expectDocument("ab\n"))
        })
      )
    }))
})
