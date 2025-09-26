# frozen_string_literal: true

require "application_system_test_case"

class ActionTextTest < ApplicationSystemTestCase
  test "accepts rich text content" do
    visit new_message_url
    fill_in_rich_text_area with: "Hello, world!"
    click_button "Create Message"

    assert_element class: "trix-content", text: "Hello, world!"
  end
end
