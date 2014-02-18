require 'fileutils'
require 'json'
require 'shellwords'

task :clean do
  FileUtils.rm_rf "dist"
  FileUtils.mkdir_p "dist"
end

task :build do
  `sprockets -I src -o dist src/rich_text.coffee src/rich_text.html.erb`
  manifest_file = Dir["dist/manifest*.json"].first
  manifest = JSON.parse(File.read(manifest_file))
  FileUtils.ln_sf manifest["assets"]["rich_text.html"], "dist/rich_text.html"
end

task :open => [:clean, :build] do
  `open -a Safari dist/rich_text.html`
end

task :test => :build do
  `sprockets -I src -I test test/rich_text/test.coffee > test/test.js`
  `open -a Safari test/test.html`
end

task :default => :open

task :loc do
  puts `find src -name '*.coffee' -type f | xargs sed -n '/^ *\\(#.*\\)*\$/!p' | wc -l`
end

