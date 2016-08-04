allAttributeNames = null
blockAttributeNames = null
textAttributeNames = null
listAttributeNames = null

Trix.extend

  getAllAttributeNames: ->
    allAttributeNames ?= Trix.getTextAttributeNames().concat Trix.getBlockAttributeNames()

  getBlockAttributes: ->
    Trix.config.blockAttributes

  getBlockAttributeNames: ->
    blockAttributeNames ?= Object.keys(Trix.config.blockAttributes)

  getTextAttributes: ->
    Trix.config.textAttributes

  getTextAttributeNames: ->
    textAttributeNames ?= Object.keys(Trix.config.textAttributes)

  getListAttributeNames: ->
    listAttributeNames ?= (
      result = []
      for key, object of Trix.config.blockAttributes
        if object.hasOwnProperty("listAttribute")
          result.push(object.listAttribute)
      result
    )
