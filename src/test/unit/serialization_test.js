/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { serializeToContentType } from "trix/core/serialization";
import { assert, eachFixture, test, testGroup } from "test/test_helper";

testGroup("serializeToContentType", () => eachFixture(function(name, details) {
  if (details.serializedHTML) {
    return test(name, () => assert.equal(serializeToContentType(details.document, "text/html"), details.serializedHTML));
  }
}));
