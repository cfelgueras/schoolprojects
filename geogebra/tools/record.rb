# encoding: utf-8
# Run from this folder: safaridriver -p 4444 &, then  EDGE_TTS=/path/to/edge-tts ruby record.rb  and  swiftc -O render.swift -o render && ./render manifest.json catch-the-parabola.mp4
# Drives GeoGebra Classic (geogebra.org/classic) step by step, saves screenshots and the narration,
# and writes manifest.json for ./render.
require_relative 'wd'
require 'fileutils'
require 'json'

OUT = 'rec'   # frames and voice clips (not committed)
FileUtils.rm_rf(OUT); FileUtils.mkdir_p("#{OUT}/f"); FileUtils.mkdir_p("#{OUT}/a")
# neural voice through edge-tts (pip install edge-tts); set EDGE_TTS to its path
TTS = ENV.fetch('EDGE_TTS', 'edge-tts'); VOICE = 'en-US-AvaNeural'; RATE = '-6%'

$w = WD.new
at_exit { $w.quit rescue nil }
$w.size(1470, 779)
$w.load_ggb
$frames = []; $audio = []; $script = []; $cur = [735, 380]; $chap = nil; $cap = nil; $n = 0; $t = 0.0; $steps = 0
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

def type(str, per: 0.09)
  str.scan(/.{1,2}/m).each { |c| W.keys(c); snap(per * c.size) }
end

def enter(after: 0.8)
  W.keys(""); sleep 1.0; snap(after)
end

def hold(d = 0.6, o = {}) snap(d, o) end

def speak(text)
  $steps += 1
  mp3 = "#{OUT}/a/#{$steps}.mp3"; m4a = "#{OUT}/a/#{$steps}.m4a"
  3.times { break if system(TTS, '--voice', VOICE, "--rate=#{RATE}", '--text', text, '--write-media', mp3, out: File::NULL, err: File::NULL); sleep 2 }
  raise "edge-tts failed: #{text}" unless File.size?(mp3)
  system('afconvert', '-f', 'm4af', '-d', 'aac@44100', '-b', '96000', mp3, m4a) or raise 'afconvert failed'
  File.delete(mp3)
  $script << text
  dur = `afinfo #{m4a}`[/estimated duration: ([\d.]+)/, 1].to_f
  [m4a, dur]
end

# One narrated step: the actions in the block happen while the voice speaks.
# `say` may be a lambda, so the text can use values read from GeoGebra after the actions.
def step(say, cap)
  $cap = cap
  first = $frames.size
  yield if block_given?
  hold(0.4) if $frames.size == first
  text = say.respond_to?(:call) ? say.call : say
  m4a, dur = speak(text)
  start = $t + 0.15
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

# ---------------------------------------------------------------- the video
card('Catch the Parabola', 'GeoGebra Classic · step by step',
     'Hi! In this video, you\'ll learn how to put the free throw photo into GeoGebra with the right scale, ' \
     'mark the position of the ball, and find a quadratic model using Fit Poly. Let\'s get started!')

chapter '1 · Open GeoGebra Classic'
step('First, go to geogebra dot org, slash classic. When it opens, you might see a keyboard and a list of apps. You won\'t need them for this.',
     'Open  geogebra.org/classic') { hold(1.0) }
step('So, let\'s close the keyboard with the cross on the right.', 'Close the keyboard  ✕') do
  click(*center_of('.closeTabbedKeyboardButton'))
end
step('On the left, you have the Algebra view. Everything you create will show up here, with its coordinates or its equation.',
     'The Algebra view is on the left') { move(190, 300, ring: [2, 55, 384, 668]); hold(0.8, ring: [2, 55, 384, 668]) }
step('If you can\'t see it, just open the menu, go to View, and make sure Algebra is ticked.',
     'Menu ☰  →  View  →  ✔ Algebra') do
  click(1438, 26)
  click(*at('View'))
  x, y = at('Algebra')
  move(x, y, ring: [x - 70, y - 20, 220, 40]); hold(1.0, ring: [x - 70, y - 20, 220, 40])
  click(1438, 26)
end

chapter '2 · Insert the photo'
step('Now let\'s insert the photo. Click on the tool that shows a equals 2, and a list of tools opens.', 'Click the tool  “a = 2”') { click(430, 26) }
step('Choose Image.', 'Choose  Image') { click(*at('Image')) }
step('Then click anywhere on the graphics, and a window opens.', 'Click on the Graphics view') { click(900, 300, :real, wait: 1.5) }
step('Click Browse, and choose the photo you downloaded from Google Classroom.', 'Browse  →  choose the photo') do
  click(*at('Browse'), -> { W.upload('../catch-the-parabola/free-throw.png') }, wait: 3.0)
end
step('There it is! Notice the two blue points, A and B, at the bottom corners. You can also see them in the Algebra view.',
     'The bottom corners of the photo are the points A and B') do
  move(200, 110, ring: [2, 55, 384, 92]); hold(1.2, ring: [2, 55, 384, 92])
end

chapter '3 · Give the photo the right scale'
step('Next, we\'ll give the photo the right scale, so that one unit on the axes is one metre in real life. To do this, we move the corners to the coordinates given under the photo.',
     'Corner 1 (bottom-left) = (−1.45, −0.48)      Corner 2 (bottom-right) = (6.29, −0.48)') { hold(1.0) }
step('Click on Input, and type: A equals, open bracket, minus 1.45, comma, minus 0.48. Then press Enter.',
     'Type   A = (-1.45, -0.48)   and press Enter') do
  click(*input_pos, :real)
  type('A=(-1.45,-0.48)'); enter
end
step('Now do the same for B: B equals 6.29, comma, minus 0.48. And Enter.',
     'Type   B = (6.29, -0.48)   and press Enter') do
  type('B=(6.29,-0.48)'); enter
end
step('Great! The floor is now on the x-axis, and the y-axis goes right through the ball in the player\'s hands. One unit is one metre.',
     'Now 1 unit = 1 metre') { move(1000, 330); hold(1.0) }

chapter '4 · Make the photo a background image'
step('Now let\'s make the photo a background image. Right-click on the photo, and choose Settings.', 'Right-click the photo  →  Settings') do
  click(1000, 300, :right, wait: 1.0)
  click(*at('Settings'), wait: 1.5)
end
step('In the Basic tab, tick Background Image. This way, the photo stays still, and you can click on top of it.',
     'Basic  →  ✔ Background Image') do
  x, y = at('Background Image')
  click(x - 90, y, wait: 1.0)
  raise 'background not set' unless js("return ggbApplet.getXML('pic1').includes('inBackground val=\"true\"')")
end
step('Then close the settings with the cross.', 'Close the settings  ✕') { click(*center_of('.closeBtn'), wait: 1.2) }

chapter '5 · Choose the scale of the axes'
step('The photo is still quite small, so let\'s choose which part of the axes we want to see. In the Input bar, type Zoom In, and in brackets: x min, y min, x max, and y max.',
     'ZoomIn( xMin, yMin, xMax, yMax )') { click(*input_pos, :real) }
step('For this photo, that\'s minus 2, minus 1, 8, and 6. Then press Enter.', 'Type   ZoomIn(-2, -1, 8, 6)   and press Enter') do
  type('ZoomIn(-2,-1,8,6)'); enter(after: 1.0)
end
step('Much better! Now x goes from about minus 2 to 8, and y from minus 1 to 6. If the balls look a little stretched, don\'t worry. The coordinates are still correct.',
     'x from −2 to 8,   y from −1 to 6') { move(900, 420); hold(1.0) }

chapter '6 · Switch off point capturing'
step('Before we mark the balls, there\'s one important thing: switch off point capturing. Otherwise, GeoGebra moves your points onto the grid, and the coordinates will be wrong. Click the style bar button, at the top right of the graphics.',
     'Click the style bar button  (top right of the graphics)') do
  click(1400, 650, :real, wait: 0.6)
  click(1449, 74, :real, wait: 1.0)
  click(1449, 74, :real, wait: 1.0) unless capture_btn
end
step('Then click the magnet button, Point Capturing, and choose Off.', 'Point Capturing  →  Off') do
  click(*capture_btn, :real, wait: 1.0)
  click(*at('Off'), :real, wait: 0.8)
end


# where each ball centre is on the screen now
BALLS = [[0.00, 1.94], [0.39, 2.65], [0.77, 3.24], [1.16, 3.71], [1.55, 4.05], [1.93, 4.26],
         [2.32, 4.36], [2.71, 4.33], [3.09, 4.17], [3.48, 3.89], [3.87, 3.49], [4.26, 2.96]]
def screen(x, y)
  v = JSON.parse(js('return ggbApplet.getViewProperties(1)'))
  [v['left'] + (x - v['xMin']) / v['invXscale'], v['top'] + v['height'] - (y - v['yMin']) / v['invYscale']]
end

chapter '7 · Mark the centre of each ball'
step('Now click on the Point tool. A list opens, so choose Point.', 'Point tool  →  Point') do
  click(70, 26, :real, wait: 0.8)
  item = (at('Point', 0) rescue nil)
  click(*item, :real, wait: 0.6) if item && item[1] > 50
  raise 'point tool not selected' unless js('return ggbApplet.getMode()') == 1
end
step('Click exactly on the centre of the first ball, the one in the player\'s hands. GeoGebra calls it C, because A and B are already the corners of the photo.',
     'Click the centre of the first ball  →  point C') { click(*screen(*BALLS[0]), :real, wait: 0.8) }
step('Now click on the centre of every ball, from left to right. There are twelve balls, so your last point will be N.',
     'Click the centre of every ball, from left to right  (C to N)') do
  BALLS[1..].each { |b| click(*screen(*b), :real, wait: 0.5, mv: 0.35, after: 0.25) }
end
step('If a point ends up in the wrong place, just press Undo, or drag it with the Move tool.',
     'Wrong point?  Undo ↶  or drag it with the Move tool') { move(1307, 29, ring: [1290, 10, 36, 38]); hold(0.6, ring: [1290, 10, 36, 38]) }
step('When you\'re done, click on the Move tool and choose Move, so you don\'t create extra points by mistake.',
     'Move tool  →  Move') do
  click(24, 26, :real, wait: 0.8)
  item = (at('Move', 0) rescue nil)
  click(*item, :real, wait: 0.6) if item && item[1] > 50
  raise 'move tool not selected' unless js('return ggbApplet.getMode()') == 0
end

chapter '8 · Your table of values'
step('Now look at the Algebra view. Each point shows its x and y coordinates in metres, rounded to two decimal places. This is your table of values, so copy it into your report.',
     'Algebra view = your table of values (x, y)') do
  scroll_algebra(0); sleep 0.3
  move(200, 400, ring: [2, 55, 384, 668]); hold(1.5, ring: [2, 55, 384, 668])
end
step('Scroll down to see all of them.', 'Scroll down to see all the points') do
  [150, 300, 450, 'end'].each { |s| scroll_algebra(s); sleep 0.25; hold(0.35) }
end

chapter '9 · Fit a quadratic with FitPoly'
step('Next, make a list with your points. In the Input bar, type: balls equals, curly bracket, C, D, E, and so on, all the way to N. Don\'t call the list L, because there\'s already a point called L.',
     'Type   balls = {C, D, E, F, G, H, I, J, K, L, M, N}   and press Enter') do
  click(*input_pos, :real)
  type('balls={C,D,E,F,G,H,I,J,K,L,M,N}', per: 0.07); enter
end
step('Then type Fit Poly, open bracket, balls, comma, 2. The 2 means degree two, so a quadratic. Press Enter.',
     'Type   FitPoly(balls, 2)   and press Enter') do
  type('FitPoly(balls,2)'); enter(after: 1.2)
end
fx = nil
step(-> { "And there's the parabola, right on top of the photo! The Algebra view shows its equation: #{spoken(fx)}. Remember to write your coefficients to two significant figures." },
     -> { "Your model:   #{fx}" }.call.then { |c| c }) do
  fx = val('f'); raise 'no f' if fx.to_s.empty?
  $cap = "Your model:   #{fx}"
  scroll_algebra('end'); sleep 0.3
  move(200, 560); hold(2.0)
end

chapter '10 · Compare with your own model'
step('To compare it with your model from Method 1, type that one in the Input bar too. For example: g of x equals minus 0.42, times x minus 2.4 squared, plus 4.36.',
     'Type   g(x) = -0.42(x - 2.4)^2 + 4.36   and press Enter') do
  click(*input_pos, :real)
  type('g(x)=-0.42(x-2.4)^2'); W.keys(""); type('+4.36'); enter(after: 1.0)
end
step('Now you can see both curves on top of the photo. Which one fits the balls better? And why might they be a little different?',
     'Which model fits better?') { move(950, 250); hold(1.5) }

chapter '11 · Use your model'
ans = {}
step(-> { "Now let's use the model. To find the height of the ball at a certain distance, type f, and the distance in brackets. For example, f of 4.26 gives #{ans[:h]} metres." },
     'Type   f(4.26)   and press Enter') do
  click(*input_pos, :real)
  type('f(4.26)'); enter
  n = js("return ggbApplet.getAllObjectNames().filter(n=>ggbApplet.getObjectType(n)=='numeric').pop()")
  ans[:h] = js('return ggbApplet.getValue(arguments[0]).toFixed(2)', n)
end
step(-> { "To find where the ball would hit the floor, type Roots, open bracket, f. The roots are #{ans[:r].join(' and ')}, and only the positive one makes sense here." },
     'Type   Roots(f)   and press Enter') do
  before = js('return ggbApplet.getAllObjectNames()')
  type('Roots(f)'); enter(after: 1.0)
  pts = js('return ggbApplet.getAllObjectNames()') - before
  ans[:r] = pts.map { |p| js('return ggbApplet.getXcoord(arguments[0]).toFixed(2)', p) }.sort_by(&:to_f)
end
step(-> { "To find where the ball is at a height of three and a half metres, type Intersect, f, comma, y equals 3.5. The ball reaches that height when x is #{ans[:i].join(', and again when x is ')}." },
     'Type   Intersect(f, y = 3.5)   and press Enter') do
  before = js('return ggbApplet.getAllObjectNames()')
  type('Intersect(f,y=3.5)'); enter(after: 1.0)
  pts = js('return ggbApplet.getAllObjectNames()') - before
  ans[:i] = pts.select { |p| js('return ggbApplet.getObjectType(arguments[0])', p) == 'point' }
               .map { |p| js('return ggbApplet.getXcoord(arguments[0]).toFixed(2)', p) }.sort_by(&:to_f)
end
step(-> { "And Extremum of f gives you the vertex: the highest point of the path, at #{ans[:v][1]} metres." },
     'Type   Extremum(f)   and press Enter') do
  before = js('return ggbApplet.getAllObjectNames()')
  type('Extremum(f)'); enter(after: 1.5)
  p = (js('return ggbApplet.getAllObjectNames()') - before).first
  ans[:v] = [js('return ggbApplet.getXcoord(arguments[0]).toFixed(2)', p), js('return ggbApplet.getYcoord(arguments[0]).toFixed(2)', p)]
end

chapter 'Tip · Start from a table of values'
step('One last tip. If you already have a table of values, you can type the points directly as a list. Use curly brackets, and put each point in round brackets: x, comma, y. Here\'s a table for a water jet.',
     'Type   pts = {(0, 0), (1, 2.4), (2, 3.6), (3, 3.6), (4, 2.4), (5, 0)}   and press Enter') do
  click(*input_pos, :real)
  type('pts={(0,0),(1,2.4),(2,3.6),(3,3.6),(4,2.4),(5,0)}', per: 0.06); enter(after: 1.0)
end
step('If you can\'t see the points on the graph, click on the circle next to the list in the Algebra view.',
     'Click the circle next to  pts  to show the points') do
  y = js("const e=[...document.querySelectorAll('*')].filter(e=>e.children.length==0&&/^pts/.test(e.textContent.trim())).pop(); const r=e.getBoundingClientRect(); return r.y+r.height/2")
  click(26, y, :real, wait: 0.8)
  unless js("return ggbApplet.getVisible('pts')")
    js("ggbApplet.setVisible('pts', true)"); sleep 0.5; hold(0.3)
  end
end
step('Then use Fit Poly with this list, just like before.',
     'Type   FitPoly(pts, 2)   and press Enter') do
  click(*input_pos, :real)
  type('FitPoly(pts,2)'); enter(after: 1.5)
  raise 'second FitPoly missing' unless js("return ggbApplet.getAllObjectNames().some(n=>/FitPoly\\(pts/.test(ggbApplet.getCommandString(n)))")
end

card('Now it’s your turn!', 'Save your work:  Menu ☰  →  File  →  Save',
     'And that\'s it! Now it\'s your turn. Don\'t forget to save your work: open the menu, choose File, and then Save. Good luck!')

File.write('script.txt', $script.join("\n\n"))
File.write('manifest.json', JSON.pretty_generate({ frames: $frames, audio: $audio, css: [1470, 727] }))
puts "frames #{$frames.size}, #{$t.round(1)} s"
