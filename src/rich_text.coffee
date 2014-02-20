#= require_self
#= require rich_text/controller

@RichText =
  install: (element) ->
    new RichText.Controller element
