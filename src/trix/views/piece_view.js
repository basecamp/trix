/* eslint-disable
    no-useless-escape,
    no-var,
*/
import { NON_BREAKING_SPACE } from "trix/constants"

import ObjectView from "trix/views/object_view"
import AttachmentView from "trix/views/attachment_view"
import PreviewableAttachmentView from "trix/views/previewable_attachment_view"

import { findInnerElement, getTextConfig, makeElement } from "trix/core/helpers"

export default class PieceView extends ObjectView {
  constructor() {
    super(...arguments)
    this.piece = this.object
    this.attributes = this.piece.getAttributes()
    this.textConfig = this.options.textConfig
    this.context = this.options.context

    if (this.piece.attachment) {
      this.attachment = this.piece.attachment
    } else {
      this.string = this.piece.toString()
    }
  }

  createNodes() {
    let nodes = this.attachment ? this.createAttachmentNodes() : this.createStringNodes()
    const element = this.createElement()
    if (element) {
      const innerElement = findInnerElement(element)
      Array.from(nodes).forEach((node) => {
        innerElement.appendChild(node)
      })
      nodes = [ element ]
    }
    return nodes
  }

  createAttachmentNodes() {
    const constructor = this.attachment.isPreviewable() ? PreviewableAttachmentView : AttachmentView

    const view = this.createChildView(constructor, this.piece.attachment, { piece: this.piece })
    return view.getNodes()
  }

  createStringNodes() {
    if (this.textConfig?.plaintext) {
      return [ document.createTextNode(this.string) ]
    } else {
      const nodes = []
      const iterable = this.string.split("\n")
      for (let index = 0; index < iterable.length; index++) {
        const substring = iterable[index]
        if (index > 0) {
          const element = makeElement("br")
          nodes.push(element)
        }

        if (substring.length) {
          const node = document.createTextNode(this.preserveSpaces(substring))
          nodes.push(node)
        }
      }
      return nodes
    }
  }

  createElement() {
    let element, key, value
    const styles = {}

    for (key in this.attributes) {
      value = this.attributes[key]
      const config = getTextConfig(key)
      if (config) {
        if (config.tagName) {
          var innerElement
          const pendingElement = makeElement(config.tagName)

          if (innerElement) {
            innerElement.appendChild(pendingElement)
            innerElement = pendingElement
          } else {
            element = innerElement = pendingElement
          }
        }

        if (config.styleProperty) {
          styles[config.styleProperty] = value
        }

        if (config.style) {
          for (key in config.style) {
            value = config.style[key]
            styles[key] = value
          }
        }
      }
    }

    if (Object.keys(styles).length) {
      if (!element) { element = makeElement("span") }
      for (key in styles) {
        value = styles[key]
        element.style[key] = value
      }
    }
    return element
  }

  createContainerElement() {
    for (const key in this.attributes) {
      const value = this.attributes[key]
      const config = getTextConfig(key)
      if (config) {
        if (config.groupTagName) {
          const attributes = {}
          attributes[key] = value
          return makeElement(config.groupTagName, attributes)
        }
      }
    }
  }

  preserveSpaces(string) {
    if (this.context.isLast) {
      string = string.replace(/\ $/, NON_BREAKING_SPACE)
    }

    string = string
      .replace(/(\S)\ {3}(\S)/g, `$1 ${NON_BREAKING_SPACE} $2`)
      .replace(/\ {2}/g, `${NON_BREAKING_SPACE} `)
      .replace(/\ {2}/g, ` ${NON_BREAKING_SPACE}`)

    if (this.context.isFirst || this.context.followsWhitespace) {
      string = string.replace(/^\ /, NON_BREAKING_SPACE)
    }

    return string
  }
}
