import { assert, test, testGroup } from "test/test_helper"
import { callDocumentMethod, callDocumentMethodOn, getDocumentProperty } from "trix/core/helpers"

// The test harness itself calls document methods, so the shadowing element is removed
// before any assertion runs.
const withNamedElement = (name, callback) => {
  const element = document.createElement("img")
  element.setAttribute("name", name)
  document.body.appendChild(element)
  try {
    return { shadowed: document[name] === element, result: callback() }
  } finally {
    element.remove()
  }
}

testGroup("Helpers: Document properties", () => {
  test("calls a document method that a named element shadows", () => {
    const { shadowed, result } = withNamedElement("createElement", () => callDocumentMethod("createElement", "div"))

    assert.ok(shadowed)
    assert.equal(result.tagName, "DIV")
    assert.equal(result.ownerDocument, document)
  })

  test("reads a document getter that a named element shadows", () => {
    const { body } = document
    const { shadowed, result } = withNamedElement("body", () => getDocumentProperty("body"))

    assert.ok(shadowed)
    assert.equal(result, body)
  })

  test("reads document properties of another document", () => {
    const doc = document.implementation.createHTMLDocument("")
    const image = doc.createElement("img")
    doc.body.appendChild(image)

    assert.equal(getDocumentProperty("body", doc), doc.body)
    assert.deepEqual(Array.from(callDocumentMethodOn(doc, "querySelectorAll", "img")), [ image ])
  })

  test("returns undefined for a property the document doesn't have", () => {
    const { result } = withNamedElement("trixUnknownProperty", () => getDocumentProperty("trixUnknownProperty"))

    assert.equal(result, undefined)
  })
})
