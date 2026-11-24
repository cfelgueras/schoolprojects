# encoding: utf-8
# Minimal WebDriver client for Safari (safaridriver -p 4444), used by record.rb.
require 'net/http'
require 'json'
require 'base64'

class WD
  def initialize
    @h = Net::HTTP.new('localhost', 4444); @h.read_timeout = 120
    @sid = req(:post, '/session', { capabilities: { alwaysMatch: { browserName: 'safari' } } })['value']['sessionId']
  end

  def req(m, path, body = nil)
    q = case m
        when :post then Net::HTTP::Post.new(path, 'Content-Type' => 'application/json')
        when :delete then Net::HTTP::Delete.new(path)
        else Net::HTTP::Get.new(path)
        end
    q.body = (body || {}).to_json if m == :post
    JSON.parse(@h.request(q).body)
  end

  def s(m, p, b = nil) req(m, "/session/#{@sid}#{p}", b) end
  def go(u) s(:post, '/url', { url: u }) end
  def js(code, *args) s(:post, '/execute/sync', { script: code, args: args })['value'] end
  def shot(f) File.binwrite(f, Base64.decode64(s(:get, '/screenshot')['value'])) end
  def size(w, h) s(:post, '/window/rect', { width: w, height: h, x: 0, y: 0 }) end
  def quit; s(:delete, ''); end

  def load_ggb(url = 'https://www.geogebra.org/classic?lang=en')
    go(url)
    60.times { break if (js("return typeof ggbApplet!=='undefined' && !!ggbApplet.getVersion && ggbApplet.getVersion()") rescue false); sleep 1 }
    sleep 2
  end

  # real mouse events: needed for the canvas, the toolbar and the Input row
  def pointer(x, y, button)
    s(:post, '/actions', { actions: [{ type: 'pointer', id: 'm', parameters: { pointerType: 'mouse' }, actions: [
      { type: 'pointerMove', duration: 0, x: x.round, y: y.round, origin: 'viewport' }, { type: 'pause', duration: 80 },
      { type: 'pointerDown', button: button }, { type: 'pause', duration: 60 }, { type: 'pointerUp', button: button }] }] })
    s(:delete, '/actions')
  end
  def click(x, y) pointer(x, y, 0) end
  def rclick(x, y) pointer(x, y, 2) end

  # synthetic DOM events on the element under (x, y): GWT menus and buttons ignore some WebDriver clicks
  TAP_JS = "const [x,y]=[arguments[0],arguments[1]]; const e=document.elementFromPoint(x,y); const o={bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,pointerType:'mouse',isPrimary:true,view:window}; ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(t=>e.dispatchEvent(new (t.startsWith('pointer')?PointerEvent:MouseEvent)(t,o))); return e.tagName"
  def tap(x, y) js(TAP_JS, x, y) end

  def keys(text)
    a = []
    text.each_char { |c| a << { type: 'keyDown', value: c }; a << { type: 'keyUp', value: c } }
    s(:post, '/actions', { actions: [{ type: 'key', id: 'k', actions: a }] }); s(:delete, '/actions')
  end

  def upload(path)
    e = s(:post, '/element', { using: 'css selector', value: 'input[type=file]' })['value']
    s(:post, "/element/#{e.values[0]}/value", { text: File.expand_path(path) })
  end

  # centre of the visible element whose own text is exactly t
  def at(t, nth = -1)
    r = js("return [...document.querySelectorAll('*')].filter(e=>e.textContent.trim()==arguments[0]&&![...e.children].some(c=>c.textContent.trim()==arguments[0])).map(e=>{const r=e.getBoundingClientRect();return r.width?[r.x+r.width/2,r.y+r.height/2]:null}).filter(Boolean)", t)
    raise "not found: #{t}" if r.empty?
    r[nth]
  end
end
