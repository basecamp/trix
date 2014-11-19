module "Trix.HTMLParser"

eachFixture (name, {html}) ->
  test name, ->
    expectHTML Trix.HTMLParser.parse(html).getDocument(), html
