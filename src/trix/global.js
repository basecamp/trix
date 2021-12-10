import { version } from "../../package.json";
import config from "trix/config";

const Trix = {
  VERSION: version,
  config
};

window.Trix = Trix;

export default Trix;
