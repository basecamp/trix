{assert, test, testGroup} = Trix.TEST_HELPERS

testGroup "Trix.DocumentView", ->
  eachFixture (name, details) ->
    test name, ->
      assert.documentHTMLEqual details.document, details.html
