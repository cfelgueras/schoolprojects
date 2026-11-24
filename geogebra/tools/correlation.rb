# encoding: utf-8
# Correlation (Project 2, Part B): a table of values in the spreadsheet, the scatter graph, FitLine, r,
# the mean point and estimates. See video.rb for how to run it.
require_relative 'video'

HOURS = [5.5, 4.5, 5, 4, 4, 6, 4, 7, 3, 2, 2, 6, 1, 2.5, 4, 3, 3.5, 5, 1, 4]
SCORES = [59, 67, 66, 61, 67, 51, 51, 41, 73, 69, 70, 60, 83, 70, 69, 74, 66, 55, 81, 57]

# spreadsheet cells, with the Algebra view open on the left
def cell_at(col, row) [{ 'A' => 994, 'B' => 1064 }.fetch(col), 90 + (row - 1) * 25] end

# types into the selected cell; Enter commits it and moves down
def cell(value)
  # start editing (a real keyboard does this with the first key); after Enter the next cell is already editing
  W.keys("") unless editing?
  sleep 0.3
  type(value.to_s)
  enter(after: 0.4)
end

def editing?() js("return document.activeElement.tagName == 'TEXTAREA'") end

# the rest of a column, quickly: like typing, but a frame every two cells
def fill(col, values, from)
  W.keys(""); sleep 0.4   # leave the cell that is waiting to be edited
  values.each_with_index do |v, i|
    name = "#{col}#{from + i}"
    js("ggbApplet.evalCommand(arguments[0]); ggbApplet.setAuxiliary(arguments[1], true)", "#{name}=#{v}", name)
    hold(0.12) if i.odd? || i == values.size - 1
  end
end

def num(v) v.to_s.sub(/\.0$/, '') end

# the statistics commands load the first time they are used
10.times { break unless js("try{return !ggbApplet.evalCommand('tmp=FitLine({(0,0),(1,1)})')}catch(e){return true}"); sleep 1 }
js("ggbApplet.deleteObject('tmp')")

card('Is It True?', 'Correlation in GeoGebra · step by step',
     'Hi! In this video, you\'ll learn how to enter a table of values in GeoGebra, draw a scatter graph, and find the ' \
     'regression line and the correlation coefficient r. We\'ll use the data from Part B: screen time and test scores.')

chapter '1 · Open GeoGebra Classic'
step('First, go to geogebra dot org, slash classic, and close the keyboard with the cross on the right.',
     'Open  geogebra.org/classic  and close the keyboard  ✕') do
  hold(0.8)
  click(*center_of('.closeTabbedKeyboardButton'))
end

chapter '2 · Round to 3 significant figures'
step('The project asks for answers to three significant figures, so let\'s set that first. Open the menu, and choose Settings.',
     'Menu ☰  →  Settings') do
  click(1438, 26)
  click(*at('Settings'), wait: 1.5)
end
step('Click on Rounding, and choose 3 significant figures. Then close the settings.',
     'Rounding  →  3 Significant Figures') do
  click(*at('2 Decimal Places'), :real, wait: 1.0)
  click(*at('3 Significant Figures'), :real, wait: 1.0)
  click(*center_of('.closeBtn'), wait: 1.2)
end

chapter '3 · Enter the table of values'
step('Now open the spreadsheet: open the menu, go to View, and tick Spreadsheet.', 'Menu ☰  →  View  →  ✔ Spreadsheet') do
  click(1438, 26)
  click(*at('View'))
  click(*at('Spreadsheet'), wait: 1.5)
  click(1438, 26)
end
step('Put the screen time, x, in column A, and the score, y, in column B. Click on cell A1, type the first screen time, 5.5, and press Enter.',
     'Column A: screen time (x)      Column B: score (y)') do
  click(*cell_at('A', 1), :real, wait: 0.5)
  cell(HOURS[0])
end
step('GeoGebra moves down to the next cell. Then type 4.5, Enter, and 5, Enter.', 'Type each value and press Enter') do
  cell(HOURS[1]); cell(HOURS[2])
end
step('Type all twenty screen times in the same way.', 'Type all 20 screen times in column A') do
  fill('A', HOURS[3..], 4)
  hold(0.6)
end
step('Then click on cell B1, and type the scores: 59, Enter, 67, Enter, 66, Enter, and so on.',
     'Column B: the scores') do
  click(*cell_at('B', 1), :real, wait: 0.5)
  SCORES[0, 3].each { |v| cell(v) }
end
step('Check your table carefully when you finish. One wrong number changes all your results!', 'Check your table') do
  fill('B', SCORES[3..], 4)
  move(1030, 330, ring: [962, 78, 138, 500]); hold(1.0, ring: [962, 78, 138, 500])
end

chapter '4 · Draw the scatter graph'
step('To draw the scatter graph, select the table: click on A1, and drag down to B20.', 'Select from A1 to B20') do
  x1, y1 = cell_at('A', 1); x2, y2 = cell_at('B', 20)
  move(x1, y1)
  W.drag(x1, y1, x2, y2, 12)
  $cur = [x2, y2]
  hold(0.8)
end
step('Right-click on the selection, choose Create, and then List of points.', 'Right-click  →  Create  →  List of points') do
  click(*cell_at('B', 20), :right, wait: 1.0)
  click(*at('Create'), wait: 0.8)
  click(*at('List of points'), :real, wait: 1.5)
  raise 'no list' unless js("return ggbApplet.exists('l1')")
  got = js("return ggbApplet.getValueString('l1')").scan(/\(([\d.]+), ([\d.]+)\)/).map { |a, b| [a.to_f, b.to_f] }
  raise "wrong data: #{got.inspect}" unless got == HOURS.zip(SCORES).map { |a, b| [a.to_f, b.to_f] }
end
step('GeoGebra creates the points, and a list with all of them, called l1. That\'s a lowercase L and the number 1. But we can\'t see the points yet, because the scores are much bigger than the axes.',
     'The list of points is called  l1') { move(200, 300); hold(1.0) }

chapter '5 · Choose the scale of the axes'
step('First, close the spreadsheet to have more space: open the menu, go to View, and untick Spreadsheet. Your data is still saved.',
     'Menu ☰  →  View  →  untick Spreadsheet') do
  click(1438, 26)
  click(*at('View'))
  click(*at('Spreadsheet'), wait: 1.5)
  click(1438, 26)
end
step('Then, in the Input bar, type Zoom In, and in brackets: minus 1, minus 10, 9, and 100. Press Enter.',
     'Type   ZoomIn(-1, -10, 9, 100)   and press Enter') do
  click(*input_pos, :real)
  type('ZoomIn(-1,-10,9,100)'); enter(after: 1.0)
end
step('Now x goes from minus 1 to 9 hours, and y from minus 10 to 100 percent, so you can see every point. This is your scatter graph.',
     'x: screen time (h)      y: score (%)') { move(950, 400); hold(1.0) }

chapter '6 · The regression line'
line = nil
step('To find the regression line, type Fit Line, open bracket, l1, and press Enter.', 'Type   FitLine(l1)   and press Enter') do
  click(*input_pos, :real)
  type('FitLine(l1)'); enter(after: 1.2)
  line = val('f')
end
step(-> { "GeoGebra draws the line through the points, and the Algebra view shows its equation: #{spoken(line.sub('f: ', ''))}. The gradient is negative, so the scores go down as screen time goes up." },
     -> { line }.call || 'The regression line') do
  $cap = "The regression line   #{line}"
  scroll_algebra('end'); sleep 0.3
  move(200, 560); hold(1.5)
end

chapter '7 · The correlation coefficient r'
r = nil
step('To find r, type: r equals, Correlation Coefficient, open bracket, l1. Then press Enter.',
     'Type   r = CorrelationCoefficient(l1)   and press Enter') do
  click(*input_pos, :real)
  type('r=CorrelationCoefficient(l1)'); enter(after: 1.2)
  r = val('r').sub('r = ', '')
end
step(-> { "r is #{spoken(r)}. It\'s negative and close to minus 1, so there is a strong negative correlation: more screen time goes with lower scores." },
     'Strong negative correlation') do
  $cap = "r = #{r}   →   strong negative correlation"
  move(200, 600); hold(1.5)
end

chapter '8 · The mean point'
mean = nil
step('To plot the mean point, type: Z equals, open bracket, Mean of x of l1, comma, Mean of y of l1. Don\'t call it M: the letters A to T are already your points.',
     'Type   Z = (Mean(x(l1)), Mean(y(l1)))   and press Enter') do
  click(*input_pos, :real)
  type('Z=(Mean(x(l1)),Mean(y(l1)))'); enter(after: 1.2)
  mean = val('Z').sub('Z = ', '')
end
step(-> { "The mean point is #{mean.tr('()', '').sub(',', ', and')}. Notice that the regression line always goes through it." },
     -> { 'The mean point' }.call) do
  $cap = "Mean point   Z = #{mean}"
  x, y = JSON.parse(js("const v=JSON.parse(ggbApplet.getViewProperties(1)); return JSON.stringify([v.left+(ggbApplet.getXcoord('Z')-v.xMin)/v.invXscale, v.top+v.height-(ggbApplet.getYcoord('Z')-v.yMin)/v.invYscale])"))
  move(x + 6, y + 6, ring: [x - 22, y - 22, 44, 44]); hold(1.5, ring: [x - 22, y - 22, 44, 44])
end

chapter '9 · Estimates'
est = {}
step(-> { "To estimate a score, type f, and the number of hours in brackets. For example, f of 3 gives #{est[3]} percent." },
     'Type   f(3)   and press Enter') do
  click(*input_pos, :real)
  type('f(3)'); enter(after: 1.0)
  est[3] = val(js("return ggbApplet.getAllObjectNames().filter(n=>ggbApplet.getObjectType(n)=='numeric').pop()")).split('=').last.strip
end
step(-> { "f of 10 gives #{est[10]} percent. But the data only goes from 1 to 7 hours, so 10 hours is extrapolation, and we shouldn\'t trust it too much. The same happens with 0 hours." },
     'Type   f(10)   and press Enter') do
  type('f(10)'); enter(after: 1.0)
  est[10] = val(js("return ggbApplet.getAllObjectNames().filter(n=>ggbApplet.getObjectType(n)=='numeric').pop()")).split('=').last.strip
  $cap = "f(10) = #{est[10]}   →   extrapolation: don’t trust it too much"
end

card('Now it’s your turn!', 'Use the same steps for Parts A, B and E',
     'And that\'s it! Use the same steps for Part A, with height and arm span, and for your own claim in Part E. ' \
     'Don\'t forget to save your work. Good luck!')

finish
