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
import config from "trix/config"

let allAttributeNames = null
let blockAttributeNames = null
let textAttributeNames = null
let listAttributeNames = null

export var getAllAttributeNames = () => allAttributeNames != null ? allAttributeNames : allAttributeNames = getTextAttributeNames().concat(getBlockAttributeNames())

export var getBlockConfig = attributeName => config.blockAttributes[attributeName]

export var getBlockAttributeNames = () => blockAttributeNames != null ? blockAttributeNames : blockAttributeNames = Object.keys(config.blockAttributes)

export var getTextConfig = attributeName => config.textAttributes[attributeName]

export var getTextAttributeNames = () => textAttributeNames != null ? textAttributeNames : textAttributeNames = Object.keys(config.textAttributes)

export var getListAttributeNames = () => listAttributeNames != null ? listAttributeNames : listAttributeNames = (() => {
  const result = []
  for (const key in config.blockAttributes) {
    const { listAttribute } = config.blockAttributes[key]
    if (listAttribute != null) {
      result.push(listAttribute)
    }
  }
  return result
})()
