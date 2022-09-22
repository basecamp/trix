import { fixtureTemplates } from "test/test_helpers/fixtures/fixtures"
import { removeNode } from "trix/core/helpers"

const setFixtureHTML = function (html, container = "form") {
  let element = document.getElementById("trix-container")
  if (element != null) removeNode(element)

  element = document.createElement(container)
  element.id = "trix-container"
  element.innerHTML = html

  return document.body.insertAdjacentElement("afterbegin", element)
}

export const testGroup = function (name, options, callback) {
  let container, setup, teardown, template
  if (callback != null) {
    ({ container, template, setup, teardown } = options)
  } else {
    callback = options
  }

  const beforeEach = async () => {
    // Ensure window is active on CI so focus and blur events are natively dispatched
    window.focus()

    if (template != null) {
      setFixtureHTML(fixtureTemplates[template](), container)
      await waitForTrixInit()
    }

    if (setup) setup()
  }

  const afterEach = () => {
    if (template != null) setFixtureHTML("")
    return teardown?.()
  }

  if (callback != null) {
    return QUnit.module(name, function (hooks) {
      hooks.beforeEach(beforeEach)
      hooks.afterEach(afterEach)
      callback()
    })
  } else {
    return QUnit.module(name, { beforeEach, afterEach })
  }
}

export const testIf = function (condition, ...args) {
  if (condition) {
    test(...Array.from(args || []))
  } else {
    skip(...Array.from(args || []))
  }
}

export const { skip, test } = QUnit

const waitForTrixInit = async () => {
  return new Promise((resolve) => {
    addEventListener("trix-initialize", ({ target }) => {
      if (target.hasAttribute("autofocus")) target.editor.setSelectedRange(0)
      resolve(target)
    }, { once: true })
  })
}


// const isAsync = (func) => func.constructor.name === "AsyncFunction"
