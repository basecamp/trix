require 'fileutils'
require 'json'
require 'shellwords'

task :clean do
  FileUtils.rm_rf "dist"
  FileUtils.mkdir_p "dist"
end

task :build do
  `sprockets -I src -o dist src/trix.coffee src/trix.html.erb`
  manifest_file = Dir["dist/manifest*.json"].first
  manifest = JSON.parse(File.read(manifest_file))
  FileUtils.ln_sf manifest["assets"]["trix.html"], "dist/trix.html"
end

task :open => [:clean, :build] do
  `open -a Safari dist/trix.html`
end

task :test => :build do
  `sprockets -I src -I test test/trix/test.coffee > test/test.js`
  `open -a Safari test/test.html`
end

task :default => :open
