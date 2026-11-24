# encoding: utf-8
# Shared recorder for the GeoGebra videos: drives GeoGebra Classic (geogebra.org/classic) in Safari, saves a
# screenshot for every moment, generates the narration and writes rec-<video>/manifest.json for ./render.
# A video script requires this file and calls card, chapter and step. Run from this folder:
#   safaridriver -p 4444 &
#   PYTHON=/path/to/python-with-edge-tts ruby catch-the-parabola.rb
#   swiftc -O render.swift -o render && ./render rec-catch-the-parabola/manifest.json catch-the-parabola.mp4
require_relative 'wd'
require 'fileutils'
require 'json'

# frames and voice clips go to rec-<script name>/ (not committed)
OUT = 'rec-' + File.basename($PROGRAM_NAME, '.rb')
FileUtils.rm_rf(OUT); FileUtils.mkdir_p("#{OUT}/f"); FileUtils.mkdir_p("#{OUT}/a")
# neural voice through edge-tts (pip install edge-tts); PYTHON is the python that has it
PY = ENV.fetch('PYTHON', 'python3'); VOICE = 'en-GB-SoniaNeural'; RATE = '-4%'

$w = WD.new
at_exit { $w.quit rescue nil }
$w.size(1470, 779)
$w.load_ggb
$frames = []; $audio = []; $script = []; $typing = 0; $cur = [735, 380]; $chap = nil; $cap = nil; $n = 0; $t = 0.0; $steps = 0
W = $w

def snap(dur, o = {})
  $n += 1
  f = format('%s/f/%04d.png', OUT, $n)
  W.shot(f)
  $frames << { image: f, dur: dur, cur: $cur.dup, cap: $cap, chap: $chap }.merge(o)
end

def move(x, y, ring: nil, mv: 0.6)
  from = $cur.dup; $cur = [x, y]
  snap(mv + 0.4, from: from, mv: mv, ring: ring)
end

# mode: :tap (synthetic DOM events, for buttons and menus), :real (WebDriver mouse, for the canvas), :right
def click(x, y, mode = :tap, wait: 0.9, mv: 0.6, after: 0.5)
  from = $cur.dup; $cur = [x, y]
  snap(mv + 0.5, from: from, mv: mv, click: mode == :right ? 'right' : 'left')
  case mode
  when :tap then W.tap(x, y)
  when :real then W.click(x, y)
  when :right then W.rclick(x, y)
  when Proc then mode.call
  end
  sleep wait
  snap(after)
end

TOKEN = /[A-Za-z]+|-?\d+(?:\.\d+)?|./

def type(str, per: 0.09)
  $typing += 1
  done = 0
  hold(0.2) if $frames.size == $step_first   # a frame before typing, so the first token can wait for the voice
  # one frame per token (A, =, (, -1.45, …) so each one can appear when the voice says it
  str.scan(TOKEN).each { |c| W.keys(c); done += c.size; snap(per * c.size, typed: done, text: str, call: $typing) }
end

def enter(after: 0.8)
  W.keys(""); sleep 1.0; snap(after, enter: true)
end

def hold(d = 0.6, o = {}) snap(d, o) end

def speak(text)
  $steps += 1
  mp3 = "#{OUT}/a/#{$steps}.mp3"; m4a = "#{OUT}/a/#{$steps}.m4a"
  words = nil
  3.times do
    out = IO.popen([PY, File.join(__dir__, 'tts.py'), VOICE, RATE, mp3, text], err: File::NULL, &:read)
    words = JSON.parse(out) rescue nil
    break if words && File.size?(mp3)
    sleep 2
  end
  raise "edge-tts failed: #{text}" unless words && File.size?(mp3)
  system('afconvert', '-f', 'm4af', '-d', 'aac@44100', '-b', '96000', mp3, m4a) or raise 'afconvert failed'
  File.delete(mp3)
  $script << text
  dur = `afinfo #{m4a}`[/estimated duration: ([\d.]+)/, 1].to_f
  [m4a, dur, words]
end

# ---------- typing in time with the voice
# Each typed token (A, =, (, -1.45, …) is matched with the word that dictates it, and the typing frames are
# shown when that word is spoken. Tokens nobody says, like ) or the letters in "and so on", are spread in between.
SAYS = { '=' => %w[equals], '(' => %w[bracket brackets open], '{' => %w[curly], ',' => %w[comma], '^' => %w[squared], '+' => %w[plus] }
def spoken_as?(token, word)
  w = word.downcase.sub(/[.,!?:;]+$/, '')
  return SAYS[token].include?(w) if SAYS[token]
  return w == token.delete('-') if token =~ /\d/
  t = token.downcase
  token =~ /^[a-z]+$/i && (w == t || (w.size >= 3 && t.start_with?(w)))
end

def sync_typing(fs, words, lead)
  return unless fs.any? { |f| f[:typed] }
  times = words.map { |o, _, w| [o + lead, w] }
  ptr = (times.index { |_, w| w.downcase.start_with?('type') } || -1) + 1
  find = ->(&ok) { (ptr...[ptr + 12, times.size].min).find { |k| ok.call(times[k][1]) } }
  # walk the frames in order: the tokens of each type() call and each Enter are matched with the words that say them
  tokens = []; enters = {}
  fs.each_with_index do |f, i|
    if f[:typed] && tokens.none? { |t| t[:call] == f[:call] }
      pos = 0
      f[:text].scan(TOKEN) do |tok|
        pos = f[:text].index(tok, pos) + tok.size
        j = find.call { |w| spoken_as?(tok, w) }
        at = nil
        if j
          at = times[j][0]
          at = times[j - 1][0] if tok.start_with?('-') && j > 0 && times[j - 1][1].downcase == 'minus'
          ptr = j + 1
        end
        tokens << { call: f[:call], upto: pos, at: at }
      end
    elsif f[:enter]
      j = find.call { |w| w.downcase.start_with?('enter') }
      enters[i] = j && times[j][0]
      ptr = j + 1 if j
      tokens << { enter: i, at: enters[i] }
    end
  end
  # fill the gaps linearly between known times
  known = tokens.each_index.select { |i| tokens[i][:at] }
  return if known.empty?
  tokens.each_index do |i|
    next if tokens[i][:at]
    a = known.reverse.find { |k| k < i }
    b = known.find { |k| k > i }
    tokens[i][:at] =
      if a && b then tokens[a][:at] + (tokens[b][:at] - tokens[a][:at]) * (i - a).to_f / (b - a)
      elsif a then tokens[a][:at] + (tokens[i][:enter] ? 0.6 : 0.25) * (i - a)
      else tokens[b][:at] - 0.25 * (b - i)
      end
  end
  # wanted start of each frame; the frame before it is stretched so it starts then
  wanted = fs.each_with_index.map do |f, i|
    if f[:typed] then tokens.find { |t| t[:call] == f[:call] && t[:upto] && t[:upto] >= f[:typed] }[:at]
    elsif f[:enter] then tokens.find { |t| t[:enter] == i }&.dig(:at)
    end
  end
  now = 0.0
  fs.each_with_index do |f, i|
    if wanted[i] && wanted[i] > now && i > 0
      fs[i - 1][:dur] += wanted[i] - now
      now = wanted[i]
    end
    now += f[:dur]
  end
end

# One narrated step: the actions in the block happen while the voice speaks.
# `say` may be a lambda, so the text can use values read from GeoGebra after the actions.
def step(say, cap)
  $cap = cap
  first = $step_first = $frames.size
  yield if block_given?
  hold(0.4) if $frames.size == first
  text = say.respond_to?(:call) ? say.call : say
  m4a, dur, words = speak(text)
  start = $t + 0.15
  sync_typing($frames[first..], words, 0.15)
  total = $frames[first..].sum { |f| f[:dur] }
  need = dur + 0.15 + 0.45
  $frames[-1][:dur] += need - total if total < need
  $audio << { file: m4a, start: start }
  $t += $frames[first..].sum { |f| f[:dur] }
  puts format('%6.1fs  %s', $t, cap)
end

def card(title, sub, say)
  m4a, dur = speak(say)
  $frames << { card: { title: title, sub: sub }, dur: dur + 1.4 }
  $audio << { file: m4a, start: $t + 0.5 }
  $t += dur + 1.4
end

def chapter(name) $chap = name end

def js(code, *a) W.js(code, *a) end
def val(name) js('return ggbApplet.getValueString(arguments[0])', name) end
def at(text, nth = -1) W.at(text, nth) end
def center_of(sel)
  js("const e=document.querySelector(arguments[0]); if(!e) return null; const r=e.getBoundingClientRect(); return r.width?[r.x+r.width/2,r.y+r.height/2]:null", sel)
end
def scroll_algebra(to)
  js("const l=[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.x<10&&r.width>300&&r.width<500&&e.scrollHeight>e.clientHeight+5&&/(auto|scroll)/.test(s.overflowY)}); l.forEach(e=>e.scrollTop=arguments[0]==='end'?e.scrollHeight:arguments[0]); return l.length", to)
end
def capture_btn
  js("const e=[...document.querySelectorAll('[title=\"Set point capture style\"]')].find(e=>e.getBoundingClientRect().width); if(!e) return null; const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]")
end
def input_pos
  scroll_algebra('end'); sleep 0.3
  x, y = center_of('.avInputItem')
  # wait until the tool tip toast at the bottom left no longer covers the Input row
  40.times do
    break if js("const e=document.elementFromPoint(200,arguments[0]); return !!(e&&e.closest('.avInputItem'))", y)
    sleep 0.25
  end
  [200, y]
end
# Spoken form of GeoGebra numbers and equations
def spoken(s)
  s.gsub('−', '-').gsub(/\b([a-z])\(x\)/, '\\1 of x').gsub(/\s*=\s*/, ' equals ').gsub('x²', 'x squared ').gsub(/(\d)x/, '\1 x')
   .gsub(/\s-\s?/, ' minus ').gsub(/^-|\(-|, -/) { |m| m.sub('-', 'minus ') }.gsub('+', ' plus ').gsub(/\s+/, ' ').strip
end

# writes the narration text and the manifest for ./render
def finish
  File.write("#{OUT}/script.txt", $script.join("\n\n"))
  File.write("#{OUT}/manifest.json", JSON.pretty_generate({ frames: $frames, audio: $audio, css: [1470, 727] }))
  puts "frames #{$frames.size}, #{$t.round(1)} s"
end
