import { version } from "../../package.json"

export default {
  init: async () => {
    const [
      config,
      core,
      models,
      views,
      controllers,
      observers,
      operations,
      filters,
      elements
    ] = await Promise.all([
      import("trix/config"),
      import("trix/core"),
      import("trix/models"),
      import("trix/views"),
      import("trix/controllers"),
      import("trix/observers"),
      import("trix/operations"),
      import("trix/filters"),
      import("trix/elements")
    ]);

    const Trix = {
      VERSION: version,
      config,
      core,
      models,
      views,
      controllers,
      observers,
      operations,
      elements,
      filters
    };

    // Expose models under the Trix constant for compatibility with v1
    Object.assign(Trix, models);

    window.Trix = Trix;

    function start() {
      console.log('Defining custom elements');
      if (!customElements.get("trix-editor")) {
        customElements.define("trix-editor", elements.TrixEditorElement);
      }

      if (!customElements.get("trix-toolbar")) {
        customElements.define("trix-toolbar", elements.TrixToolbarElement);
      }
    }

    setTimeout(start, 0);
    return Trix;
  }
}
