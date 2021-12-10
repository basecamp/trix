/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import View from "inspector/view";

Trix.Inspector.registerView((function() {
  const Cls = class extends View {
    static initClass() {
      this.prototype.title = "Renders";
      this.prototype.template = "render";
      this.prototype.events = {
        "trix-render"() {
          this.renderCount++;
          return this.render();
        },
  
        "trix-sync"() {
          this.syncCount++;
          return this.render();
        }
      };
    }

    constructor() {
      super(...arguments);
      this.renderCount = 0;
      this.syncCount = 0;
    }

    getTitle() {
      return `${this.title} (${this.renderCount})`;
    }
  };
  Cls.initClass();
  return Cls;
}
)());
