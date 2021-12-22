/* eslint-disable
    id-length,
*/
import { installDefaultCSSForTagName } from "trix/core/helpers"

installDefaultCSSForTagName("trix-inspector", `\
%t {
  display: block;
}

%t {
  position: fixed;
  background: #fff;
  border: 1px solid #444;
  border-radius: 5px;
  padding: 10px;
  font-family: sans-serif;
  font-size: 12px;
  overflow: auto;
  word-wrap: break-word;
}

%t details {
  margin-bottom: 10px;
}

%t summary:focus {
  outline: none;
}

%t details .panel {
  padding: 10px;
}

%t .performance .metrics {
  margin: 0 0 5px 5px;
}

%t .selection .characters {
  margin-top: 10px;
}

%t .selection .character {
  display: inline-block;
  font-size: 8px;
  font-family: courier, monospace;
  line-height: 10px;
  vertical-align: middle;
  text-align: center;
  width: 10px;
  height: 10px;
  margin: 0 1px 1px 0;
  border: 1px solid #333;
  border-radius: 1px;
  background: #676666;
  color: #fff;
}

%t .selection .character.selected {
  background: yellow;
  color: #000;
}\
`)

export default class TrixInspector extends HTMLElement {
  connectedCallback() {
    this.editorElement = document.querySelector(`trix-editor[trix-id='${this.dataset.trixId}']`)
    this.views = this.createViews()

    this.views.forEach((view) => {
      view.render()
      this.appendChild(view.element)
    })

    this.reposition()

    this.resizeHandler = this.reposition.bind(this)
    addEventListener("resize", this.resizeHandler)
  }

  disconnectedCallback() {
    removeEventListener("resize", this.resizeHandler)
  }

  createViews() {
    const views = Trix.Inspector.views.map((View) => new View(this.editorElement))

    return views.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase())
  }

  reposition() {
    const { top, right } = this.editorElement.getBoundingClientRect()

    this.style.top = `${top}px`
    this.style.left = `${right + 10}px`
    this.style.maxWidth = `${window.innerWidth - right - 40}px`
    this.style.maxHeight = `${window.innerHeight - top - 30}px`
  }
}

window.customElements.define("trix-inspector", TrixInspector)
