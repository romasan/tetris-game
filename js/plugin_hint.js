Game.prototype.hint = function() {
  var map = this.map,
      map_size = this.map_size,
      colors = this.colors,
      redraw_all = this.redraw_all,
      draw_ball = this.draw_ball,
      translate_to_canvas_coordinates = this.translate_to_canvas_coordinates


  not_drag = true
  _clone = {
    x: -1,
    y: -1
  }
  selected_block = false
  debug_map = map
  console.log('start search hint...')
  var found = false
  var xy = (Math.random() * 81) | 0
  var dir = [{
    x: 1,
    y: 0
  }, {
    x: 1,
    y: 1
  }, {
    x: 0,
    y: 1
  }, {
    x: -1,
    y: 1
  }, {
    x: -1,
    y: 0
  }, {
    x: -1,
    y: -1
  }, {
    x: 0,
    y: -1
  }, {
    x: 1,
    y: -1
  }]
  var _hint_path = function(path, color) {
    redraw_all()
    selected_block = {
      x: path[0].x,
      y: path[0].y
    }
    redraw_all()
    console.log('hint_path:', path[path.length - 1], map)
      //for(i in path) if(i > 0) draw_ball(translate_to_canvas_coordinates(path[i]), color, false, .3)
    draw_ball(translate_to_canvas_coordinates(path[path.length - 1]), color, false, .6)
  }
  var has = function(x, y) {
    if (y < map.length && y >= 0) {
      if (x < map[y].length && x >= 0) {
        return true
      } else return false;
    } else return false;
  }
  var _match = function(a, b) {
      return a.x == b.x && b.y == a.y
    }
    // ========================================================== two more
  var _hint = function(xy) {
    if (found) return;
    _xy = {
      y: (xy / 9) | 0,
      x: xy % 9
    }
    var _color = map[_xy.y][_xy.x]
      //console.log('A', _xy, _color)
    if (_color != 0)
      for (d in dir) {
        if (has((_xy.x | 0) + (dir[d].x | 0), (_xy.y | 0) + (dir[d].y | 0))) {
          if (map[(_xy.y | 0) + (dir[d].y | 0)][(_xy.x | 0) + (dir[d].x | 0)] == _color) {
            console.log(_xy, {
              x: (_xy.x | 0) + (dir[d].x | 0),
              y: (_xy.y | 0) + (dir[d].y | 0)
            }, _color)
            if (has((_xy.x | 0) + (2 * dir[d].x), (_xy.y | 0) + (2 * dir[d].y))) {
              if (map[(_xy.y | 0) + (2 * dir[d].y)][(_xy.x | 0) + (2 * dir[d].x)] == 0) {
                for (y in map) {
                  for (x in map[y]) {
                    if (map[y][x] == _color)
                      if (!_match({
                          x: x,
                          y: y
                        }, _xy) &&
                        !_match({
                          x: x,
                          y: y
                        }, {
                          x: _xy.x + dir[d].x,
                          y: _xy.y + dir[d].y
                        })
                      ) {
                        console.log('FOUND', x, y, (_xy.x | 0) + (2 * dir[d].x), (_xy.y | 0) + (2 * dir[d].y))
                        var _lee = lee(map, x, y, (_xy.x | 0) + (2 * dir[d].x), (_xy.y | 0) + (2 * dir[d].y))
                        if (_lee) {
                          found = _lee
                          _hint_path(found, colors[_color - 1])
                          return
                        }
                      }
                  }
                }
              }
            }
          }
        }
      }
  }
  for (i = 0; i < xy; i++) _hint(i)
  for (i = xy; i < map_size.width * map_size.height; i++) _hint(i)
    // ========================================================== between
  _hint = function(xy) {
    if (found) return;
    _xy = {
      y: (xy / 9) | 0,
      x: xy % 9
    }
    _color = map[_xy.y][_xy.x]
      //console.log('xy:', xy, _xy, _color)
    if (_color)
      for (d in dir) {
        //console.log('dir:', d, dir[d])
        _c = {
          x: _xy.x,
          y: _xy.y
        }
        var free = 0
        while (has(_c.x + dir[d].x, _c.y + dir[d].y) && free !== false) {
          if (map[_c.y + dir[d].y][_c.x + dir[d].x] == _color && free > 0) {
            //found = true;
            //alert(7)
            for (_y in map) {
              for (_x in map[_y]) {
                if (
                  map[_y][_x] == _color &&
                  !_match({
                    x: _x,
                    y: _y
                  }, _xy) &&
                  !_match({
                    x: _x,
                    y: _y
                  }, {
                    x: _c.x + dir[d].x,
                    y: _c.y + dir[d].y
                  })
                ) {
                  var _lee = lee(map, _x, _y, _xy.x + dir[d].x, _xy.y + dir[d].y)
                  if (_lee) {
                    found = _lee
                    console.log('HINT:', found)
                    _hint_path(found, colors[_color - 1])
                    return
                  }
                }
              }
            }
            /*found = {
                A: _xy,
                to: {
                    _xy.x + dir[d].x,
                    _xy.y + dir[d].y
                }
                B: {
                    x: _c.x + dir[d].x,
                    y: _c.y + dir[d].y
                }
            }*/
          }
          if (map[_c.y + dir[d].y][_c.x + dir[d].x] === 0) {
            //console.log('\nDEBUG:', _c.x + dir[d].x, _c.y + dir[d].y, '\n')
            free += 1
          }
          if (map[_c.y + dir[d].y][_c.x + dir[d].x] != 0) free = false
          _c.y += dir[d].y
          _c.x += dir[d].x
        }
      }
  }
  for (i = 0; i < xy; i++) _hint(i)
  for (i = xy; i < map_size.width * map_size.height; i++) _hint(i)
    // ========================================================== one more
  if (!found) {
    for (y in map) {
      for (x in map[y]) {
        var _color = map[y][x]
        if (_color != 0) {
          for (_y in map) {
            for (_x in map[_y]) {
              //if(map[_y][_x] == _color) console.log('HINT-3', _color, map[_y][_x], _x, _y, x, y, (x|0) != (_x|0) || (y|0) != (_y |0))
              if (((x | 0) != (_x | 0) || (y | 0) != (_y | 0)) && map[_y][_x] == _color) {
                for (i in dir) {
                  //console.log('color:', x, y, _x, _y, (_x|0) + (dir[i].x|0), (_y|0) + (dir[i].y|0))
                  if (has((_x | 0) + (dir[i].x | 0), (_y | 0) + (dir[i].y | 0))) {
                    if (map[(_y | 0) + (dir[i].y | 0)][(_x | 0) + (dir[i].x | 0)] == 0) {
                      var _lee = lee(map, x, y, (_x | 0) + (dir[i].x | 0), (_y | 0) + (dir[i].y | 0))
                      console.log('lee:', _lee)
                      if (_lee) {
                        found = _lee
                        _hint_path(found, colors[_color - 1])
                        return
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!found) show_info('Невозможно показать подсказку')
    //return found
}