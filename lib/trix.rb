require 'pathname'
require 'sprockets'
require 'coffee-script'

module Trix
  class << self
    def environment
      @environment ||= Sprockets::Environment.new do |env|
        env.append_path(source_path)
        env.append_path(assets_path)
        env.append_path(test_path)
      end
    end

    def manifest
      @manifest ||= Sprockets::Manifest.new(environment.index, build_path)
    end

    def build
      manifest.compile(assets + test_assets)
    end

    def install
      clean
      build

      assets.each do |logical_path|
        install_asset(logical_path, dist_path)
      end

      test_assets.each do |logical_path|
        install_asset(logical_path, test_path)
      end
    end

    def install_asset(logical_path, destination)
      create_dist_path
      fingerprint_path = manifest.assets[logical_path]
      FileUtils.cp(build_path.join(fingerprint_path), destination.join(logical_path))
    end

    def clean
      remove_build_path
      remove_dist_path
      remove_test_assets
    end

    def test
      install

      runner = test_path.join("vendor/runner-list.js").to_s
      page = test_path.join("index.html").to_s

      puts "\n# Running:\n"
      system "phantomjs", runner, page
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

    def remove_test_assets
      test_assets.each do |logical_path|
        FileUtils.rm_f(test_path.join(logical_path))
      end
    end

    def assets
      %w( trix.js index.html basecamp.png )
    end

    def test_assets
      %w( tests.js )
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

    def test_path
      root.join("test")
    end
  end
end
