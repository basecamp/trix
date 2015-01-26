{forwardMethod} = Trix.Helpers

class Trix.BasicObject
  @forward: (expression) ->
    forwardMethod argumentsForForwardExpression.call(this, expression)...

  @forwardExpressionPattern = ///
    ^
      (.+?)
        (\(\))?
        (\?)?
      \.
      (.+?)
    $
  ///

  argumentsForForwardExpression = (expression) ->
    unless match = expression.match(@forwardExpressionPattern)
      throw new Error "can't parse forward expression: #{expression}"

    name = match[4]
    args = onConstructor: this

    if match[2]?
      args.toMethod = match[1]
    else
      args.toProperty = match[1]

    if match[3]?
      args.optional = true

    [name, args]
