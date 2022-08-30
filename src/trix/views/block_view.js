import * as config from "trix/config"
import ObjectView from "trix/views/object_view"
import TextView from "trix/views/text_view"

import { getBlockConfig, makeElement } from "trix/core/helpers"
const { css } = config

export default class BlockView extends ObjectView {
  constructor() {
    super(...arguments)
    this.block = this.object
    this.attributes = this.block.getAttributes()
  }

  createNodes() {
    const comment = document.createComment("block")
    const nodes = [ comment ]
    if (this.block.isEmpty()) {
      nodes.push(makeElement("br"))
    } else {
      const textConfig = getBlockConfig(this.block.getLastAttribute())?.text
      const textView = this.findOrCreateCachedChildView(TextView, this.block.text, { textConfig })
      nodes.push(...Array.from(textView.getNodes() || []))
      if (this.shouldAddExtraNewlineElement()) {
        nodes.push(makeElement("br"))
      }
    }

    if (this.attributes.length) {
      return nodes
    } else {
      let attributes
      const { tagName } = config.blockAttributes.default
      if (this.block.isRTL()) {
        attributes = { dir: "rtl" }
      }

      const element = makeElement({ tagName, attributes })
      nodes.forEach((node) => element.appendChild(node))
      return [ element ]
    }
  }

  createContainerElement(depth) {
    let attributes, className
    const attributeName = this.attributes[depth]

    const { tagName } = getBlockConfig(attributeName)
    if (depth === 0 && this.block.isRTL()) {
      attributes = { dir: "rtl" }
    }

    if (attributeName === "attachmentGallery") {
      const size = this.block.getBlockBreakPosition()
      className = `${css.attachmentGallery} ${css.attachmentGallery}--${size}`
    }

    return makeElement({ tagName, className, attributes })
  }

  // A single <br> at the end of a block element has no visual representation
  // so add an extra one.
  shouldAddExtraNewlineElement() {
    return /\n\n$/.test(this.block.toString())
  }
}
