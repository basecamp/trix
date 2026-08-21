# frozen_string_literal: true

require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  driven_by :cuprite, using: :chrome, options: {
    js_errors: true,
    headless: ENV["HEADLESS"] != "0",
    # Ferrum's 10s default is too tight for Chrome to boot on loaded CI runners
    process_timeout: 60
  }
end

Capybara.server = :puma, { Silent: true }
