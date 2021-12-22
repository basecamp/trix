/* eslint-disable
    id-length,
    no-empty,
*/
import { getDOMRange, setDOMRange } from "trix/core/helpers"

export default class PointMapper {
  createDOMRangeFromPoint({ x, y }) {
    let domRange
    if (document.caretPositionFromPoint) {
      const { offsetNode, offset } = document.caretPositionFromPoint(x, y)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)
      return domRange
    } else if (document.caretRangeFromPoint) {
      return document.caretRangeFromPoint(x, y)
    } else if (document.body.createTextRange) {
      const originalDOMRange = getDOMRange()
      try {
        // IE 11 throws "Unspecified error" when using moveToPoint
        // during a drag-and-drop operation.
        const textRange = document.body.createTextRange()
        textRange.moveToPoint(x, y)
        textRange.select()
      } catch (error) {}
      domRange = getDOMRange()
      setDOMRange(originalDOMRange)
      return domRange
    }
  }

  getClientRectsForDOMRange(domRange) {
    const array = Array.from(domRange.getClientRects())
    const start = array[0]
    const end = array[array.length - 1]

    return [ start, end ]
  }
}
