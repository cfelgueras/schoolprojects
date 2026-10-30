#!/usr/bin/ruby
# encoding: utf-8
# Revisa todo el contenido y avisa si hay fracciones escritas como "a/b"
# en vez de \frac{a}{b} o \dfrac{a}{b}.
#
# Uso (desde la carpeta del proyecto):   ruby tools/check-fractions.rb
require "json"
Encoding.default_external = Encoding::UTF_8

root = File.expand_path("../site/content", __dir__)
problems = []

check = lambda do |file, text|
  text.each_line.with_index(1) do |line, n|
    # Math segments: $$...$$ and $...$
    line.scan(/\$\$(.+?)\$\$|\$([^$]+)\$/) do |a, b|
      tex = a || b
      if tex =~ %r{(?<!\\)/}
        problems << "#{file}:#{n}  slash inside math: $#{tex}$"
      end
    end
    # Prose outside math: number/number, (…)/(…), x/2 …
    prose = line.gsub(/\$\$.+?\$\$|\$[^$]+\$/, "").gsub(%r{https?://\S+}, "").gsub(/`[^`]*`/, "")
    if prose =~ %r{(\d|\)|\b[a-z])\s*/\s*(\d|\(|[a-z]\b)}
      problems << "#{file}:#{n}  possible inline fraction in text: #{prose.strip[0, 90]}"
    end
  end
end

Dir.glob(File.join(root, "**", "*.{md,json}")).sort.each do |path|
  rel = path.sub(root + "/", "")
  next if rel == "syllabus.json"
  if path.end_with?(".json")
    strings = []
    walk = lambda do |v|
      case v
      when String then strings << v
      when Array then v.each { |x| walk.call(x) }
      when Hash then v.each { |k, x| walk.call(x) unless %w[src id].include?(k) }
      end
    end
    walk.call(JSON.parse(File.read(path)))
    check.call(rel, strings.join("\n"))
  else
    # Graph blocks hold JavaScript expressions, not displayed maths.
    check.call(rel, File.read(path).gsub(/```graph.*?```/m, ""))
  end
end

if problems.empty?
  puts "OK: no inline fractions found."
else
  puts problems
  puts "\n#{problems.size} possible problem(s). Use \\dfrac{a}{b} instead of a/b."
  exit 1
end
