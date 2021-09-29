/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, eachFixture, test, testGroup } from "test/test_helper";

testGroup("DocumentView", () => eachFixture((name, details) => test(name, () => assert.documentHTMLEqual(details.document, details.html))));
