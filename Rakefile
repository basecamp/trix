require 'fileutils'
require 'json'
require 'shellwords'

task :clean do
  FileUtils.rm_rf "demo"
  FileUtils.mkdir_p "demo"
end

task :build do
  `sprockets -I src -o demo src/trix.coffee src/trix.html.erb`
  manifest_file = Dir["demo/manifest*.json"].first
  manifest = JSON.parse(File.read(manifest_file))
  FileUtils.ln_sf manifest["assets"]["trix.html"], "demo/trix.html"
end

task :open => [:clean, :build] do
  `open -a Safari demo/trix.html`
end

task :default => :open
