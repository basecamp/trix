require 'bundler/setup'
require File.join(File.dirname(__FILE__) + '/lib/trix')

def has_phantomjs?
  `which phantomjs` && $?.success?
end

namespace :trix do
  environment = Trix::Environment.new(".")
  environment.paths = %w( assets src )
  environment.assets = %w( basecamp.png index.html trix.js )

  desc "Clean Trix distribution"
  task :clean do
    environment.clean
  end

  desc "Build Trix distribution"
  task :dist do
    environment.dist
  end

  desc "Open Trix demo in a browser"
  task :browser => :dist do
    system "open", environment.dist_path_for("index.html")
  end
end

namespace :test do
  environment = Trix::Environment.new("test")
  environment.paths = %w( assets src vendor ../src )
  environment.assets = %w( test.css test.html test.js )

  desc "Clean Trix tests"
  task :clean do
    environment.clean
  end

  desc "Build Trix tests"
  task :dist do
    environment.dist
  end

  desc "Open Trix tests in a browser"
  task :browser => :dist do
    system "open", environment.dist_path_for("test.html")
  end

  desc "Run Trix tests in PhantomJS"
  task :phantomjs => :dist do
    runner = environment.path_for("vendor/runner-list.js")
    page = environment.dist_path_for("test.html")

    if has_phantomjs?
      puts "\n# Running:\n"
      system "phantomjs", runner, page
    else
      abort "Please install PhantomJS"
    end
  end

  if has_phantomjs?
    task :auto => :phantomjs

    desc "Listen for file changes and run Trix tests in PhantomJS"
    task :listen do
      require "listen"

      Listen.to("src/", "test/src", "lib") do |modified, added, removed|
        files = modified + added + removed
        puts "\nModified: #{files.join(', ')}"
        puts "Starting tests..."
        system "bin/rake test:auto"
      end.start

      sleep
    end
  else
    task :auto => :browser
  end
end

task :default => "test:auto"
