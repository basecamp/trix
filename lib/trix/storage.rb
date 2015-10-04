require 'bundler/setup'
require 'aws-sdk'

module Trix
  module Storage
    extend self

    S3_BUCKET = 'trix-uploads'

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
      policy.allow(actions: [:get_object, :put_object], resources: "arn:aws:s3:::#{S3_BUCKET}/*", principals: :any)
      bucket.policy = policy

      bucket.cors = AWS::S3::CORSRule.new \
        allowed_methods: ["POST"],
        allowed_origins: ["*"],
        allowed_headers: ["*"],
        max_age_seconds: 3000

      bucket
    end
  end
end
