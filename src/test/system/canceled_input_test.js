import { expectDocument, pressKey, test, testGroup, typeCharacters } from "test/test_helper"

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
  test("ignoring canceled input events in capturing phase", async () => {
    await typeCharacters("a")
    cancelingInCapturingPhase = true
    await pressKey("backspace")
    await pressKey("return")
    cancelingInCapturingPhase = false
    await typeCharacters("b")

    expectDocument("ab\n")
  })

  test("ignoring canceled input events at target", async () => {
    await typeCharacters("a")
    cancelingAtTarget = true
    await pressKey("backspace")
    await pressKey("return")
    cancelingAtTarget = false
    await typeCharacters("b")
    expectDocument("ab\n")
  })
})
