require 'pathname'
require 'sprockets'
require 'coffee-script'

module Trix
  class << self
    def environment
      @environment ||= Sprockets::Environment.new do |env|
        env.append_path(source_path)
        env.append_path(assets_path)
      end
    end

    def manifest
      @manifest ||= Sprockets::Manifest.new(environment.index, build_path)
    end

    def build
      manifest.compile(assets)
    end

    def install
      build
      remove_dist_path
      assets.each do |logical_path|
        install_asset(logical_path)
      end
    end

    def install_asset(logical_path)
      create_dist_path
      fingerprint_path = manifest.assets[logical_path]
      FileUtils.cp(build_path.join(fingerprint_path), dist_path.join(logical_path))
    end

    def clean
      remove_build_path
      remove_dist_path
    end

    def remove_build_path
      FileUtils.rm_rf(build_path)
    end

    def create_dist_path
      FileUtils.mkdir_p(dist_path)
    end

    def remove_dist_path
      FileUtils.rm_rf(dist_path)
    end

    def assets
      %w( trix.js index.html )
    end

    def root
      Pathname.new(File.dirname(__FILE__) + "/..")
    end

    def source_path
      root.join("src")
    end

    def assets_path
      root.join("assets")
    end

    def build_path
      root.join(".assets")
    end

    def dist_path
      root.join("dist")
    end
  end
end
