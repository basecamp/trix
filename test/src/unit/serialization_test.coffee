trix.testGroup "Trix.serializeToContentType", ->
  eachFixture (name, details) ->
    if details.serializedHTML
      trix.test name, ->
        trix.assert.equal Trix.serializeToContentType(details.document, "text/html"), details.serializedHTML
