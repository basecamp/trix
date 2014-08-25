require 'digest/md5'
require 'json'
require 'rack/request'
require 'rack/file'

module Trix
  class AttachmentServer
    class << self
      attr_accessor :root

      def call(env)
        new(env).respond
      end
    end

    def initialize(env)
      @request = Rack::Request.new(env)
    end

    def respond
      case
      when @request.post?
        if key = store_file
          response_for_key(key)
        else
          bad_request
        end
      when @request.get?
        serve_file
      else
        bad_request
      end
    end

    private
      def root
        self.class.root
      end

      def store_file
        return unless file = @request.body.read
        root.mkpath

        key = Digest::MD5.hexdigest(file)
        IO.write(root.join(key), file)
        IO.write(root.join("#{key}.json"), JSON.dump(@request.params))
        key
      end

      def response_for_key(key)
        response = JSON.dump(identifier: key, url: "/attachments/#{key}")
        [200, {'Content-Type' => 'application/json'}, [response]]
      end

      def bad_request
        [400, {}, []]
      end

      def serve_file
        Rack::File.new(root, {}, metadata['contentType']).call(@request.env)
      end

      def metadata
        @metadata ||= begin
          filename = @request.path_info.gsub(/^\//, '') + '.json'
          path = root.join(filename)
          path.readable? ? JSON.parse(path.read) : {}
        end
      end
  end
end
