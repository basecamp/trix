class Trix.Operation extends Trix.BasicObject
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
      @perform (@succeeded, result) =>
        @performing = false
        @performed = true

        if @succeeded
          resolve(result)
        else
          reject(result)

  perform: (callback) ->
    callback(false)

  release: ->
    @promise?.cancel?()
    @promise = null
    @performing = null
    @performed = null
    @succeeded = null

  @proxyMethod "getPromise().then"
  @proxyMethod "getPromise().catch"
