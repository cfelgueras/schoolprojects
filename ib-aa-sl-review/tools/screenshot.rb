#!/usr/bin/ruby
# Opens pages in Safari (WebDriver) at several widths, saves screenshots and
# reports horizontal overflow. Needs: safaridriver running on port 4444,
# Safari > Develop > Allow Remote Automation, and the local preview server.
#
# Usage: ruby tools/screenshot.rb <out_dir> <path> [<path> ...]
#   e.g. ruby tools/screenshot.rb /tmp/shots "index.html" "topic.html?t=quadratics#practice"
require "net/http"
require "json"
require "base64"

OUT = ARGV.shift or abort "usage: screenshot.rb <out_dir> <path>..."
WIDTHS = { "phone" => [375, 812], "tablet" => [768, 1024], "desktop" => [1280, 900] }
BASE = "http://127.0.0.1:8000/"
Dir.mkdir(OUT) unless Dir.exist?(OUT)

def wd(method, path, body = nil)
  http = Net::HTTP.new("127.0.0.1", 4444)
  http.read_timeout = 60
  req = (method == :post ? Net::HTTP::Post : method == :delete ? Net::HTTP::Delete : Net::HTTP::Get).new(path, "Content-Type" => "application/json")
  req.body = body.to_json if body
  JSON.parse(http.request(req).body)["value"]
end

sid = wd(:post, "/session", { capabilities: { alwaysMatch: { browserName: "safari" } } })["sessionId"]
begin
  ARGV.each do |page|
    WIDTHS.each do |name, (w, h)|
      wd(:post, "/session/#{sid}/window/rect", { width: w, height: h, x: 0, y: 0 })
      wd(:post, "/session/#{sid}/url", { url: BASE + page })
      sleep 1.5
      script = <<~JS
        const d = document.documentElement;
        const wide = [...document.querySelectorAll("body *")]
          .filter(e => e.getBoundingClientRect().right > d.clientWidth + 1 && !e.closest(".math-display,.table-scroll,.topicbar,.ms"))
          .slice(0, 5).map(e => e.tagName.toLowerCase() + "." + [...e.classList].join("."));
        return { viewport: d.clientWidth, scrollWidth: d.scrollWidth, wide: wide, katexErrors: document.querySelectorAll(".katex-error").length };
      JS
      info = wd(:post, "/session/#{sid}/execute/sync", { script: script, args: [] })
      png = Base64.decode64(wd(:get, "/session/#{sid}/screenshot"))
      file = File.join(OUT, page.gsub(/[^a-z0-9]+/i, "_") + "-" + name + ".png")
      File.binwrite(file, png)
      flag = info["scrollWidth"] > info["viewport"] ? "OVERFLOW" : "ok"
      puts "#{flag}  #{name.ljust(7)} #{page}  viewport=#{info['viewport']} scroll=#{info['scrollWidth']} katexErrors=#{info['katexErrors']} #{info['wide'].empty? ? '' : 'wide=' + info['wide'].join(',')}"
    end
  end
ensure
  wd(:delete, "/session/#{sid}")
end
