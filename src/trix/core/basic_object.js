export default class BasicObject {
  static proxyMethod(expression) {
    const { name, toMethod, toProperty, optional } = parseProxyMethodExpression(expression)

    this.prototype[name] = function() {
      let subject
      let object

      if (toMethod) {
        if (optional) {
          object = this[toMethod]?.()
        } else {
          object = this[toMethod]()
        }
      } else if (toProperty) {
        object = this[toProperty]
      }

      if (optional) {
        subject = object?.[name]
        if (subject) {
          return apply.call(subject, object, arguments)
        }
      } else {
        subject = object[name]
        return apply.call(subject, object, arguments)
      }
    }
  }
}

const parseProxyMethodExpression = function(expression) {
  const match = expression.match(proxyMethodExpressionPattern)
  if (!match) {
    throw new Error(`can't parse @proxyMethod expression: ${expression}`)
  }

  const args = { name: match[4] }

  if (match[2] != null) {
    args.toMethod = match[1]
  } else {
    args.toProperty = match[1]
  }

  if (match[3] != null) {
    args.optional = true
  }

  return args
}

const { apply } = Function.prototype

const proxyMethodExpressionPattern = new RegExp("\
^\
(.+?)\
(\\(\\))?\
(\\?)?\
\\.\
(.+?)\
$\
")
