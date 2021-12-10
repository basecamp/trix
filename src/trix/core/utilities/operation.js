/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Operation;
import BasicObject from "trix/core/basic_object";

export default Operation = (function() {
  Operation = class Operation extends BasicObject {
    static initClass() {
  
      this.proxyMethod("getPromise().then");
      this.proxyMethod("getPromise().catch");
    }
    isPerforming() {
      return this.performing === true;
    }

    hasPerformed() {
      return this.performed === true;
    }

    hasSucceeded() {
      return this.performed && this.succeeded;
    }

    hasFailed() {
      return this.performed && !this.succeeded;
    }

    getPromise() {
      return this.promise != null ? this.promise : (this.promise = new Promise((resolve, reject) => {
        this.performing = true;
        return this.perform((succeeded, result) => {
          this.succeeded = succeeded;
          this.performing = false;
          this.performed = true;

          if (this.succeeded) {
            return resolve(result);
          } else {
            return reject(result);
          }
        });
      }));
    }

    perform(callback) {
      return callback(false);
    }

    release() {
      this.promise?.cancel?.();
      this.promise = null;
      this.performing = null;
      this.performed = null;
      return this.succeeded = null;
    }
  };
  Operation.initClass();
  return Operation;
})();
