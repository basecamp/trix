Trix.ObjectArchive =
  archive: (value) ->
    strings = {}
    objects = {}
    values: values = []
    value: do encode = (value) ->
      if typeof value is "string"
        if value.length > 7
          unless strings[value]?
            strings[value] = values.length
            values.push(value)
          "": strings[value]
        else
          value
      else if typeof value?.toArchive is "function"
        {key, type, args, props} = value.toArchive()
        unless objects[key]?
          objects[key] = values.length
          values.push(object = [])
          object[0] = encode(type)
          object[1] = encode(args)
        "": objects[key]
      else if value is null or typeof value in ["number", "boolean", "undefined"]
        value
      else if Array.isArray(value)
        for v in value
          encode(v)
      else
        object = {}
        for key, v of value.toJSON?() ? value
          object[key] = encode(v)
        object

  unarchive: ({values, value}) ->
    objects = {}
    do decode = (value) ->
      if value is null or typeof value in ["string", "number", "boolean", "undefined"]
        value
      else if Array.isArray(value)
        for v in value
          decode(v)
      else if "" of value and Object.keys(value).length is 1
        v = values[index = value[""]]
        if typeof v is "string"
          v
        else
          objects[index] ?= (
            [type, args] = v
            constructor = eval(decode(type))
            new constructor (decode(arg) for arg in args)...
          )
      else
        object = {}
        for key, v of value
          object[key] = decode(v)
        object
