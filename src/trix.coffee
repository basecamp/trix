#= require_self
#= require trix/installer

@Trix =
  install: (config) ->
    installer = new Trix.Installer config
    installer.createEditor()
