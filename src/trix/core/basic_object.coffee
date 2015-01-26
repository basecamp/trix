{proxyMethod} = Trix.Helpers

class Trix.BasicObject
  @proxy: (expression) ->
    proxyMethod argumentsForProxyExpression.call(this, expression)...

  proxyExpressionPattern = ///
    ^
      (.+?)
        (\(\))?
        (\?)?
      \.
      (.+?)
    $
  ///

  argumentsForProxyExpression = (expression) ->
    unless match = expression.match(proxyExpressionPattern)
      throw new Error "can't parse @proxy expression: #{expression}"

    name = match[4]
    args = onConstructor: this

    if match[2]?
      args.toMethod = match[1]
    else
      args.toProperty = match[1]

    if match[3]?
      args.optional = true

    [name, args]
