/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export var extend = function(properties) {
  for (let key in properties) {
    const value = properties[key];
    this[key] = value;
  }
  return this;
};

export var after = (delay, callback) => setTimeout(callback, delay);
