import BasicObject from "trix/core/basic_object"

export default class Operation extends BasicObject {
  isPerforming() {
    return this.performing === true
  }

  hasPerformed() {
    return this.performed === true
  }

  hasSucceeded() {
    return this.performed && this.succeeded
  }

  hasFailed() {
    return this.performed && !this.succeeded
  }

  getPromise() {
    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.performing = true
        return this.perform((succeeded, result) => {
          this.succeeded = succeeded
          this.performing = false
          this.performed = true

          if (this.succeeded) {
            resolve(result)
          } else {
            reject(result)
          }
        })
      })
    }

    return this.promise
  }

  perform(callback) {
    return callback(false)
  }

  release() {
    this.promise?.cancel?.()
    this.promise = null
    this.performing = null
    this.performed = null
    this.succeeded = null
  }
}

Operation.proxyMethod("getPromise().then")
Operation.proxyMethod("getPromise().catch")
