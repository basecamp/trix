# frozen_string_literal: true

require "application_system_test_case"

class ActionTextTest < ApplicationSystemTestCase
  test "accepts rich text content" do
    visit new_message_url
    fill_in_rich_text_area with: "Hello, world!"
    click_button "Create Message"

    assert_element class: "trix-content", text: "Hello, world!"
  end

  test "attaches and uploads image file" do
    visit new_message_url
    attach_fixture_file "racecar.jpg"

    within :rich_text_area do
      assert_selector :element, "img", src: %r{/rails/active_storage/blobs/redirect/.*/racecar.jpg\Z}
    end

    click_button "Create Message"

    within class: "trix-content" do
      assert_selector :element, "img", src: %r{/rails/active_storage/representations/redirect/.*/racecar.jpg\Z}
    end
  end

  if ActionText.version >= "8.0.0"
    test "dispatches direct-upload:-prefixed events when uploading a File" do
      visit new_message_url
      events = capture_direct_upload_events do
        attach_fixture_file "racecar.jpg"

        assert_selector :element, "img", src: %r{/rails/active_storage/blobs/redirect/.*/racecar.jpg\Z}
      end

      assert_equal 1, ActiveStorage::Blob.where(filename: "racecar.jpg").count
      assert_equal direct_upload_event("start"), events[0]
      assert_equal direct_upload_event("progress", progress: "Number"), events[1]
      assert_equal direct_upload_event("end"), events[2]
    end

    test "dispatches direct-upload:error event when uploading fails" do
      visit new_message_url
      events = capture_direct_upload_events do
        accept_alert 'Error creating Blob for "racecar.jpg". Status: 0' do
          go_offline!
          attach_fixture_file "racecar.jpg"
        end

        assert_no_selector :element, "img", src: /racecar.jpg\Z/
      end

      assert_empty ActiveStorage::Blob.where(filename: "racecar.jpg")
      assert_equal direct_upload_event("error", error: "String"), events.last
    end
  end

  def attach_fixture_file(path)
    attach_file(file_fixture(path)) { click_button "Attach Files" }
  end

  def capture_direct_upload_events(&block)
    capture_events %w[
      direct-upload:start
      direct-upload:progress
      direct-upload:error
      direct-upload:end
    ], &block
  end

  def direct_upload_event(name, target: find(:rich_text_area), **detail)
    ActiveSupport::HashWithIndifferentAccess.new(
      type: "direct-upload:#{name}",
      target: target,
      detail: detail.with_defaults(
        attachment: "ManagedAttachment"
      )
    )
  end
end
