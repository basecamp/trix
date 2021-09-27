import Trix from "trix/global"

import { assert, eachFixture, test, testGroup } from "test/test_helper"

testGroup "Trix.serializeToContentType", ->
  eachFixture (name, details) ->
    if details.serializedHTML
      test name, ->
        assert.equal Trix.serializeToContentType(details.document, "text/html"), details.serializedHTML
