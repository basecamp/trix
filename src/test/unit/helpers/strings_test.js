import { assert, test, testGroup } from "test/test_helper"
import { escapeAngleBracketsInJSON } from "trix/core/helpers"

testGroup("Helpers: Strings", () => {
  testGroup("escapeAngleBracketsInJSON", () => {
    test("escapes every angle bracket", () => {
      const json = JSON.stringify({ content: "<style>a</style><!-- b --><![CDATA[c]]>", caption: "<" })
      const escaped = escapeAngleBracketsInJSON(json)

      assert.notOk(/[<>]/.test(escaped), "raw angle brackets left in: " + escaped)
      assert.equal(escaped, "{\"content\":\"\\u003cstyle\\u003ea\\u003c/style\\u003e\\u003c!-- b --\\u003e\\u003c![CDATA[c]]\\u003e\",\"caption\":\"\\u003c\"}")
    })

    test("parses back to the same value", () => {
      const values = [
        { content: "<style>a</style>" },
        { content: "\\<", caption: "\\\\>" },
        { content: "\u003c\u003e", caption: "\\u003c" },
        { content: "<\ud83d\ude00>", caption: "\"<\"" },
        { nested: [ "<", { deeper: [ ">" ] } ], number: 1, flag: true, nothing: null },
      ]

      values.forEach((value) => {
        const json = JSON.stringify(value)
        assert.deepEqual(JSON.parse(escapeAngleBracketsInJSON(json)), value, json)
      })
    })

    test("is idempotent", () => {
      const json = JSON.stringify({ content: "<style>a</style>" })
      const escaped = escapeAngleBracketsInJSON(json)

      assert.equal(escapeAngleBracketsInJSON(escaped), escaped)
    })
  })
})
