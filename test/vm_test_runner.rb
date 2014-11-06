require "rest-client"
require "aws-sdk"
require "pathname"
require "timeout"

module Trix
  class VMTestRunner
    # http://saucelabs.com/rest/v1/info/platforms/webdriver
    PLATFORMS = [
      ["Windows 2012 R2", "internet explorer", "11"],
      ["Mac 10.9", "safari", "7"],
      ["Mac 10.9", "firefox", "33"],
      ["Mac 10.9", "googlechrome", "38"],
      ["Mac 10.9", "iPad", "8.1"],
      ["Linux", "googlechrome", "38"]
    ]

    MAX_VM_SECONDS = 90
    MAX_TOTAL_SECONDS = 300

    SAUCE_PARAMS = {
      framework: "qunit",
      max_duration: 90,
      platforms: PLATFORMS
    }

    S3_BUCKET = "trix-tests"
    TRIX_TEST_FILE = "test.html"

    attr_reader :environment

    def initialize(environment)
      @environment = environment
    end

    def run
      Timeout::timeout(MAX_TOTAL_SECONDS) do
        upload_dist
        start_tests
        poll_for_completion
      end
    end

    private
      def upload_dist
        environment.assets.each do |logical_path|
          file_name = "#{rev}/#{logical_path}"
          file_path = Pathname.new(environment.dist_path_for(logical_path))
          bucket.objects[file_name].write(file_path)
        end
      end

      def start_tests
        print "Running tests @ #{test_url} in #{PLATFORMS.size} browsers."
        @js_test_params = post("/js-tests", SAUCE_PARAMS.merge(url: test_url, build: rev))
      end

      def poll_for_completion
        completed = false
        count = 0

        until completed
          if (count += 1) <= 5
            sleep 2
          else
            sleep 1
          end

          status = post("/js-tests/status", @js_test_params)
          if status["completed"]
            completed = true
            handle_results(status["js tests"])
          else
            print "."
          end
        end
      end

      def handle_results(results)
        successes = results.select { |r| r["result"]["failed"] == 0 }
        failures = results - successes
        print_results(successes, failures)
        exit(failures.any? ? 1 : 0)
      end

      def print_results(successes = [], failures = [])
        puts

        successes.each do |success|
          print_result(success, "✓")
        end

        failures.each do |failure|
          print_result(failure, "✗")
          (failure["result"]["failures"] || []).each do |fail|
            puts "   #{fail["module"]} - #{fail["name"]}"
            puts "   expected: #{fail["expected"]}"
            puts "     actual: #{fail["actual"]}"
            puts "     source: #{fail["source"]}"
            puts
          end
        end
      end

      def print_result(result, mark = "")
        details = result["result"]
        puts
        puts " #{mark} #{result["platform"].join(", ")}"
        puts "   #{details["passed"]} passed, #{details["failed"]} failed in #{details["runtime"]}ms"
      end

      def test_url
        File.join(bucket.url(secure: true), rev, TRIX_TEST_FILE)
      end

      def rev
        @rev ||= `git rev-parse HEAD`.chomp
      end

      def post(endpoint = "", params = {})
        response = RestClient.post(sauce_url(endpoint), params.to_json)
        JSON.parse(response)
      end

      def sauce_url(path = "")
        user = ENV['SAUCE_USERNAME']
        key = ENV['SAUCE_ACCESS_KEY']
        File.join("https://#{user}:#{key}@saucelabs.com/rest/v1/#{user}/", path)
      end

      def s3
        @s3 ||= AWS::S3.new access_key_id: ENV['TRIX_S3_KEY'], secret_access_key: ENV['TRIX_S3_SECRET']
      end

      def bucket
        @bucket ||= begin
          bucket = s3.buckets[S3_BUCKET]
          if bucket.exists?
            bucket
          else
            create_bucket
          end
        end
      end

      def create_bucket
        bucket = s3.buckets.create(S3_BUCKET)
        configure_bucket_for_public_read(bucket)
        bucket
      end

      def configure_bucket_for_public_read(bucket)
        bucket.lifecycle_configuration.update do
          add_rule(nil, expiration_time: 1) # days
        end

        policy = AWS::S3::Policy.new
        policy.allow(actions: [:get_object], resources: "arn:aws:s3:::#{S3_BUCKET}/*", principals: :any)
        bucket.policy = policy

        bucket
      end
  end
end
