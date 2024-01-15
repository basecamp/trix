import { TEST_IMAGE_URL } from "./test_image_url"

export default () =>
  `<trix-editor autofocus placeholder="Say hello...">ab<img src="${TEST_IMAGE_URL}" width="10" height="10"></trix-editor>`
