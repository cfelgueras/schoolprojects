#!/usr/bin/ruby
# encoding: utf-8
# Builds dist/ for publishing the site as a claude.ai artifact.
# - index.html becomes a fragment (the artifact host adds doctype/head/body).
# - Everything the site loads is copied; source PDFs, tools and reviews are not.
# Prints the list of published files (relative to dist/).
require "fileutils"
Encoding.default_external = Encoding::UTF_8

root = File.expand_path("..", __dir__)
site = File.join(root, "site")
dist = File.join(root, "dist")
FileUtils.rm_rf(dist)
FileUtils.mkdir_p(dist)

%w[topic.html prep.html].each { |f| FileUtils.cp(File.join(site, f), dist) }
%w[assets content].each { |d| FileUtils.cp_r(File.join(site, d), dist) }
FileUtils.mkdir_p(File.join(dist, "vendor/katex/fonts"))
FileUtils.mkdir_p(File.join(dist, "vendor/marked"))
FileUtils.cp(File.join(site, "vendor/katex/katex.min.js"), File.join(dist, "vendor/katex"))
FileUtils.cp(File.join(site, "vendor/katex/katex.min.css"), File.join(dist, "vendor/katex"))
FileUtils.cp(Dir[File.join(site, "vendor/katex/fonts/*.woff2")], File.join(dist, "vendor/katex/fonts"))
FileUtils.cp(File.join(site, "vendor/marked/marked.min.js"), File.join(dist, "vendor/marked"))

html = File.read(File.join(site, "index.html"))
head = html[%r{<head>(.*?)</head>}m, 1]
body = html[%r{<body>(.*?)</body>}m, 1]
head = head.lines.reject { |l| l =~ /<meta (charset|name="viewport")/ }.join
File.write(File.join(dist, "index.html"), head.strip + "\n\n" + body.strip + "\n")

files = Dir.glob("**/*", base: dist).select { |f| File.file?(File.join(dist, f)) && f != "index.html" }.sort
File.write(File.join(dist, ".files.json"), files.to_s)
puts "#{files.size} supporting files, #{(Dir.glob(File.join(dist, '**/*')).sum { |f| File.file?(f) ? File.size(f) : 0 } / 1024.0 / 1024).round(1)} MB"
