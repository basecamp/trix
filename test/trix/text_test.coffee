module "Trix.Text"

test "#getLength", ->
  text = Trix.Text.textForStringWithAttributes("Hello")
  equal text.getLength(), 5
