import { getAllAttributeNames, squishBreakableWhitespace } from "trix/core/helpers"
import InputController from "trix/controllers/input_controller"
import * as config from "trix/config"

import { dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual } from "trix/core/helpers"

import { selectionChangeObserver } from "trix/observers/selection_change_observer"

export default class Level2InputController extends InputController {
  constructor(...args) {
    super(...args)
    this.render = this.render.bind(this)
  }

  static events = {
    keydown(event) {
      if (keyEventIsKeyboardCommand(event)) {
        const command = keyboardCommandFromKeyEvent(event)
        if (this.delegate?.inputControllerDidReceiveKeyboardCommand(command)) {
          event.preventDefault()
        }
      } else {
        let name = event.key
        if (event.altKey) {
          name += "+Alt"
        }
        if (event.shiftKey) {
          name += "+Shift"
        }
        const handler = this.constructor.keys[name]
        if (handler) {
          return this.withEvent(event, handler)
        }
      }
    },

    // Handle paste event to work around beforeinput.insertFromPaste browser bugs.
    // Safe to remove each condition once fixed upstream.
    paste(event) {
      // https://bugs.webkit.org/show_bug.cgi?id=194921
      let paste
      const href = event.clipboardData?.getData("URL")
      if (pasteEventHasFilesOnly(event)) {
        event.preventDefault()
        return this.attachFiles(event.clipboardData.files)

        // https://bugs.chromium.org/p/chromium/issues/detail?id=934448
      } else if (pasteEventHasPlainTextOnly(event)) {
        event.preventDefault()
        paste = {
          type: "text/plain",
          string: event.clipboardData.getData("text/plain"),
        }
        this.delegate?.inputControllerWillPaste(paste)
        this.responder?.insertString(paste.string)
        this.render()
        return this.delegate?.inputControllerDidPaste(paste)

        // https://bugs.webkit.org/show_bug.cgi?id=196702
      } else if (href) {
        event.preventDefault()
        paste = {
          type: "text/html",
          html: this.createLinkHTML(href),
        }
        this.delegate?.inputControllerWillPaste(paste)
        this.responder?.insertHTML(paste.html)
        this.render()
        return this.delegate?.inputControllerDidPaste(paste)
      }
    },

    beforeinput(event) {
      const handler = this.constructor.inputTypes[event.inputType]

      if (handler) {
        this.withEvent(event, handler)
        this.scheduleRender()
      }
    },

    input(event) {
      selectionChangeObserver.reset()
    },

    dragstart(event) {
      if (this.responder?.selectionContainsAttachments()) {
        event.dataTransfer.setData("application/x-trix-dragging", true)

        this.dragging = {
          range: this.responder?.getSelectedRange(),
          point: pointFromEvent(event),
        }
      }
    },

    dragenter(event) {
      if (dragEventHasFiles(event)) {
        event.preventDefault()
      }
    },

    dragover(event) {
      if (this.dragging) {
        event.preventDefault()
        const point = pointFromEvent(event)
        if (!objectsAreEqual(point, this.dragging.point)) {
          this.dragging.point = point
          return this.responder?.setLocationRangeFromPointRange(point)
        }
      } else if (dragEventHasFiles(event)) {
        event.preventDefault()
      }
    },

    drop(event) {
      if (this.dragging) {
        event.preventDefault()
        this.delegate?.inputControllerWillMoveText()
        this.responder?.moveTextFromRange(this.dragging.range)
        this.dragging = null
        return this.scheduleRender()
      } else if (dragEventHasFiles(event)) {
        event.preventDefault()
        const point = pointFromEvent(event)
        this.responder?.setLocationRangeFromPointRange(point)
        return this.attachFiles(event.dataTransfer.files)
      }
    },

    dragend() {
      if (this.dragging) {
        this.responder?.setSelectedRange(this.dragging.range)
        this.dragging = null
      }
    },

    compositionend(event) {
      if (this.composing) {
        this.composing = false
        if (!config.browser.recentAndroid) this.scheduleRender()
      }
    },
  }

  static keys = {
    ArrowLeft() {
      if (this.responder?.shouldManageMovingCursorInDirection("backward")) {
        this.event.preventDefault()
        return this.responder?.moveCursorInDirection("backward")
      }
    },

    ArrowRight() {
      if (this.responder?.shouldManageMovingCursorInDirection("forward")) {
        this.event.preventDefault()
        return this.responder?.moveCursorInDirection("forward")
      }
    },

    Backspace() {
      if (this.responder?.shouldManageDeletingInDirection("backward")) {
        this.event.preventDefault()
        this.delegate?.inputControllerWillPerformTyping()
        this.responder?.deleteInDirection("backward")
        return this.render()
      }
    },

    Tab() {
      if (this.responder?.canIncreaseNestingLevel()) {
        this.event.preventDefault()
        this.responder?.increaseNestingLevel()
        return this.render()
      }
    },

    "Tab+Shift"() {
      if (this.responder?.canDecreaseNestingLevel()) {
        this.event.preventDefault()
        this.responder?.decreaseNestingLevel()
        return this.render()
      }
    },
  }

  static inputTypes = {
    deleteByComposition() {
      return this.deleteInDirection("backward", { recordUndoEntry: false })
    },

    deleteByCut() {
      return this.deleteInDirection("backward")
    },

    deleteByDrag() {
      this.event.preventDefault()
      return this.withTargetDOMRange(function() {
        this.deleteByDragRange = this.responder?.getSelectedRange()
      })
    },

    deleteCompositionText() {
      return this.deleteInDirection("backward", { recordUndoEntry: false })
    },

    deleteContent() {
      return this.deleteInDirection("backward")
    },

    deleteContentBackward() {
      return this.deleteInDirection("backward")
    },

    deleteContentForward() {
      return this.deleteInDirection("forward")
    },

    deleteEntireSoftLine() {
      return this.deleteInDirection("forward")
    },

    deleteHardLineBackward() {
      return this.deleteInDirection("backward")
    },

    deleteHardLineForward() {
      return this.deleteInDirection("forward")
    },

    deleteSoftLineBackward() {
      return this.deleteInDirection("backward")
    },

    deleteSoftLineForward() {
      return this.deleteInDirection("forward")
    },

    deleteWordBackward() {
      return this.deleteInDirection("backward")
    },

    deleteWordForward() {
      return this.deleteInDirection("forward")
    },

    formatBackColor() {
      return this.activateAttributeIfSupported("backgroundColor", this.event.data)
    },

    formatBold() {
      return this.toggleAttributeIfSupported("bold")
    },

    formatFontColor() {
      return this.activateAttributeIfSupported("color", this.event.data)
    },

    formatFontName() {
      return this.activateAttributeIfSupported("font", this.event.data)
    },

    formatIndent() {
      if (this.responder?.canIncreaseNestingLevel()) {
        return this.withTargetDOMRange(function() {
          return this.responder?.increaseNestingLevel()
        })
      }
    },

    formatItalic() {
      return this.toggleAttributeIfSupported("italic")
    },

    formatJustifyCenter() {
      return this.toggleAttributeIfSupported("justifyCenter")
    },

    formatJustifyFull() {
      return this.toggleAttributeIfSupported("justifyFull")
    },

    formatJustifyLeft() {
      return this.toggleAttributeIfSupported("justifyLeft")
    },

    formatJustifyRight() {
      return this.toggleAttributeIfSupported("justifyRight")
    },

    formatOutdent() {
      if (this.responder?.canDecreaseNestingLevel()) {
        return this.withTargetDOMRange(function() {
          return this.responder?.decreaseNestingLevel()
        })
      }
    },

    formatRemove() {
      this.withTargetDOMRange(function() {
        for (const attributeName in this.responder?.getCurrentAttributes()) {
          this.responder?.removeCurrentAttribute(attributeName)
        }
      })
    },

    formatSetBlockTextDirection() {
      return this.activateAttributeIfSupported("blockDir", this.event.data)
    },

    formatSetInlineTextDirection() {
      return this.activateAttributeIfSupported("textDir", this.event.data)
    },

    formatStrikeThrough() {
      return this.toggleAttributeIfSupported("strike")
    },

    formatSubscript() {
      return this.toggleAttributeIfSupported("sub")
    },

    formatSuperscript() {
      return this.toggleAttributeIfSupported("sup")
    },

    formatUnderline() {
      return this.toggleAttributeIfSupported("underline")
    },

    historyRedo() {
      return this.delegate?.inputControllerWillPerformRedo()
    },

    historyUndo() {
      return this.delegate?.inputControllerWillPerformUndo()
    },

    insertCompositionText() {
      this.composing = true
      return this.insertString(this.event.data)
    },

    insertFromComposition() {
      this.composing = false
      return this.insertString(this.event.data)
    },

    insertFromDrop() {
      const range = this.deleteByDragRange
      if (range) {
        this.deleteByDragRange = null
        this.delegate?.inputControllerWillMoveText()
        return this.withTargetDOMRange(function() {
          return this.responder?.moveTextFromRange(range)
        })
      }
    },

    insertFromPaste() {
      const { dataTransfer } = this.event
      const paste = { dataTransfer }
      const href = dataTransfer.getData("URL")
      const html = dataTransfer.getData("text/html")

      if (href) {
        let string
        this.event.preventDefault()
        paste.type = "text/html"
        const name = dataTransfer.getData("public.url-name")
        if (name) {
          string = squishBreakableWhitespace(name).trim()
        } else {
          string = href
        }
        paste.html = this.createLinkHTML(href, string)
        this.delegate?.inputControllerWillPaste(paste)
        this.withTargetDOMRange(function() {
          return this.responder?.insertHTML(paste.html)
        })

        this.afterRender = () => {
          return this.delegate?.inputControllerDidPaste(paste)
        }
      } else if (dataTransferIsPlainText(dataTransfer)) {
        paste.type = "text/plain"
        paste.string = dataTransfer.getData("text/plain")
        this.delegate?.inputControllerWillPaste(paste)
        this.withTargetDOMRange(function() {
          return this.responder?.insertString(paste.string)
        })

        this.afterRender = () => {
          return this.delegate?.inputControllerDidPaste(paste)
        }
      } else if (html) {
        this.event.preventDefault()
        paste.type = "text/html"
        paste.html = html
        this.delegate?.inputControllerWillPaste(paste)
        this.withTargetDOMRange(function() {
          return this.responder?.insertHTML(paste.html)
        })

        this.afterRender = () => {
          return this.delegate?.inputControllerDidPaste(paste)
        }
      } else if (dataTransfer.files?.length) {
        paste.type = "File"
        paste.file = dataTransfer.files[0]
        this.delegate?.inputControllerWillPaste(paste)
        this.withTargetDOMRange(function() {
          return this.responder?.insertFile(paste.file)
        })

        this.afterRender = () => {
          return this.delegate?.inputControllerDidPaste(paste)
        }
      }
    },

    insertFromYank() {
      return this.insertString(this.event.data)
    },

    insertLineBreak() {
      return this.insertString("\n")
    },

    insertLink() {
      return this.activateAttributeIfSupported("href", this.event.data)
    },

    insertOrderedList() {
      return this.toggleAttributeIfSupported("number")
    },

    insertParagraph() {
      this.delegate?.inputControllerWillPerformTyping()
      return this.withTargetDOMRange(function() {
        return this.responder?.insertLineBreak()
      })
    },

    insertReplacementText() {
      return this.insertString(this.event.dataTransfer.getData("text/plain"), { updatePosition: false })
    },

    insertText() {
      return this.insertString(this.event.data || this.event.dataTransfer?.getData("text/plain"))
    },

    insertTranspose() {
      return this.insertString(this.event.data)
    },

    insertUnorderedList() {
      return this.toggleAttributeIfSupported("bullet")
    },
  }

  elementDidMutate() {
    if (this.scheduledRender) {
      if (this.composing) {
        return this.delegate?.inputControllerDidAllowUnhandledInput?.()
      }
    } else {
      return this.reparse()
    }
  }

  scheduleRender() {
    return this.scheduledRender ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render)
  }

  render() {
    cancelAnimationFrame(this.scheduledRender)
    this.scheduledRender = null
    if (!this.composing) {
      this.delegate?.render()
    }
    this.afterRender?.()
    this.afterRender = null
  }

  reparse() {
    return this.delegate?.reparse()
  }

  // Responder helpers

  insertString(string = "", options) {
    this.delegate?.inputControllerWillPerformTyping()
    return this.withTargetDOMRange(function() {
      return this.responder?.insertString(string, options)
    })
  }

  toggleAttributeIfSupported(attributeName) {
    if (getAllAttributeNames().includes(attributeName)) {
      this.delegate?.inputControllerWillPerformFormatting(attributeName)
      return this.withTargetDOMRange(function() {
        return this.responder?.toggleCurrentAttribute(attributeName)
      })
    }
  }

  activateAttributeIfSupported(attributeName, value) {
    if (getAllAttributeNames().includes(attributeName)) {
      this.delegate?.inputControllerWillPerformFormatting(attributeName)
      return this.withTargetDOMRange(function() {
        return this.responder?.setCurrentAttribute(attributeName, value)
      })
    }
  }

  deleteInDirection(direction, { recordUndoEntry } = { recordUndoEntry: true }) {
    if (recordUndoEntry) {
      this.delegate?.inputControllerWillPerformTyping()
    }
    const perform = () => this.responder?.deleteInDirection(direction)
    const domRange = this.getTargetDOMRange({ minLength: 2 })
    if (domRange) {
      return this.withTargetDOMRange(domRange, perform)
    } else {
      return perform()
    }
  }

  // Selection helpers

  withTargetDOMRange(domRange, fn) {
    if (typeof domRange === "function") {
      fn = domRange
      domRange = this.getTargetDOMRange()
    }
    if (domRange) {
      return this.responder?.withTargetDOMRange(domRange, fn.bind(this))
    } else {
      selectionChangeObserver.reset()
      return fn.call(this)
    }
  }

  getTargetDOMRange({ minLength } = { minLength: 0 }) {
    const targetRanges = this.event.getTargetRanges?.()
    if (targetRanges) {
      if (targetRanges.length) {
        const domRange = staticRangeToRange(targetRanges[0])
        if (minLength === 0 || domRange.toString().length >= minLength) {
          return domRange
        }
      }
    }
  }

  withEvent(event, fn) {
    let result
    this.event = event
    try {
      result = fn.call(this)
    } finally {
      this.event = null
    }
    return result
  }
}

const staticRangeToRange = function(staticRange) {
  const range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  return range
}

// Event helpers

const dragEventHasFiles = (event) => Array.from(event.dataTransfer?.types || []).includes("Files")

const pasteEventHasFilesOnly = function(event) {
  const clipboard = event.clipboardData
  if (clipboard) {
    return clipboard.types.includes("Files") && clipboard.types.length === 1 && clipboard.files.length >= 1
  }
}

const pasteEventHasPlainTextOnly = function(event) {
  const clipboard = event.clipboardData
  if (clipboard) {
    return clipboard.types.includes("text/plain") && clipboard.types.length === 1
  }
}

const keyboardCommandFromKeyEvent = function(event) {
  const command = []
  if (event.altKey) {
    command.push("alt")
  }
  if (event.shiftKey) {
    command.push("shift")
  }
  command.push(event.key)
  return command
}

const pointFromEvent = (event) => ({
  x: event.clientX,
  y: event.clientY,
})
