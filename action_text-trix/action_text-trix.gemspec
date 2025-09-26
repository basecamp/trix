require_relative "lib/action_text/trix/version"

Gem::Specification.new do |spec|
  spec.name     = "action_text-trix"
  spec.version  = Trix::VERSION
  spec.authors  = "37signals, LLC"
  spec.summary  = "A rich text editor for everyday writing"
  spec.license  = "MIT"

  spec.homepage                    = "https://github.com/basecamp/trix"
  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"]   = "#{spec.homepage}/releases"

  spec.metadata["rubygems_mfa_required"] = "true"

  spec.files = [
    "LICENSE",
    "app/assets/javascripts/trix.js",
    "app/assets/stylesheets/trix.css",
    "lib/action_text/trix.rb",
    "lib/action_text/trix/engine.rb",
    "lib/action_text/trix/version.rb"
  ]

  spec.add_dependency "railties"
end
