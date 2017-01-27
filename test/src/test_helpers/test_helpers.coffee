helpers = Trix.TestHelpers
ready = null

helpers.extend
  testGroup: (name, options, callback) ->
    if callback?
      {template, setup, teardown} = options
    else
      callback = options

    beforeEach = ->
      # Ensure window is active on CI so focus and blur events are natively dispatched
      window.focus()

      ready = (callback) ->
        if template?
          helpers.setFixture(template, callback)
        else
          callback()
      setup?()

    afterEach = ->
      if template?
        helpers.clearFixture()
      teardown?()

    if callback?
      QUnit.module name, (hooks) ->
        hooks.beforeEach(beforeEach)
        hooks.afterEach(afterEach)
        callback()
    else
      QUnit.module(name, {beforeEach, afterEach})

  test: (name, callback) ->
    QUnit.test name, (assert) ->
      doneAsync = assert.async()

      ready (element) ->
        done = (expectedDocumentValue) ->
          if element?
            if expectedDocumentValue
              assert.equal element.editor.getDocument().toString(), expectedDocumentValue
            requestAnimationFrame(doneAsync)
          else
            doneAsync()

        if callback.length is 0
          callback()
          done()
        else
          callback(done)

  skip: QUnit.skip
