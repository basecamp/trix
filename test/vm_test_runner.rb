require "rest-client"
require "aws/s3"
require "uri"

module Trix
  class VMTestRunner
    # https://saucelabs.com/platforms
    PLATFORMS = [
      ["Windows 8", "googlechrome", "38"],
      ["OS X 10.9", "safari", "7"]
    ]

    SAUCE_PARAMS = {
      framework: "qunit",
      max_duration: 30,
      platforms: PLATFORMS
    }

    S3_BUCKET = "basecamp-trix"

    attr_reader :environment

    def initialize(environment)
      @environment = environment

      AWS::S3::Base.establish_connection!(
        access_key_id: ENV['TRIX_S3_KEY'],
        secret_access_key: ENV['TRIX_S3_SECRET']
      )
    end

    def run
      upload_dist
      start_tests
      poll_for_completion
    ensure
      finalize
    end

    private
      def upload_dist
        environment.assets.each do |logical_path|
          file_name = "#{rev}/#{logical_path}"
          file_data = File.read(environment.dist_path_for(logical_path))
          AWS::S3::S3Object.store(file_name, file_data, S3_BUCKET, access: :public_read)
          url = AWS::S3::S3Object.url_for(file_name, S3_BUCKET, authenticated: false)
          @test_url = url if logical_path == "test.html"
        end
      end

      def start_tests
        response = RestClient.post(sauce_url("js-tests"), SAUCE_PARAMS.merge(url: @test_url).to_json)
        @test_params = JSON.parse(response)
      end

      def poll_for_completion
        print "Running..."
        completed = false
        until completed
          sleep 1
          response = RestClient.post(sauce_url("js-tests/status"), @test_params.to_json)
          status = JSON.parse(response)
          if status["completed"]
            puts "."
            completed = true
            print_results(status["js tests"])
          else
            print "."
          end
        end
      end

      def print_results(results)
        successes = results.select { |r| r["result"]["failed"] == 0 }
        failures = results - successes

        if successes.any?
          successes.each do |success|
            puts " ✓ #{success["platform"].join(", ")}"
          end
        end

        if failures.any?
          failures.each do |failure|
            puts " ✗ #{failure["platform"].join(", ")}"
            failure["result"]["failures"].each do |fail|
              puts "   #{fail["module"]} - #{fail["name"]}"
              puts "   expected: #{fail["expected"]}"
              puts "     actual: #{fail["actual"]}"
              puts "     source: #{fail["source"]}"
              puts
            end
          end
        end
      end

      def finalize
        AWS::S3::Bucket.objects(S3_BUCKET, prefix: rev).each(&:delete)
      end

      def rev
        @rev ||= `git rev-parse HEAD`.chomp
      end

      def sauce_url(path = "")
        user = ENV['SAUCE_USERNAME']
        key = ENV['SAUCE_ACCESS_KEY']
        URI.join("https://#{user}:#{key}@saucelabs.com/rest/v1/#{user}/", path).to_s
      end
  end
end
