# frozen_string_literal: true

require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  driven_by :cuprite, using: :chrome, options: {
    js_errors: true,
    headless: ENV["HEADLESS"] != "0"
  }
end

Capybara.server = :puma, { Silent: true }
