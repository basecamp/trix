/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
// Not all changes to a Trix document result in an undo entry being added to
// the stack. Trix aggregates successive changes into a single undo entry for
// typing and for attribute changes to the same selected range. The "undo
// interval" specifies how often, in milliseconds, these aggregate entries are
// split (or prevents splitting them at all when set to 0).

let undoInterval
export default undoInterval = 5000
