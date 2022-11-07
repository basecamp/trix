/* eslint-disable
*/
export const installDefaultCSSForTagName = function(tagName, defaultCSS) {
  const styleElement = insertStyleElementForTagName(tagName)
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName)
}

const insertStyleElementForTagName = function(tagName) {
  const element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.setAttribute("data-tag-name", tagName.toLowerCase())
  const nonce = getCSPNonce()
  if (nonce) {
    element.setAttribute("nonce", nonce)
  }
  document.head.insertBefore(element, document.head.firstChild)
  return element
}

const getCSPNonce = function() {
  const element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce")
  if (element) {
    return element.getAttribute("content")
  }
}

const getMetaElement = (name) => document.head.querySelector(`meta[name=${name}]`)
