require 'bundler/setup'
require File.join(File.dirname(__FILE__) + '/lib/trix')

task :clean do
  Trix.clean
end

task :dist do
  Trix.install
end

task :loc do
  puts `find src -name '*.coffee' -type f | xargs sed -n '/^ *\\(#.*\\)*\$/!p' | wc -l`
end

task :default => :dist

