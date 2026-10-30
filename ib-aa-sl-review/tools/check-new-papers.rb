#!/usr/bin/ruby
# encoding: utf-8
# Lista los PDFs de la carpeta de entrada (por defecto ~/Desktop/Claude) que
# todavía no figuran en review/processed.json.
#
# Uso: ruby tools/check-new-papers.rb [carpeta]
require "json"
Encoding.default_external = Encoding::UTF_8

inbox = ARGV[0] || File.expand_path("~/Desktop/Claude")
manifest_path = File.expand_path("../review/processed.json", __dir__)
manifest = File.exist?(manifest_path) ? JSON.parse(File.read(manifest_path)) : { "files" => {} }

pdfs = Dir.glob(File.join(inbox, "*.pdf")).sort
new_files = pdfs.reject { |p| manifest["files"].key?(File.basename(p)) }

if new_files.empty?
  puts "Nothing new in #{inbox} (#{pdfs.size} PDFs, all processed)."
else
  puts "New PDFs in #{inbox}:"
  new_files.each { |p| puts "  - #{File.basename(p)}" }
end
