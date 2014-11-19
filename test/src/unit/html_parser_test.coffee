module "Trix.HTMLParser"

eachFixture (name, {html}) ->
  test name, ->
    expectHTML Trix.HTMLParser.parse(html).getDocument(), html

asyncTest "sanitizes unsafe html", ->
  window.safeZone = true
  imageData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="
  html = """<img onload="window.safeZone = false;" src="#{imageData}">"""
  Trix.HTMLParser.parse(html)
  after 20, ->
    ok window.safeZone, "onload handler was not sanitized"
    QUnit.start()
