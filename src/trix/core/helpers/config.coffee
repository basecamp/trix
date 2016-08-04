allAttributeNames = null
listAttributeNames = null

Trix.extend

  getAllAttributeNames: ->
    allAttributeNames ?= (
      result = []
      result.push(key) for key of Trix.config.textAttributes
      result.push(key) for key of Trix.config.blockAttributes
      result
    )

  getListAttributeNames: ->
    listAttributeNames ?= (
      result = []
      for key, object of Trix.config.blockAttributes
        if object.hasOwnProperty("listAttribute")
          result.push(object.listAttribute)
      result
    )
