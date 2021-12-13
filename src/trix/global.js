// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { version } from "../../package.json"
import config from "trix/config"

const Trix = {
  VERSION: version,
  config,
}

window.Trix = Trix

export default Trix
