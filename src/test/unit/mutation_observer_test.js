import { assert, test, testGroup } from "test/test_helper"

import MutationObserver from "trix/observers/mutation_observer"
import { nextFrame } from "../test_helpers/timing_helpers"

let observer = null
let element = null
let summaries = []

const install = function (html) {
  element = document.createElement("div")
  if (html) {
    element.innerHTML = html
  }
  observer = new MutationObserver(element)
  observer.delegate = {
    elementDidMutate(summary) {
      summaries.push(summary)
    },
  }
}

const uninstall = () => {
  observer?.stop()
  observer = null
  element = null
  summaries = []
}

const observerTest = (name, options = {}, callback) => {
  test(name, async () => {
    install(options.html)
    await callback()
    uninstall()
  })
}

testGroup("MutationObserver", () => {
  observerTest("add character", { html: "a" }, async () => {
    element.firstChild.data += "b"
    await nextFrame()

    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textAdded: "b" })
  })

  observerTest("remove character", { html: "ab" }, async () => {
    element.firstChild.data = "a"
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textDeleted: "b" })
  })

  observerTest("replace character", { html: "ab" }, async () => {
    element.firstChild.data = "ac"
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textAdded: "c", textDeleted: "b" })
  })

  observerTest("add <br>", { html: "a" }, async () => {
    element.appendChild(document.createElement("br"))
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textAdded: "\n" })
  })

  observerTest("remove <br>", { html: "a<br>" }, async () => {
    element.removeChild(element.lastChild)
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textDeleted: "\n" })
  })

  observerTest("remove block comment", { html: "<div><!--block-->a</div>" }, async () => {
    element.firstChild.removeChild(element.firstChild.firstChild)
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textDeleted: "\n" })
  })

  observerTest("remove formatted element", { html: "a<strong>b</strong>" }, async () => {
    element.removeChild(element.lastChild)
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textDeleted: "b" })
  })

  observerTest("remove nested formatted elements", { html: "a<strong>b<em>c</em></strong>" }, async () => {
    element.removeChild(element.lastChild)
    await nextFrame()
    assert.equal(summaries.length, 1)
    assert.deepEqual(summaries[0], { textDeleted: "bc" })
  })
})
