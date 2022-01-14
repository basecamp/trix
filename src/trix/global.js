import { version } from "../../package.json"
import config from "trix/config"
import models from "trix/models"

const Trix = {
  VERSION: version,
  config,
}

Object.assign(Trix, models)

window.Trix = Trix

export default Trix
