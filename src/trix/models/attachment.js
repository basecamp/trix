import * as config from "trix/config"
import TrixObject from "trix/core/object" // Don't override window.Object
import Hash from "trix/core/collections/hash"
import ImagePreloadOperation from "trix/operations/image_preload_operation"

export default class Attachment extends TrixObject {
  static previewablePattern = /^image(\/(gif|png|webp|jpe?g)|$)/

  static attachmentForFile(file) {
    const attributes = this.attributesForFile(file)
    const attachment = new this(attributes)
    attachment.setFile(file)
    return attachment
  }

  static attributesForFile(file) {
    return new Hash({
      filename: file.name,
      filesize: file.size,
      contentType: file.type,
    })
  }

  static fromJSON(attachmentJSON) {
    return new this(attachmentJSON)
  }

  constructor(attributes = {}) {
    super(attributes)
    this.releaseFile = this.releaseFile.bind(this)
    this.attributes = Hash.box(attributes)
    this.didChangeAttributes()
  }

  getAttribute(attribute) {
    return this.attributes.get(attribute)
  }

  hasAttribute(attribute) {
    return this.attributes.has(attribute)
  }

  getAttributes() {
    return this.attributes.toObject()
  }

  setAttributes(attributes = {}) {
    const newAttributes = this.attributes.merge(attributes)
    if (!this.attributes.isEqualTo(newAttributes)) {
      this.attributes = newAttributes
      this.didChangeAttributes()
      this.previewDelegate?.attachmentDidChangeAttributes?.(this)
      return this.delegate?.attachmentDidChangeAttributes?.(this)
    }
  }

  didChangeAttributes() {
    if (this.isPreviewable()) {
      return this.preloadURL()
    }
  }

  isPending() {
    return this.file != null && !(this.getURL() || this.getHref())
  }

  isPreviewable() {
    if (this.attributes.has("previewable")) {
      return this.attributes.get("previewable")
    } else {
      return Attachment.previewablePattern.test(this.getContentType())
    }
  }

  getType() {
    if (this.hasContent()) {
      return "content"
    } else if (this.isPreviewable()) {
      return "preview"
    } else {
      return "file"
    }
  }

  getURL() {
    return this.attributes.get("url")
  }

  getHref() {
    return this.attributes.get("href")
  }

  getFilename() {
    return this.attributes.get("filename") || ""
  }

  getFilesize() {
    return this.attributes.get("filesize")
  }

  getFormattedFilesize() {
    const filesize = this.attributes.get("filesize")
    if (typeof filesize === "number") {
      return config.fileSize.formatter(filesize)
    } else {
      return ""
    }
  }

  getExtension() {
    return this.getFilename()
      .match(/\.(\w+)$/)?.[1]
      .toLowerCase()
  }

  getContentType() {
    return this.attributes.get("contentType")
  }

  hasContent() {
    return this.attributes.has("content")
  }

  getContent() {
    return this.attributes.get("content")
  }

  getWidth() {
    return this.attributes.get("width")
  }

  getHeight() {
    return this.attributes.get("height")
  }

  getFile() {
    return this.file
  }

  setFile(file) {
    this.file = file
    if (this.isPreviewable()) {
      return this.preloadFile()
    }
  }

  releaseFile() {
    this.releasePreloadedFile()
    this.file = null
  }

  getUploadProgress() {
    return this.uploadProgress != null ? this.uploadProgress : 0
  }

  setUploadProgress(value) {
    if (this.uploadProgress !== value) {
      this.uploadProgress = value
      return this.uploadProgressDelegate?.attachmentDidChangeUploadProgress?.(this)
    }
  }

  toJSON() {
    return this.getAttributes()
  }

  getCacheKey() {
    return [ super.getCacheKey(...arguments), this.attributes.getCacheKey(), this.getPreviewURL() ].join("/")
  }

  // Previewable

  getPreviewURL() {
    return this.previewURL || this.preloadingURL
  }

  setPreviewURL(url) {
    if (url !== this.getPreviewURL()) {
      this.previewURL = url
      this.previewDelegate?.attachmentDidChangeAttributes?.(this)
      return this.delegate?.attachmentDidChangePreviewURL?.(this)
    }
  }

  preloadURL() {
    return this.preload(this.getURL(), this.releaseFile)
  }

  preloadFile() {
    if (this.file) {
      this.fileObjectURL = URL.createObjectURL(this.file)
      return this.preload(this.fileObjectURL)
    }
  }

  releasePreloadedFile() {
    if (this.fileObjectURL) {
      URL.revokeObjectURL(this.fileObjectURL)
      this.fileObjectURL = null
    }
  }

  preload(url, callback) {
    if (url && url !== this.getPreviewURL()) {
      this.preloadingURL = url
      const operation = new ImagePreloadOperation(url)
      return operation
        .then(({ width, height }) => {
          if (!this.getWidth() || !this.getHeight()) {
            this.setAttributes({ width, height })
          }
          this.preloadingURL = null
          this.setPreviewURL(url)
          return callback?.()
        })
        .catch(() => {
          this.preloadingURL = null
          return callback?.()
        })
    }
  }
}
