trix.testGroup "Trix.DocumentView", ->
  eachFixture (name, details) ->
    trix.test name, ->
      trix.assert.documentHTMLEqual details.document, details.html
