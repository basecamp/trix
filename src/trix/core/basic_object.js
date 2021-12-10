/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class BasicObject {
  static proxyMethod(expression) {
    const { name, toMethod, toProperty, optional } = parseProxyMethodExpression(expression)

    this.prototype[name] = function() {
      let subject
      const object = (() => {
        if (toMethod != null) {
        if (optional) { return this[toMethod]?.() } else { return this[toMethod]() }
      } else if (toProperty != null) {
        return this[toProperty]
      }
      })()

      if (optional) {
        subject = object?.[name]
        if (subject != null) { return apply.call(subject, object, arguments) }
      } else {
        subject = object[name]
        return apply.call(subject, object, arguments)
      }
    }
  }
}

var parseProxyMethodExpression = function(expression) {
  let match
  if (!(match = expression.match(proxyMethodExpressionPattern))) {
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

var { apply } = Function.prototype

var proxyMethodExpressionPattern = new RegExp("\
^\
(.+?)\
(\\(\\))?\
(\\?)?\
\\.\
(.+?)\
$\
")
