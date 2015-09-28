#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  name: "document"
  title: "Document"
  events:
    "trix-change": ->
      @render()

  render: ->
    {@document} = @composition
    super
