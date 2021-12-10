import { version } from "../../package.json"
import config from "trix/config"

Trix =
  VERSION: version
  config: config

window.Trix = Trix

export default Trix
