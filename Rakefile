require 'bundler/setup'
require File.join(File.dirname(__FILE__) + '/lib/trix')

def with_server
  begin
    pid = spawn "bin/rackup config.ru"
    sleep 2
    yield
    trap("INT") { Process.kill "INT", pid }
    Process.waitpid pid
  end
end

task :clean do
  Trix.clean
end

task :dist do
  Trix.install
end

task :open do
  with_server do
    sh "open", "http://localhost:9292/"
  end
end

task :default => :open

task :loc do
  puts `find src -name '*.coffee' -type f | xargs sed -n '/^ *\\(#.*\\)*\$/!p' | wc -l`
end
