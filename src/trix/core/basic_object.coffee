class Trix.BasicObject
  @proxyMethod: (expression) ->
    {name, toMethod, toProperty, optional} = parseProxyMethodExpression(expression)

    @::[name] = ->
      object = if toMethod?
        if optional then @[toMethod]?() else @[toMethod]()
      else if toProperty?
        @[toProperty]

      if optional
        object?[name]?.apply(object, arguments)
      else
        object[name].apply(object, arguments)

  parseProxyMethodExpression = (expression) ->
    unless match = expression.match(proxyMethodExpressionPattern)
      throw new Error "can't parse @proxyMethod expression: #{expression}"

    args = name: match[4]

    if match[2]?
      args.toMethod = match[1]
    else
      args.toProperty = match[1]

    if match[3]?
      args.optional = true

    args

  proxyMethodExpressionPattern = ///
    ^
      (.+?)
        (\(\))?
        (\?)?
      \.
      (.+?)
    $
  ///
