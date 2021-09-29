import { assert, eachFixture, test, testGroup } from "test/test_helper"

testGroup("DocumentView", () => {
  eachFixture((name, details) => {
    test(name, () => {
      assert.documentHTMLEqual(details.document, details.html)
    })
  })
})
