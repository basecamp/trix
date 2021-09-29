import { serializeToContentType } from "trix/core/serialization"
import { assert, eachFixture, test, testGroup } from "test/test_helper"

testGroup("serializeToContentType", () => {
  eachFixture((name, details) => {
    if (details.serializedHTML) {
      test(name, () => {
        assert.equal(serializeToContentType(details.document, "text/html"), details.serializedHTML)
      })
    }
  })
})
