#= require trix/text

module "Trix.Text",
  setup: ->
    @text = new Trix.Text [
      new Trix.Piece("Hello, "),
      new Trix.Piece("rich ", { bold: true, italic: true }),
      new Trix.Piece("text", { italic: true }),
      new Trix.Piece("!")
    ]

test "#getLength", ->
  text = new Trix.Text
  equal text.getLength(), 0, "empty text length is 0"

  text = Trix.Text.textForStringWithAttributes("Hello")
  equal text.getLength(), 5, "single-run text length"

  equal @text.getLength(), 17, "multiple-run text length"

