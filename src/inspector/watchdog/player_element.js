/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { registerElement } from "trix/core/helpers";

import Recording from "inspector/watchdog/recording";
import PlayerController from "inspector/watchdog/player_controller";

registerElement("trix-watchdog-player", {
  defaultCSS: `\
%t > div { display: -webkit-flex; display: flex; font-size: 14px; margin: 10px 0 }
%t > div > button { width: 65px }
%t > div > input { width: 100%; -webkit-align-self: stretch; align-self: stretch; margin: 0 20px }
%t > div > span { display: inline-block; text-align: center; width: 110px }\
`,

  attachedCallback() {
    let url;
    if (url = this.getAttribute("src")) {
      return this.fetchRecordingAtURL(url);
    }
  },

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (attributeName === "src") {
      return this.fetchRecordingAtURL(newValue);
    }
  },

  fetchRecordingAtURL(url) {
    this.activeRequest?.abort();
    this.activeRequest = new XMLHttpRequest;
    this.activeRequest.open("GET", url);
    this.activeRequest.send();
    return this.activeRequest.onload = () => {
      const json = this.activeRequest.responseText;
      this.activeRequest = null;
      const recording = Recording.fromJSON(JSON.parse(json));
      return this.loadRecording(recording);
    };
  },

  loadRecording(recording) {
    return this.controller = new PlayerController(this, recording);
  }
}
);
