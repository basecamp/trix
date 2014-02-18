#= require_self
#= require rich_text/text
#= require rich_text/renderer
#= require rich_text/controller

@RichText =
  install: (element) ->
    new RichText.Controller element
