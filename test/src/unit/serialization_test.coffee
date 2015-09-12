module "Trix.serializeToContentType"

eachFixture (name, details) ->
  if details.serializedHTML
    test name, ->
      equal Trix.serializeToContentType(details.document, "text/html"), details.serializedHTML
