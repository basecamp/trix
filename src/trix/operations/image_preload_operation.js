/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Operation from "trix/core/utilities/operation";

export default class ImagePreloadOperation extends Operation {
  constructor(url) {
    super(...arguments);
    this.url = url;
  }

  perform(callback) {
    const image = new Image;

    image.onload = () => {
      image.width = (this.width = image.naturalWidth);
      image.height = (this.height = image.naturalHeight);
      return callback(true, image);
    };

    image.onerror = () => callback(false);

    return image.src = this.url;
  }
}
