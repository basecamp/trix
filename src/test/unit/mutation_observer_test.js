import { assert, defer, test, testGroup } from "test/test_helper"

import MutationObserver from "trix/observers/mutation_observer"

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

const observerTest = (name, options = {}, callback) =>
  test(name, (done) => {
    install(options.html)
    callback(() => {
      uninstall()
      done()
    })
  })

testGroup("MutationObserver", () => {
  observerTest("add character", { html: "a" }, (done) => {
    element.firstChild.data += "b"
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textAdded: "b" })
      done()
    })
  })

  observerTest("remove character", { html: "ab" }, (done) => {
    element.firstChild.data = "a"
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textDeleted: "b" })
      done()
    })
  })

  observerTest("replace character", { html: "ab" }, (done) => {
    element.firstChild.data = "ac"
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textAdded: "c", textDeleted: "b" })
      done()
    })
  })

  observerTest("add <br>", { html: "a" }, (done) => {
    element.appendChild(document.createElement("br"))
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textAdded: "\n" })
      done()
    })
  })

  observerTest("remove <br>", { html: "a<br>" }, (done) => {
    element.removeChild(element.lastChild)
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textDeleted: "\n" })
      done()
    })
  })

  observerTest("remove block comment", { html: "<div><!--block-->a</div>" }, (done) => {
    element.firstChild.removeChild(element.firstChild.firstChild)
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textDeleted: "\n" })
      done()
    })
  })

  observerTest("remove formatted element", { html: "a<strong>b</strong>" }, (done) => {
    element.removeChild(element.lastChild)
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textDeleted: "b" })
      done()
    })
  })

  observerTest("remove nested formatted elements", { html: "a<strong>b<em>c</em></strong>" }, (done) => {
    element.removeChild(element.lastChild)
    defer(() => {
      assert.equal(summaries.length, 1)
      assert.deepEqual(summaries[0], { textDeleted: "bc" })
      done()
    })
  })
})
