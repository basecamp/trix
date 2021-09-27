import Trix from "trix/global"
import config from "trix/config"

allAttributeNames = null
blockAttributeNames = null
textAttributeNames = null
listAttributeNames = null

Trix.extend
  getAllAttributeNames: ->
    allAttributeNames ?= Trix.getTextAttributeNames().concat Trix.getBlockAttributeNames()

  getBlockConfig: (attributeName) ->
    config.blockAttributes[attributeName]

  getBlockAttributeNames: ->
    blockAttributeNames ?= Object.keys(config.blockAttributes)

  getTextConfig: (attributeName) ->
    config.textAttributes[attributeName]

  getTextAttributeNames: ->
    textAttributeNames ?= Object.keys(config.textAttributes)

  getListAttributeNames: ->
    listAttributeNames ?= (listAttribute for key, {listAttribute} of config.blockAttributes when listAttribute?)
