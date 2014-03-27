#= require_self
#= require trix/installer

@Trix =
  install: (config) ->
    new Trix.Installer config
