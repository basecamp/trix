import Operation from "trix/core/utilities/operation"

export default class ImagePreloadOperation extends Operation {
  constructor(url) {
    super(...arguments)
    this.url = url
  }

  perform(callback) {
    const image = new Image()

    image.onload = () => {
      image.width = this.width = image.naturalWidth
      image.height = this.height = image.naturalHeight
      return callback(true, image)
    }

    image.onerror = () => callback(false)

    image.src = this.url
  }
}
