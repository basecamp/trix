require "rest-client"
require "aws-sdk"
require "pathname"
require "timeout"

module Trix
  class VMTestRunner
    TESTS = [
      { browser: "Safari",            version_depth: 2, platforms: ["Mac", "Windows"] },
      { browser: "Google Chrome",     version_depth: 2, platforms: ["Mac", "Windows"] },
      { browser: "Internet Explorer", version_depth: 1, platforms: ["Windows"] },
      { browser: "iPad",              version_depth: 1, platforms: ["Mac"] },
      { browser: "Android",           version_depth: 1, platforms: ["Linux"] }
    ]

    MAX_VM_SECONDS = 60 * 4
    MAX_TOTAL_SECONDS = 60 * 20

    MAX_REQUEST_SECONDS = 30

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
        print "Running tests @ #{test_url} in #{platforms.size} browsers."
        @js_test_params = post_to_sauce("/js-tests", test_params)
      end

      def test_params
        { url: test_url, build: rev, platforms: platforms, framework: "qunit", max_duration: MAX_VM_SECONDS }
      end

      def poll_for_completion
        completed = false
        count = 0

        until completed
          if (count += 1) <= 5
            sleep 3
          else
            sleep 2
          end

          status = post_to_sauce("/js-tests/status", @js_test_params)
          if status["completed"]
            completed = true
            handle_results(status["js tests"])
          else
            print "."
          end
        end
      end

      def handle_results(results)
        incompletes = results.select { |r| r["result"].nil? }
        successes = (results - incompletes).select { |r| r["result"]["failed"] == 0 }
        failures = results - incompletes - successes
        print_results(successes, failures, incompletes)
        exit(failures.any? || incompletes.any? ? 1 : 0)
      end

      def print_results(successes = [], failures = [], incompletes = [])
        puts

        successes.each do |success|
          print_result(success, "✓")
        end

        failures.each do |failure|
          print_result(failure, "✗")
          (failure["result"]["failures"] || []).each do |fail|
            puts "   #{fail["module"]} - #{fail["name"]}"
            puts "    message: #{fail["message"]}" if fail["message"]
            puts "   expected: #{fail["expected"]}" if fail["expected"]
            puts "     actual: #{fail["actual"]}" if fail["actual"]
            puts "     source: #{fail["source"]}" if fail["source"]
            puts
          end
        end

        incompletes.each do |incomplete|
          puts " ? Incomplete: #{incomplete}"
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

      def post_to_sauce(endpoint = "", params = {})
        response = request(sauce_url(endpoint), method: :post, payload: params.to_json)
        JSON.parse(response)
      end

      def sauce_url(path = "")
        user = ENV['SAUCE_USERNAME']
        key = ENV['SAUCE_ACCESS_KEY']
        File.join("https://#{user}:#{key}@saucelabs.com/rest/v1/#{user}/", path)
      end

      def available_platforms
        JSON.parse(request("http://saucelabs.com/rest/v1/info/platforms/webdriver", method: :get))
      end

      def platforms
        @platforms ||= [].tap do |platforms|
          TESTS.each do |test|
            for_browser = available_platforms.select { |p| p["long_name"] == test[:browser] }
            versions = for_browser.map { |p| p["short_version"].to_f }.sort.uniq.last(test[:version_depth])
            versions.each do |version|
              test[:platforms].each do |os|
                for_os = for_browser.select { |p| p["os"] =~ Regexp.new(os) && p["short_version"].to_f == version }
                if platform = for_os.sort_by { |p| p["os"] }.last
                  platforms.push([platform["os"], platform["api_name"], platform["short_version"]])
                end
              end
            end
          end
        end
      end

      def request(url, options = {})
        options.merge! url: url, timeout: MAX_REQUEST_SECONDS, open_timeout: MAX_REQUEST_SECONDS
        tries ||= 3
        RestClient::Request.execute(options)
      rescue
        sleep 1 and retry unless (tries -= 1).zero?
        raise
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
