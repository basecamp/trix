{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.DocumentView", ->
  eachFixture (name, details) ->
    test name, ->
      assert.documentHTMLEqual details.document, details.html
