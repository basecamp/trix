#= require trix/models/text

fixtures =
  empty: []

  plain: [
    new Trix.Piece("Hello world")
  ]

  bold: [
    new Trix.Piece("Hello world", bold: true)
  ]

  italic: [
    new Trix.Piece("Hello world", italic: true)
  ]

  formatted: [
    new Trix.Piece("Hello, "),
    new Trix.Piece("rich ", bold: true, italic: true),
    new Trix.Piece("text", italic: true),
    new Trix.Piece("!")
  ]

  linkWithFormatting: [
    new Trix.Piece("Hello", href: "http://basecamp.com", bold: true)
    new Trix.Piece(" Basecamp", href: "http://basecamp.com")
  ]

@fixture = (name) ->
  new Trix.Text fixtures[name]
