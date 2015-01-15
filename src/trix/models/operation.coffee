{forwardMethods} = Trix.Helpers

class Trix.Operation
  forwardMethods ofConstructor: Promise, onConstructor: this, toMethod: "getPromise"

  isPerforming: ->
    @performing is true

  hasPerformed: ->
    @performed is true

  hasSucceeded: ->
    @performed and @succeeded

  hasFailed: ->
    @performed and not @succeeded

  getPromise: ->
    @promise ?= new Promise (resolve, reject) =>
      @performing = true
      @perform (@succeeded, value) =>
        delete @performing
        @performed = true

        if @succeeded
          resolve(value)
        else
          reject(value)

  perform: (callback) ->
    callback(false)

  release: ->
    @promise?.cancel()
    delete @promise
    delete @performing
    delete @performed
    delete @succeeded
