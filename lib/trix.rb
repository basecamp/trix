require 'pathname'
require 'sprockets'
require 'coffee-script'

module Trix
  class << self
    def environment
      @environment ||= Sprockets::Environment.new do |env|
        env.append_path(source_path)
        env.append_path(assets_path)
        env.append_path(test_assets_path)
        env.append_path(test_path)
      end
    end

    def manifest
      @manifest ||= Sprockets::Manifest.new(environment.index, build_path)
    end

    def build
      manifest.compile(all_assets)
    end

    def install
      clean
      build

      all_assets.each do |logical_path|
        install_asset(logical_path)
      end
    end

    def install_asset(logical_path)
      create_dist_paths
      fingerprint_path = manifest.assets[logical_path]
      destination = test_assets.include?(logical_path) ? test_dist_path : dist_path
      FileUtils.cp(build_path.join(fingerprint_path), destination.join(logical_path))
    end

    def clean
      remove_build_path
      remove_dist_paths
    end

    def test
      install

      runner = test_path.join("vendor/runner-list.js").to_s
      page = test_dist_path.join("tests.html").to_s

      puts "\n# Running:\n"
      system "phantomjs", runner, page
    end

    def remove_build_path
      FileUtils.rm_rf(build_path)
    end

    def create_dist_paths
      FileUtils.mkdir_p(dist_paths)
    end

    def remove_dist_paths
      FileUtils.rm_rf(dist_paths)
    end

    def dist_paths
      [dist_path, test_dist_path]
    end

    def assets
      %w( trix.js index.html basecamp.png )
    end

    def test_assets
      %w( tests.js tests.html )
    end

    def all_assets
      assets + test_assets
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

    def test_assets_path
      test_path.join("assets")
    end

    def test_dist_path
      test_path.join("dist")
    end
  end
end
