import config from "trix/config"

allAttributeNames = null
blockAttributeNames = null
textAttributeNames = null
listAttributeNames = null

export getAllAttributeNames = ->
  allAttributeNames ?= getTextAttributeNames().concat getBlockAttributeNames()

export getBlockConfig = (attributeName) ->
  config.blockAttributes[attributeName]

export getBlockAttributeNames = ->
  blockAttributeNames ?= Object.keys(config.blockAttributes)

export getTextConfig = (attributeName) ->
  config.textAttributes[attributeName]

export getTextAttributeNames = ->
  textAttributeNames ?= Object.keys(config.textAttributes)

export getListAttributeNames = ->
  listAttributeNames ?= (listAttribute for key, {listAttribute} of config.blockAttributes when listAttribute?)
