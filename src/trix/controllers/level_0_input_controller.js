import * as config from "trix/config"
import UTF16String from "trix/core/utilities/utf16_string"
import BasicObject from "trix/core/basic_object"
import InputController from "trix/controllers/input_controller"
import DocumentView from "trix/views/document_view"
import Document from "trix/models/document"

import {
  dataTransferIsPlainText,
  dataTransferIsWritable,
  keyEventIsKeyboardCommand,
  makeElement,
  objectsAreEqual,
  removeNode,
  squishBreakableWhitespace,
} from "trix/core/helpers"

import { selectionChangeObserver } from "trix/observers/selection_change_observer"

const { browser, keyNames } = config
let pastedFileCount = 0

export default class Level0InputController extends InputController {

  static events = {
    keydown(event) {
      if (!this.isComposing()) {
        this.resetInputSummary()
      }
      this.inputSummary.didInput = true

      const keyName = keyNames[event.keyCode]
      if (keyName) {
        let context = this.keys

        ;[ "ctrl", "alt", "shift", "meta" ].forEach((modifier) => {
          if (event[`${modifier}Key`]) {
            if (modifier === "ctrl") {
              modifier = "control"
            }
            context = context?.[modifier]
          }
        })

        if (context?.[keyName] != null) {
          this.setInputSummary({ keyName })
          selectionChangeObserver.reset()
          context[keyName].call(this, event)
        }
      }

      if (keyEventIsKeyboardCommand(event)) {
        const character = String.fromCharCode(event.keyCode).toLowerCase()
        if (character) {
          const keys = [ "alt", "shift" ].map((modifier) => {
            if (event[`${modifier}Key`]) {
              return modifier
            }
          }).filter(key => key)
          keys.push(character)
          if (this.delegate?.inputControllerDidReceiveKeyboardCommand(keys)) {
            event.preventDefault()
          }
        }
      }
    },

    keypress(event) {
      if (this.inputSummary.eventName != null) return
      if (event.metaKey) return
      if (event.ctrlKey && !event.altKey) return

      const string = stringFromKeyEvent(event)
      if (string) {
        this.delegate?.inputControllerWillPerformTyping()
        this.responder?.insertString(string)
        return this.setInputSummary({ textAdded: string, didDelete: this.selectionIsExpanded() })
      }
    },

    textInput(event) {
      // Handle autocapitalization
      const { data } = event
      const { textAdded } = this.inputSummary
      if (textAdded && textAdded !== data && textAdded.toUpperCase() === data) {
        const range = this.getSelectedRange()
        this.setSelectedRange([ range[0], range[1] + textAdded.length ])
        this.responder?.insertString(data)
        this.setInputSummary({ textAdded: data })
        return this.setSelectedRange(range)
      }
    },

    dragenter(event) {
      event.preventDefault()
    },

    dragstart(event) {
      this.serializeSelectionToDataTransfer(event.dataTransfer)
      this.draggedRange = this.getSelectedRange()
      return this.delegate?.inputControllerDidStartDrag?.()
    },

    dragover(event) {
      if (this.draggedRange || this.canAcceptDataTransfer(event.dataTransfer)) {
        event.preventDefault()
        const draggingPoint = { x: event.clientX, y: event.clientY }
        if (!objectsAreEqual(draggingPoint, this.draggingPoint)) {
          this.draggingPoint = draggingPoint
          return this.delegate?.inputControllerDidReceiveDragOverPoint?.(this.draggingPoint)
        }
      }
    },

    dragend(event) {
      this.delegate?.inputControllerDidCancelDrag?.()
      this.draggedRange = null
      this.draggingPoint = null
    },

    drop(event) {
      event.preventDefault()
      const files = event.dataTransfer?.files
      const documentJSON = event.dataTransfer.getData("application/x-trix-document")

      const point = { x: event.clientX, y: event.clientY }
      this.responder?.setLocationRangeFromPointRange(point)

      if (files?.length) {
        this.attachFiles(files)
      } else if (this.draggedRange) {
        this.delegate?.inputControllerWillMoveText()
        this.responder?.moveTextFromRange(this.draggedRange)
        this.draggedRange = null
        this.requestRender()
      } else if (documentJSON) {
        const document = Document.fromJSONString(documentJSON)
        this.responder?.insertDocument(document)
        this.requestRender()
      }

      this.draggedRange = null
      this.draggingPoint = null
    },

    cut(event) {
      if (this.responder?.selectionIsExpanded()) {
        if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
          event.preventDefault()
        }

        this.delegate?.inputControllerWillCutText()
        this.deleteInDirection("backward")
        if (event.defaultPrevented) {
          return this.requestRender()
        }
      }
    },

    copy(event) {
      if (this.responder?.selectionIsExpanded()) {
        if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
          event.preventDefault()
        }
      }
    },

    paste(event) {
      const clipboard = event.clipboardData || event.testClipboardData
      const paste = { clipboard }

      if (!clipboard || pasteEventIsCrippledSafariHTMLPaste(event)) {
        this.getPastedHTMLUsingHiddenElement((html) => {
          paste.type = "text/html"
          paste.html = html
          this.delegate?.inputControllerWillPaste(paste)
          this.responder?.insertHTML(paste.html)
          this.requestRender()
          return this.delegate?.inputControllerDidPaste(paste)
        })
        return
      }

      const href = clipboard.getData("URL")
      const html = clipboard.getData("text/html")
      const name = clipboard.getData("public.url-name")

      if (href) {
        let string
        paste.type = "text/html"
        if (name) {
          string = squishBreakableWhitespace(name).trim()
        } else {
          string = href
        }
        paste.html = this.createLinkHTML(href, string)
        this.delegate?.inputControllerWillPaste(paste)
        this.setInputSummary({ textAdded: string, didDelete: this.selectionIsExpanded() })
        this.responder?.insertHTML(paste.html)
        this.requestRender()
        this.delegate?.inputControllerDidPaste(paste)
      } else if (dataTransferIsPlainText(clipboard)) {
        paste.type = "text/plain"
        paste.string = clipboard.getData("text/plain")
        this.delegate?.inputControllerWillPaste(paste)
        this.setInputSummary({ textAdded: paste.string, didDelete: this.selectionIsExpanded() })
        this.responder?.insertString(paste.string)
        this.requestRender()
        this.delegate?.inputControllerDidPaste(paste)
      } else if (html) {
        paste.type = "text/html"
        paste.html = html
        this.delegate?.inputControllerWillPaste(paste)
        this.responder?.insertHTML(paste.html)
        this.requestRender()
        this.delegate?.inputControllerDidPaste(paste)
      } else if (Array.from(clipboard.types).includes("Files")) {
        const file = clipboard.items?.[0]?.getAsFile?.()
        if (file) {
          const extension = extensionForFile(file)
          if (!file.name && extension) {
            file.name = `pasted-file-${++pastedFileCount}.${extension}`
          }
          paste.type = "File"
          paste.file = file
          this.delegate?.inputControllerWillAttachFiles()
          this.responder?.insertFile(paste.file)
          this.requestRender()
          this.delegate?.inputControllerDidPaste(paste)
        }
      }

      event.preventDefault()
    },

    compositionstart(event) {
      return this.getCompositionInput().start(event.data)
    },

    compositionupdate(event) {
      return this.getCompositionInput().update(event.data)
    },

    compositionend(event) {
      return this.getCompositionInput().end(event.data)
    },

    beforeinput(event) {
      this.inputSummary.didInput = true
    },

    input(event) {
      this.inputSummary.didInput = true
      return event.stopPropagation()
    },
  }

  static keys = {
    backspace(event) {
      this.delegate?.inputControllerWillPerformTyping()
      return this.deleteInDirection("backward", event)
    },

    delete(event) {
      this.delegate?.inputControllerWillPerformTyping()
      return this.deleteInDirection("forward", event)
    },

    return(event) {
      this.setInputSummary({ preferDocument: true })
      this.delegate?.inputControllerWillPerformTyping()
      return this.responder?.insertLineBreak()
    },

    tab(event) {
      if (this.responder?.canIncreaseNestingLevel()) {
        this.responder?.increaseNestingLevel()
        this.requestRender()
        event.preventDefault()
      }
    },

    left(event) {
      if (this.selectionIsInCursorTarget()) {
        event.preventDefault()
        return this.responder?.moveCursorInDirection("backward")
      }
    },

    right(event) {
      if (this.selectionIsInCursorTarget()) {
        event.preventDefault()
        return this.responder?.moveCursorInDirection("forward")
      }
    },

    control: {
      d(event) {
        this.delegate?.inputControllerWillPerformTyping()
        return this.deleteInDirection("forward", event)
      },

      h(event) {
        this.delegate?.inputControllerWillPerformTyping()
        return this.deleteInDirection("backward", event)
      },

      o(event) {
        event.preventDefault()
        this.delegate?.inputControllerWillPerformTyping()
        this.responder?.insertString("\n", { updatePosition: false })
        return this.requestRender()
      },
    },

    shift: {
      return(event) {
        this.delegate?.inputControllerWillPerformTyping()
        this.responder?.insertString("\n")
        this.requestRender()
        event.preventDefault()
      },

      tab(event) {
        if (this.responder?.canDecreaseNestingLevel()) {
          this.responder?.decreaseNestingLevel()
          this.requestRender()
          event.preventDefault()
        }
      },

      left(event) {
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault()
          return this.expandSelectionInDirection("backward")
        }
      },

      right(event) {
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault()
          return this.expandSelectionInDirection("forward")
        }
      },
    },

    alt: {
      backspace(event) {
        this.setInputSummary({ preferDocument: false })
        return this.delegate?.inputControllerWillPerformTyping()
      },
    },

    meta: {
      backspace(event) {
        this.setInputSummary({ preferDocument: false })
        return this.delegate?.inputControllerWillPerformTyping()
      },
    },
  }

  constructor() {
    super(...arguments)
    this.resetInputSummary()
  }

  setInputSummary(summary = {}) {
    this.inputSummary.eventName = this.eventName
    for (const key in summary) {
      const value = summary[key]
      this.inputSummary[key] = value
    }
    return this.inputSummary
  }

  resetInputSummary() {
    this.inputSummary = {}
  }

  reset() {
    this.resetInputSummary()
    return selectionChangeObserver.reset()
  }

  // Mutation observer delegate

  elementDidMutate(mutationSummary) {
    if (this.isComposing()) {
      return this.delegate?.inputControllerDidAllowUnhandledInput?.()
    } else {
      return this.handleInput(function() {
        if (this.mutationIsSignificant(mutationSummary)) {
          if (this.mutationIsExpected(mutationSummary)) {
            this.requestRender()
          } else {
            this.requestReparse()
          }
        }
        return this.reset()
      })
    }
  }

  mutationIsExpected({ textAdded, textDeleted }) {
    if (this.inputSummary.preferDocument) {
      return true
    }

    const mutationAdditionMatchesSummary =
      textAdded != null ? textAdded === this.inputSummary.textAdded : !this.inputSummary.textAdded
    const mutationDeletionMatchesSummary =
      textDeleted != null ? this.inputSummary.didDelete : !this.inputSummary.didDelete

    const unexpectedNewlineAddition = [ "\n", " \n" ].includes(textAdded) && !mutationAdditionMatchesSummary
    const unexpectedNewlineDeletion = textDeleted === "\n" && !mutationDeletionMatchesSummary
    const singleUnexpectedNewline =
      unexpectedNewlineAddition && !unexpectedNewlineDeletion ||
      unexpectedNewlineDeletion && !unexpectedNewlineAddition

    if (singleUnexpectedNewline) {
      const range = this.getSelectedRange()
      if (range) {
        const offset = unexpectedNewlineAddition ? textAdded.replace(/\n$/, "").length || -1 : textAdded?.length || 1
        if (this.responder?.positionIsBlockBreak(range[1] + offset)) {
          return true
        }
      }
    }

    return mutationAdditionMatchesSummary && mutationDeletionMatchesSummary
  }

  mutationIsSignificant(mutationSummary) {
    const textChanged = Object.keys(mutationSummary).length > 0
    const composedEmptyString = this.compositionInput?.getEndData() === ""
    return textChanged || !composedEmptyString
  }

  // Private

  getCompositionInput() {
    if (this.isComposing()) {
      return this.compositionInput
    } else {
      this.compositionInput = new CompositionInput(this)
    }
  }

  isComposing() {
    return this.compositionInput && !this.compositionInput.isEnded()
  }

  deleteInDirection(direction, event) {
    if (this.responder?.deleteInDirection(direction) === false) {
      if (event) {
        event.preventDefault()
        return this.requestRender()
      }
    } else {
      return this.setInputSummary({ didDelete: true })
    }
  }

  serializeSelectionToDataTransfer(dataTransfer) {
    if (!dataTransferIsWritable(dataTransfer)) return
    const document = this.responder?.getSelectedDocument().toSerializableDocument()

    dataTransfer.setData("application/x-trix-document", JSON.stringify(document))
    dataTransfer.setData("text/html", DocumentView.render(document).innerHTML)
    dataTransfer.setData("text/plain", document.toString().replace(/\n$/, ""))
    return true
  }

  canAcceptDataTransfer(dataTransfer) {
    const types = {}
    Array.from(dataTransfer?.types || []).forEach((type) => {
      types[type] = true
    })
    return types.Files || types["application/x-trix-document"] || types["text/html"] || types["text/plain"]
  }

  getPastedHTMLUsingHiddenElement(callback) {
    const selectedRange = this.getSelectedRange()

    const style = {
      position: "absolute",
      left: `${window.pageXOffset}px`,
      top: `${window.pageYOffset}px`,
      opacity: 0,
    }

    const element = makeElement({ style, tagName: "div", editable: true })
    document.body.appendChild(element)
    element.focus()

    return requestAnimationFrame(() => {
      const html = element.innerHTML
      removeNode(element)
      this.setSelectedRange(selectedRange)
      return callback(html)
    })
  }
}

Level0InputController.proxyMethod("responder?.getSelectedRange")
Level0InputController.proxyMethod("responder?.setSelectedRange")
Level0InputController.proxyMethod("responder?.expandSelectionInDirection")
Level0InputController.proxyMethod("responder?.selectionIsInCursorTarget")
Level0InputController.proxyMethod("responder?.selectionIsExpanded")

const extensionForFile = (file) => file.type?.match(/\/(\w+)$/)?.[1]

const hasStringCodePointAt = !!" ".codePointAt?.(0)

const stringFromKeyEvent = function(event) {
  if (event.key && hasStringCodePointAt && event.key.codePointAt(0) === event.keyCode) {
    return event.key
  } else {
    let code
    if (event.which === null) {
      code = event.keyCode
    } else if (event.which !== 0 && event.charCode !== 0) {
      code = event.charCode
    }

    if (code != null && keyNames[code] !== "escape") {
      return UTF16String.fromCodepoints([ code ]).toString()
    }
  }
}

const pasteEventIsCrippledSafariHTMLPaste = function(event) {
  const paste = event.clipboardData
  if (paste) {
    if (paste.types.includes("text/html")) {
      // Answer is yes if there's any possibility of Paste and Match Style in Safari,
      // which is nearly impossible to detect confidently: https://bugs.webkit.org/show_bug.cgi?id=174165
      for (const type of paste.types) {
        const hasPasteboardFlavor = /^CorePasteboardFlavorType/.test(type)
        const hasReadableDynamicData = /^dyn\./.test(type) && paste.getData(type)
        const mightBePasteAndMatchStyle = hasPasteboardFlavor || hasReadableDynamicData
        if (mightBePasteAndMatchStyle) {
          return true
        }
      }
      return false
    } else {
      const isExternalHTMLPaste = paste.types.includes("com.apple.webarchive")
      const isExternalRichTextPaste = paste.types.includes("com.apple.flat-rtfd")
      return isExternalHTMLPaste || isExternalRichTextPaste
    }
  }
}

class CompositionInput extends BasicObject {
  constructor(inputController) {
    super(...arguments)
    this.inputController = inputController
    this.responder = this.inputController.responder
    this.delegate = this.inputController.delegate
    this.inputSummary = this.inputController.inputSummary
    this.data = {}
  }

  start(data) {
    this.data.start = data

    if (this.isSignificant()) {
      if (this.inputSummary.eventName === "keypress" && this.inputSummary.textAdded) {
        this.responder?.deleteInDirection("left")
      }

      if (!this.selectionIsExpanded()) {
        this.insertPlaceholder()
        this.requestRender()
      }

      this.range = this.responder?.getSelectedRange()
    }
  }

  update(data) {
    this.data.update = data

    if (this.isSignificant()) {
      const range = this.selectPlaceholder()
      if (range) {
        this.forgetPlaceholder()
        this.range = range
      }
    }
  }

  end(data) {
    this.data.end = data

    if (this.isSignificant()) {
      this.forgetPlaceholder()

      if (this.canApplyToDocument()) {
        this.setInputSummary({ preferDocument: true, didInput: false })
        this.delegate?.inputControllerWillPerformTyping()
        this.responder?.setSelectedRange(this.range)
        this.responder?.insertString(this.data.end)
        return this.responder?.setSelectedRange(this.range[0] + this.data.end.length)
      } else if (this.data.start != null || this.data.update != null) {
        this.requestReparse()
        return this.inputController.reset()
      }
    } else {
      return this.inputController.reset()
    }
  }

  getEndData() {
    return this.data.end
  }

  isEnded() {
    return this.getEndData() != null
  }

  isSignificant() {
    if (browser.composesExistingText) {
      return this.inputSummary.didInput
    } else {
      return true
    }
  }

  // Private

  canApplyToDocument() {
    return this.data.start?.length === 0 && this.data.end?.length > 0 && this.range
  }
}

CompositionInput.proxyMethod("inputController.setInputSummary")
CompositionInput.proxyMethod("inputController.requestRender")
CompositionInput.proxyMethod("inputController.requestReparse")
CompositionInput.proxyMethod("responder?.selectionIsExpanded")
CompositionInput.proxyMethod("responder?.insertPlaceholder")
CompositionInput.proxyMethod("responder?.selectPlaceholder")
CompositionInput.proxyMethod("responder?.forgetPlaceholder")
