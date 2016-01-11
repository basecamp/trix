trix.testGroup "Trix.DocumentView", ->
  eachFixture (name, details) ->
    trix.test name, ->
      expectHTML details.document, details.html
