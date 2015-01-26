require 'trix/engine' if defined?(Rails)

module Trix
  def self.asset_path
    File.expand_path('../../src', __FILE__)
  end
end
