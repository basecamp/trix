import { fixtureTemplates } from "test/test_helpers/fixtures/fixtures"
import { removeNode } from "trix/core/helpers"

export const setFixtureHTML = function (html, container = "form") {
  let element = document.getElementById("trix-container")
  if (element != null) removeNode(element)

  element = document.createElement(container)
  element.id = "trix-container"
  element.innerHTML = html

  document.body.insertAdjacentElement("afterbegin", element)

  return waitForTrixInit()
}

export const testGroup = function (name, options, callback) {
  let container, beforeSetup, setup, teardown, afterTeardown, template
  if (callback != null) {
    ({ container, template, beforeSetup, setup, teardown, afterTeardown } = options)
  } else {
    callback = options
  }

  const before = () => {
    if (beforeSetup) beforeSetup()
  }

  const beforeEach = async () => {
    // Ensure window is active on CI so focus and blur events are natively dispatched
    window.focus()

    if (template != null) {
      await setFixtureHTML(fixtureTemplates[template](), container)
    }

    if (setup) setup()
  }

  const afterEach = () => {
    if (template != null) setFixtureHTML("")
    return teardown?.()
  }

  const after = () => {
    if (afterTeardown) afterTeardown()
  }

  if (callback != null) {
    return QUnit.module(name, function (hooks) {
      hooks.before(before)
      hooks.beforeEach(beforeEach)
      hooks.afterEach(afterEach)
      hooks.after(after)
      callback()
    })
  } else {
    return QUnit.module(name, { before, beforeEach, afterEach, after })
  }
}

export const skipIf = function (condition, ...args) {
  testIf(!condition, ...args)
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
