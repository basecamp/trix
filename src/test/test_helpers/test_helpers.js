import { fixtureTemplates } from "test/test_helpers/fixtures/fixtures"
import { removeNode } from "trix/core/helpers"

const setFixtureHTML = function (html, container = "form") {
  let element = document.getElementById("trix-container")
  if (element != null) {
    removeNode(element)
  }

  element = document.createElement(container)
  element.id = "trix-container"
  element.innerHTML = html

  return document.body.insertAdjacentElement("afterbegin", element)
}

let ready = null

export const testGroup = function (name, options, callback) {
  let container, setup, teardown, template
  if (callback != null) {
    ({ container, template, setup, teardown } = options)
  } else {
    callback = options
  }

  const beforeEach = () => {
    // Ensure window is active on CI so focus and blur events are natively dispatched
    window.focus()

    ready = function (callback) {
      if (template != null) {
        let handler
        addEventListener(
          "trix-initialize",
          handler = function ({ target }) {
            removeEventListener("trix-initialize", handler)
            if (target.hasAttribute("autofocus")) {
              target.editor.setSelectedRange(0)
            }
            callback(target)
          }
        )

        return setFixtureHTML(fixtureTemplates[template](), container)
      } else {
        callback()
      }
    }
    if (setup) setup()
  }

  const afterEach = () => {
    if (template != null) {
      setFixtureHTML("")
    }
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

export const test = (name, callback) =>
  QUnit.test(name, function (assert) {
    const doneAsync = assert.async()

    return ready(function (element) {
      const done = function (expectedDocumentValue) {
        if (element != null) {
          if (expectedDocumentValue) {
            assert.equal(element.editor.getDocument().toString(), expectedDocumentValue)
          }
          requestAnimationFrame(doneAsync)
        } else {
          return doneAsync()
        }
      }

      if (callback.length === 0) {
        callback()
        return done()
      } else {
        callback(done)
      }
    })
  })

export const testIf = function (condition, ...args) {
  if (condition) {
    test(...Array.from(args || []))
  } else {
    skip(...Array.from(args || []))
  }
}

export const { skip } = QUnit
