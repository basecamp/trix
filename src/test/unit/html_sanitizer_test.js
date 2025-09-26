import {
  assert,
  test,
  testGroup,
} from "test/test_helper"

import { HTMLSanitizer } from "../../trix/models"
import * as config from "../../trix/config"

testGroup("HTMLSanitizer", () => {
  test("strips custom tags", () => {
    const html = "<custom-tag></custom-tag>"
    const expectedHTML = ""
    const document = HTMLSanitizer.sanitize(html).body.innerHTML
    assert.equal(document, expectedHTML)
  })

  test("keeps custom tags configured for DOMPurify", () => {
    const config = {
      ADD_TAGS: [ "custom-tag" ],
      RETURN_DOM: true,
    }
    withDOMPurifyConfig(config, () => {
      const html = "<custom-tag></custom-tag>"
      const expectedHTML = "<custom-tag></custom-tag>"
      const document = HTMLSanitizer.sanitize(html).body.innerHTML
      assert.equal(document, expectedHTML)
    })
  })
})

const withDOMPurifyConfig = (attrConfig = {}, fn) => {
  withConfig("dompurify", attrConfig, fn)
}

const withConfig = (section, newConfig = {}, fn) => {
  const originalConfig = Object.assign({}, config[section])
  const copy = (section, properties) => {
    for (const [ key, value ] of Object.entries(properties)) {
      if (value) {
        config[section][key] = value
      } else {
        delete config[section][key]
      }
    }
  }

  try {
    copy(section, newConfig)
    fn()
  } finally {
    copy(section, originalConfig)
  }
}
