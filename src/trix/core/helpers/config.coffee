Trix.extend
  getListBlockAttributes: ->
    result = []
    for key, object of Trix.config.blockAttributes
      if object.hasOwnProperty("listAttribute")
        result.push(object.listAttribute)
    result
