import { assert, test, testGroup } from "test/test_helper"
import Hash from "trix/core/collections/hash"

testGroup("Hash", () => {
  test("stores and reads values", () => {
    const hash = new Hash({ a: 1, b: 2 })
    assert.equal(hash.get("a"), 1)
    assert.ok(hash.has("b"))
    assert.notOk(hash.has("c"))
    assert.deepEqual(hash.toObject(), { a: 1, b: 2 })
  })

  test("a __proto__ key does not replace the prototype of the internal store", () => {
    const values = JSON.parse("{\"__proto__\":{\"smuggled\":\"x\"},\"contentType\":\"text/html\"}")
    const hash = new Hash(values)

    assert.equal(hash.get("smuggled"), undefined)
    assert.notOk(hash.has("smuggled"))
    assert.equal(hash.get("contentType"), "text/html")
  })

  test("what Hash reads and what callers inspect agree for a __proto__ key", () => {
    const values = JSON.parse("{\"__proto__\":{\"smuggled\":\"x\"}}")
    const hash = new Hash(values)

    // The bug was an asymmetry: Hash resolved a name that callers inspecting the same
    // data with own-key operations could not see. The two must agree either way.
    assert.equal(hash.has("smuggled"), "smuggled" in hash.toObject())
    assert.equal(hash.get("smuggled"), hash.toObject().smuggled)
  })

  test("objects handed back keep Object.prototype", () => {
    const hash = new Hash(JSON.parse("{\"__proto__\":{\"smuggled\":\"x\"},\"a\":1}"))
    const object = hash.toObject()

    // Embedders call these on getAttributes() output; Object.create(null) would break them.
    assert.ok(typeof object.hasOwnProperty === "function")
    assert.ok(Object.prototype.hasOwnProperty.call(object, "a"))
  })

  test("Object.prototype is never polluted", () => {
    new Hash(JSON.parse("{\"__proto__\":{\"globallySmuggled\":\"x\"}}"))
    assert.equal({}.globallySmuggled, undefined)
  })
})
