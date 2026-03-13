# frozen_string_literal: true

require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  driven_by :cuprite, using: :chrome, options: {
    js_errors: true,
    headless: ENV["HEADLESS"] != "0"
  }

  def capture_events(event_names)
    execute_script <<~JS, *event_names
      window.capturedEvents = []

      function capture({ target: { id }, type, detail }) {
        for (const name in detail) {
          detail[name] = detail[name].constructor.name
        }

        capturedEvents.push({ id, type, detail })
      }

      for (const eventName of arguments) {
        addEventListener(eventName, capture, { once: true })
      }
    JS

    yield

    evaluate_script("window.capturedEvents").each do |event|
      event["target"] = find(id: event.delete("id"))
    end
  end

  def go_offline!
    page.driver.browser.network.emulate_network_conditions(offline: true)
  end
end

Capybara.server = :puma, { Silent: true }
