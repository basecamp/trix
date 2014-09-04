require 'trix'
require 'pathname'
require 'sprockets'
require 'coffee-script'

module Trix
  class Environment
    attr_writer :paths
    attr_writer :assets

    def initialize(root = ".")
      @root = root
    end

    def sprockets_environment
      @sprockets_environment ||= Sprockets::Environment.new do |env|
        paths.each do |path|
          env.append_path(path)
        end
      end
    end

    def manifest
      @manifest ||= Sprockets::Manifest.new(sprockets_environment.index, build_path)
    end

    def compile
      manifest.compile(assets)
    end

    def dist
      clean
      compile

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

    def project_root
      Pathname.new(File.dirname(__FILE__) + "/../..")
    end

    def build_path
      project_root.join(".assets")
    end

    def dist_path
      root.join("dist")
    end

    def root
      project_root.join(@root || ".")
    end

    def paths
      (@paths || []).map { |path| root.join(path) }
    end

    def assets
      @assets || []
    end

    def path_for(file)
      root.join(file).to_s
    end

    def dist_path_for(file)
      dist_path.join(file).to_s
    end
  end
end
