import { assert, test, testGroup } from "test/test_helper"

import Hash from "trix/core/collections/hash"

testGroup("Hash", () => {
  test("toArray returns flattened key-value pairs", () => {
    assert.deepEqual(new Hash({ a: 1, b: 2 }).toArray(), [ "a", 1, "b", 2 ])
  })
})
