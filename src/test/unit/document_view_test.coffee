import Trix from "trix/global"

{assert, test, testGroup} = Trix.TestHelpers

testGroup "DocumentView", ->
  eachFixture (name, details) ->
    test name, ->
      assert.documentHTMLEqual details.document, details.html
