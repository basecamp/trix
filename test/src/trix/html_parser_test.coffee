#= require trix/html_parser
#= require fixtures

module "Trix.HTMLParser"


test "parse", ->
  htmlEqual "Hello world", fixture("plain")
  htmlEqual "<div>Hello world</div>", fixture("plain")

  htmlEqual " Hello  world ", fixture("plain")
  htmlEqual "Hello   world", fixture("plain")
  htmlEqual "\nHello\nworld\n", fixture("plain")
  htmlEqual " \n  Hello \nworld", fixture("plain")

  htmlEqual "<strong>Hello world</strong>", fixture("bold")
  htmlEqual "<span style='font-weight: bold;'>Hello world</span>", fixture("bold")
  htmlEqual "<b>Hello world</b>", fixture("bold")
  htmlEqual "<div><strong>Hello world</strong></div>", fixture("bold")
  htmlEqual "<strong><span>Hello world</span></strong>", fixture("bold")
  htmlEqual "<strong>Hello <span>world</span></strong>", fixture("bold")

  htmlEqual "<em>Hello world</em>", fixture("italic")
  htmlEqual "<span style='font-style: italic;'>Hello world</span>", fixture("italic")

  htmlEqual "Hello, <em><strong>rich </strong>text</em>!", fixture("formatted")
  htmlEqual "Hello, <strong><em>rich </em></strong><em>text</em>!", fixture("formatted")

  htmlEqual "<a href='http://basecamp.com'><strong>Hello</strong> Basecamp</a>", fixture("linkWithFormatting")

  text = Trix.Text.textForStringWithAttributes("a \n b")
  htmlEqual "a <br> b", text


htmlEqual = (html, text) ->
  parsedText = Trix.HTMLParser.parse(html).getText()
  QUnit.push parsedText.isEqualTo(text), parsedText.inspect(), text.inspect(), "parsed text is equal"
