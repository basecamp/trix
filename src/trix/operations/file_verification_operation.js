/* eslint-disable
    no-empty,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Operation from "trix/core/utilities/operation"

export default class FileVerificationOperation extends Operation {
  constructor(file) {
    super(...arguments)
    this.file = file
  }

  perform(callback) {
    const reader = new FileReader

    reader.onerror = () => callback(false)

    reader.onload = () => {
      reader.onerror = null
      try { reader.abort() } catch (error) {}
      return callback(true, this.file)
    }

    return reader.readAsArrayBuffer(this.file)
  }
}
