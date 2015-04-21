module "Trix.DocumentView"

eachFixture (name, details) ->
  test name, ->
    expectHTML details.document, details.html
