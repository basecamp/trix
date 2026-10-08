/* eslint-disable
*/
import { callDocumentMethod, getDocumentProperty } from "./document_properties"

export const installDefaultCSSForTagName = function(tagName, defaultCSS) {
  const styleElement = insertStyleElementForTagName(tagName)
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName)
}

const insertStyleElementForTagName = function(tagName) {
  const element = callDocumentMethod("createElement", "style")
  element.setAttribute("type", "text/css")
  element.setAttribute("data-tag-name", tagName.toLowerCase())
  const nonce = getCSPNonce()
  if (nonce) {
    element.setAttribute("nonce", nonce)
  }
  const head = getDocumentProperty("head")
  head.insertBefore(element, head.firstChild)
  return element
}

const getCSPNonce = function() {
  const element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce")
  if (element) {
    const { nonce, content } = element
    return nonce == "" ? content : nonce
  }
}

const getMetaElement = (name) => getDocumentProperty("head").querySelector(`meta[name=${name}]`)
