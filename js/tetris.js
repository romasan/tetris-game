var clone = function(data) {
  return JSON.parse(JSON.stringify(data))
}

var _cl = function() {
  // console.log.apply(console, arguments);
}

Game = function() {

  var map_width = 10,
    map_height = 20,
    canvas_width = null,
    canvas_height = null,
    block_width = block_height = 33,
    canvas_area = 'canvas_area',
    canvas_hint = 'canvas_hint',
    canvas = null,
    stage = null,
    stahe_hint = null,
    layer = null,
    layer_null = null,
    hint_stage = null,
    hint_layer = null,
    assets = null,
    configuration = {
      show_shadow: false,
      bg_mode: 1, // 1 - all color, 2 - only on move, 3 - all grey
      shape_theme: 1, // 1 - light, 2 - border
      show_hint: true,
      grey_color: '#A0A0A0',
      ipod: false,
      canvasbg: true
    },
    mappings = {
      '13': 'rotate', // Enter
      '38': 'rotate', // Up
      '32': 'drop', // Space
      '40': 'down', // Down
      '39': 'right', // Right
      '37': 'left' // Left
    },
    shapes = {
      I: {
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        color: '#00E4E4'
      },
      L: {
        shape: [
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 1]
        ],
        color: '#E46200'
      },
      J: {
        shape: [
          [0, 0, 1],
          [0, 0, 1],
          [0, 1, 1]
        ],
        color: '#004EE4'
      },
      T: {
        shape: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 1, 0]
        ],
        color: '#9C13E4'
      },
      Z: {
        shape: [
          [0, 0, 1],
          [0, 1, 1],
          [0, 1, 0]
        ],
        color: '#E40027'
      },
      S: {
        shape: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 0, 1]
        ],
        color: '#00E427'
      },
      O: {
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: '#E4DE00'
      }
    },
    map = [],
    map_hint = [],
    next_shape = null,
    _hint = true,
    shape = [],
    shape_x = null,
    shape_y = null,
    points = 0,
    moves = 0,
    min_moves = 5,
    can_move = true
  canvas_width = map_width * block_width
  canvas_height = map_height * block_height

  var INT = function(i) {
    
    return i | 0;
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
      
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  
  var _keys = function(a) {
    var r = [];
    for (i in a) {
      r.push(i);
    }
    return r;
  }
  
  var random_shape = function() {
    var random = (Math.random() * _keys(shapes).length) | 0
    if (use_rng) random = (RNG.getUniform() * _keys(shapes).length) | 0
    return clone(shapes[_keys(shapes)[random]])
  }
  
  var show_shape = function(shape, x, y) {
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        try {
          if (typeof map[INT(_y) + INT(y)][INT(_x) + INT(x)] != "undefined")
            if (shape.shape[_y][_x]) {
              map[INT(_y) + INT(y)][INT(_x) + INT(x)].block._show()
              var _color = configuration.bg_mode == 1 ? shape.color : configuration.bg_mode == 2 ? shape.color : configuration.bg_mode == 3 ? configuration.grey_color : configuration.grey_color
              map[INT(_y) + INT(y)][INT(_x) + INT(x)].block._fill(_color)
              map[INT(_y) + INT(y)][INT(_x) + INT(x)].color = shape.color
            }
        } catch (e) {
          //_cl('error 1', INT(_y) + INT(y), INT(_x) + INT(x))
        }
      }
    }
  }

  var hide_shape = function(shape, x, y) {
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        try {
          if (typeof map[INT(_y) + INT(y)][INT(_x) + INT(x)] != "undefined")
            if (shape.shape[_y][_x] && !map[INT(_y) + INT(y)][INT(_x) + INT(x)].stone)
              map[INT(_y) + INT(y)][INT(_x) + INT(x)].block._hide()
        } catch (e) {
          _cl('error 2', INT(_y) + INT(y), INT(_x) + INT(x))
        }
      }
    }
  }

  var show_shape_hint = function(shape) {
    if (!_hint) {
      clear_hint()
      return;
    }
    var x = 0,
      y = 0
    if (shape.shape.length == 2) x = 1, y = 1
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        try {
          if (typeof map_hint[INT(_y) + INT(y)][INT(_x) + INT(y)] != "undefined")
            if (shape.shape[_y][_x])
              map_hint[INT(_y) + INT(y)][INT(_x) + INT(x)]._show()
          var _color = configuration.bg_mode == 1 ? shape.color : configuration.bg_mode == 2 ? shape.color : configuration.bg_mode == 3 ? configuration.grey_color : configuration.grey_color
          map_hint[INT(_y) + INT(y)][INT(_x) + INT(x)]._fill(_color)
        } catch (e) {}
      }
    }
  }
  
  var clear_hint = function() {
    //_cl('clear hint', map_hint[0][0]._hint)
    //debug_print(map_hint)
    for (y in map_hint) {
      for (x in map_hint[y]) {
        map_hint[y][x]._hide()
      }
    }
  }

  var rotate_shape = function(shape) { // по часовой
    var _clone = clone(shape)
    for (y in shape) {
      for (x in shape) {
        _clone[x][shape[y].length - 1 - y] = shape[y][x]
      }
    }
    return _clone
  }

  var gen_map = function(w, h) {
    for (var y = 0; y < map_height; y++) {
      map[y] = []
      for (var x = 0; x < map_width; x++) {
        map[y][x] = {
          block: create_block({
            x: x * block_width,
            y: y * block_height,
            fill: '#0000ff'
          }),
          stone: false,
          shadow: false,
          color: '#0000ff'
            //moved: false
            //active: false
        }
        map[y][x].block._hide()
          //map[y][x].block._fill(x * y % 2 ? '#ff0000' : '#0000ff')
        layer.add(map[y][x].block)
      }
    }
  }
  
  var clear_map = function() {
    for (y in map) {
      for (x in map[y]) {
        map[y][x].block._hide()
          //map[y][x].block.remove()
        map[y][x].stone = false
        map[y][x].shadow = false
        map[y][x].color = '#0000ff'

      }
    }
  }
  
  var gen_map_hint = function() {
    for (var y = 0; y < 4; y++) {
      map_hint[y] = []
      for (var x = 0; x < 4; x++) {
        map_hint[y][x] = create_block({
          x: x * block_width,
          y: y * block_height,
          fill: '#0000ff'
        })
        map_hint[y][x]._hide()
        layer_hint.add(map_hint[y][x])
      }
    }
  }
  
  var check_drop = function(shape, x, y) {
    var _y = y;
    while (check_space(shape, x, INT(_y))) {
      _y += 1
    }
    return _y - 1;
  }

  var _shadow = {}

  var show_shadow = function(shape, x, y) {
    for (_y in map) {
      for (_x in map[_y]) {
        if (map[_y][_x].shadow) {
          map[_y][_x].shadow = false
          map[_y][_x].block._hide()
        }
        if (map[_y][_x].stone) {
          map[_y][_x].block._show()
        }

      }
    }
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        try {
          if (typeof map[INT(_y) + INT(y)][INT(_x) + INT(x)] != "undefined")
            if (shape.shape[_y][_x]) {
              if (configuration.show_shadow) {
                map[INT(_y) + INT(y)][INT(_x) + INT(x)].block._show()
                map[INT(_y) + INT(y)][INT(_x) + INT(x)].shadow = true
                var _color = //hexToRgb(shape.color)
                configuration.bg_mode == 1 ? hexToRgb(shape.color) : configuration.bg_mode == 2 ? hexToRgb(shape.color) : configuration.bg_mode == 3 ? hexToRgb(configuration.grey_color) : hexToRgb(configuration.grey_color)
                _color = 'rgba(' + _color.r + ', ' + _color.g + ', ' + _color.b + ', .1)'
                _cl(_color)
                //_color = configuration.bg_mode == 1 ? _color : configuration.bg_mode == 2 ? _color : configuration.bg_mode == 3 ? configuration.grey_color : configuration.grey_color
                map[INT(_y) + INT(y)][INT(_x) + INT(x)].block._fill(_color)
              }
            }
        } catch (e) {
          //_cl('error 1', INT(_y) + INT(y), INT(_x) + INT(x))
        }
      }
    }
    layer.draw()

    _shadow.shape = clone(shape)
    _shadow.x = x
    _shadow.y = y
  }
  
  var check_space = function(shape, x, y) {
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        if (shape.shape[_y][_x] == 1) {
          if (typeof map[INT(_y) + INT(y)] == "undefined") {
            return false
          } else {
            if (typeof map[INT(_y) + INT(y)][INT(_x) + INT(x)] == "undefined") {
              return false
            } else {
              if (map[INT(_y) + INT(y)][INT(_x) + INT(x)].stone == true)
                return false
            }
          }
        }
      }
    }
    return true
  }
  
  var clear_line = function(num) {
    for (x in map[num]) {
      map[num][x].block._hide()
      map[num][x].stone = false
    }
    for (var y = num - 1; y >= 0; y--) {
      for (x in map[y]) {
        if (map[y][x].stone == true) {
          //var _color = map[y][x].block._get_color()
          var _color = map[y][x].color
          map[y][x].color = '#0000ff'
          map[y][x].block._hide()
          map[y][x].stone = false
          map[y][x].moved = true;
          map[INT(y) + 1][x].color = _color
          _color = configuration.bg_mode == 1 ? _color : configuration.bg_mode == 2 ? configuration.grey_color : configuration.grey_color
          map[INT(y) + 1][x].block._fill(_color)
          map[INT(y) + 1][x].block._show(_color)
          map[INT(y) + 1][x].stone = true
        }
      }
    }
  }
  
  var check_lines = function() {
    var _lines = 0
    for (y in map) {
      var line_full = true
      for (x in map[y]) {
        if (!map[y][x].stone) line_full = false
      }
      if (line_full) {
        clear_line(y)
        _lines += 1
      }
    }
    switch (_lines) {
      case 1:
        points += 100;
        break;
      case 2:
        points += 300;
        break;
      case 3:
        points += 700;
        break;
      case 4:
        points += 1500;
        break;
    }
    if (_lines > 0) speed *= .99
      //lines += _lines
    $('#info-lines').html(points)
  }
  
  var make_stone = function(shape, x, y) {
    _shadow = {}
    for (_y in shape.shape) {
      for (_x in shape.shape[_y]) {
        if (shape.shape[_y][_x] == 1) {
          try {
            map[INT(y) + INT(_y)][INT(x) + INT(_x)].stone = true;
            map[INT(y) + INT(_y)][INT(x) + INT(_x)].shadow = false;
            var _color = configuration.bg_mode == 1 ? shape.color : configuration.bg_mode == 2 ? configuration.grey_color : configuration.grey_color
            map[INT(y) + INT(_y)][INT(x) + INT(_x)].block._fill(_color)
            map[INT(y) + INT(_y)][INT(x) + INT(_x)].color = shape.color
          } catch (e) {}
        }
      }
    }
  }
  
  var end_game = false
  
  var check_end = function() {

    check_lines()


    shape = clone(next_shape)

    next_shape = random_shape()

    shape_y = 0
    shape_x = parseInt(map_width / 2 - shape.shape.length / 2)
    if (check_space(shape, shape_x, shape_y)) {
      clear_hint()
        /*for(y in map_hint) {
          for(x in map_hint[y]) {
            //map_hint[y][x]._hide()
            _cl(map_hint[y][x]._hide)
          }
        }*/
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)

      show_shape_hint(next_shape)

      show_shape(shape, shape_x, shape_y)
      layer.draw()
      layer_hint.draw()
      can_move = true
        //loaded = false

    } else {
      //alert('TRY AGAIN\nhighscore: ' + lines)

      //if(!loaded) {
      can_move = false
      save_state()
      _play = false
      _states = []
      _states.push(states.pop())
      send_history(_states)
      localStorage.tetris_end = true
      show_end_message();
      //end_game = true
      //moves = 0
      //} else {
      //  _new_game()
      //}

      //new_game()
    }
  }
  
  var only_drop = true
  var _drop = true
  
  var drop = function() {
    if (!_play) return;

    moves += 1

    if (!_drop) return
    var _drop_y = check_drop(shape, shape_x, shape_y)
      //show_shadow(shape, shape_x, _drop_y)
    hide_shape(shape, shape_x, shape_y)

    var _shape_x = shape_x,
      _shape_y = shape_y
    shape_y = 0
    shape_x = parseInt(map_width / 2 - shape.shape.length / 2)
    save_state()
    shape_x = _shape_x
    shape_y = _shape_y

    shape_y = _drop_y
    make_stone(shape, shape_x, shape_y)
    check_end()
      //show_shape(shape, shape_x, shape_y)
  }
  
  var _down = true
  
  var move_down = function() {

    if (!_play || _pause) return;
    //if(!_down) return;
    var _drop_y = check_drop(shape, shape_x, shape_y)
      //_cl(shape_y, _drop_y)
      //hide_shadow()
    show_shadow(shape, shape_x, _drop_y)
      //_cl('move_down', check_space(shape, shape_x, shape_y + 1))
    if (check_space(shape, shape_x, shape_y + 1)) {
      hide_shape(shape, shape_x, shape_y)
      shape_y += 1;
      show_shape(shape, shape_x, shape_y)
      layer.draw()
    } else {
      _cl('drop')

      var _shape_x = shape_x,
        _shape_y = shape_y
      shape_y = 0
      shape_x = parseInt(map_width / 2 - shape.shape.length / 2)
      save_state()
      shape_x = _shape_x
      shape_y = _shape_y

      make_stone(shape, shape_x, shape_y)
      check_end()
    }
  }

  var move_right = function() {
    if (!_play || _pause) return

    moves += 1
    only_drop = false

    if (check_space(shape, shape_x + 1, shape_y)) {
      hide_shape(shape, shape_x, shape_y)
      shape_x += 1;
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)
      show_shape(shape, shape_x, shape_y)
      layer.draw()
    }
  }

  var move_left = function() {

    moves += 1
    only_drop = false

    if (!_play || _pause) return
    if (check_space(shape, shape_x - 1, shape_y)) {
      hide_shape(shape, shape_x, shape_y)
      shape_x -= 1;
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)
      show_shape(shape, shape_x, shape_y)
      layer.draw()
    }
  }

  var rotate = function() {

    moves += 1
    only_drop = false

    if (!_play || _pause) return
    var _clone = clone(shape)
    _clone.shape = rotate_shape(shape.shape)
    if (check_space(_clone, shape_x, shape_y)) {
      hide_shape(shape, shape_x, shape_y)
      shape = clone(_clone)
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)
      show_shape(shape, shape_x, shape_y)
    } else if (check_space(_clone, shape_x + 1, shape_y)) {
      hide_shape(shape, shape_x, shape_y)
      shape_x += 1
      hide_shape(shape, shape_x, shape_y)
      shape = clone(_clone)
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)
      show_shape(shape, shape_x, shape_y)

    } else if (check_space(_clone, shape_x - 1, shape_y)) {
      hide_shape(shape, shape_x, shape_y)
      shape_x -= 1
      hide_shape(shape, shape_x, shape_y)
      shape = clone(_clone)
      var _drop_y = check_drop(shape, shape_x, shape_y)
      show_shadow(shape, shape_x, _drop_y)
      show_shape(shape, shape_x, shape_y)
    }
    layer.draw()
  }

  var create_block = function(a) {
    var group = new Kinetic.Group({
      x: a.x,
      y: a.y
        //draggable: true
    });
    var square = new Kinetic.Rect({
      id: 'sq',
      x: 0,
      y: 0,
      width: block_width,
      height: block_width,
      fill: a.fill
    });
    /*var light = new Kinetic.Polygon({
      x: 0,
      y: 0,
      points: [
        0, 0,
        block_width, 0,
        block_width * .8, block_width * .2,
        block_width * .2, block_width * .2,
        block_width * .2, block_width * .8,
        0, block_width
      ],
      fill: 'rgba(255, 255, 255, .3)'
    });
    var dark = new Kinetic.Polygon({
      x: 0,
      y: 0,
      points: [
        block_width, block_width,
        0, block_width,
        block_width * .2, block_width * .8,
        block_width * .8, block_width * .8,
        block_width * .8, block_width * .2,
        block_width, 0
      ],
      fill: 'rgba(0, 0, 0, .3)'
    });*/

    var light = new Kinetic.Polygon({
      x: 0,
      y: 0,
      points: [
        0, 0,
        block_width, 0,
        block_width * .9, block_width * .1,
        block_width * .1, block_width * .1,
        block_width * .1, block_width * .9,
        0, block_width
      ],
      fill: 'rgba(255, 255, 255, .3)'
    });
    var dark = new Kinetic.Polygon({
      x: 0,
      y: 0,
      points: [
        block_width, block_width,
        0, block_width,
        block_width * .1, block_width * .9,
        block_width * .9, block_width * .9,
        block_width * .9, block_width * .1,
        block_width, 0
      ],
      fill: 'rgba(0, 0, 0, .3)'
    });

    group.add(square);
    group.add(light);
    group.add(dark);
    group._hide = function() {
      this.getChildren().each(function(node) {
        node.hide();
      });
    }
    group._show = function() {
      this.getChildren().each(function(node) {
        node.show();
      });
    }
    var _theme = group._theme = function(theme) {
      switch (theme) {
        case 'theme-1':
          light.attrs.fill = 'rgba(255, 255, 255, .3)';
          break;
        case 'theme-2':
          light.attrs.fill = 'rgba(0, 0, 0, .2)';
          break;
      }
    }
    _theme('theme-' + configuration.shape_theme)
    group._fill = function(color) {
      square.attrs.fill = color
      _theme('theme-' + configuration.shape_theme)
    }
    group._get_color = function() {
      return square.attrs.fill
    }
    group._anim = function() {
      var tweens = [square, light, dark]
      for (i in tweens) {
        var tween = new Kinetic.Tween({
          node: tweens[i],
          duration: .2,
          x: 0,
          y: block_height,
          opacity: 1,
          easing: Kinetic.Easings.Linear
        });
        tween.play()
      }
    }
    group._moveup = function() {
        var tweens = [square, light, dark]
        for (i in tweens) {
          tweens[i].move({
            x: 0,
            y: -block_height
          })
        }
      }
      /*group._tween = function() {
        var  tween = Kinetic.Tween({
          node: square,
          duration: 1,
          x: 10,
          y: 10,
          onFinish: function() {
            _cl('success')
          }
        })
        tween.play();
      }*/
    return group;
  }

  var speed = 1000
  var _play = true
  var _pause = false
  var use_rng = true

  var redraw_timer = function() {
    
    $('#info-time').html(
      // formatGameTimeMS(current_time)
      current_time
    )
  }

  var redraw_map = function(_map) {
    var _color = null
    for (y in map) {
      for (x in map[y]) {
        _color = configuration.bg_mode == 1 ? map[y][x].color : configuration.bg_mode == 2 ? configuration.grey_color : configuration.grey_color
        map[y][x].block._fill(_color)
      }
    }
    /*_color = configuration.bg_mode == 1 ? next_shape.color : configuration.bg_mode == 2 ? configuration.grey_color : configuration.grey_color
    for(y in map_hint) {
      for(x in map_hint[y]) {
        map_hint[y][x]._fill(_color)
      }
    }*/
    layer.draw()
      //layer_hint.draw()
  }

  var last_action_time = 0
  var current_time = 0
  var last_time = 0
  var pause_timer = false
  
  var _timer = function() {
    if (!pause_timer) {
      var time2 = new Date().getTime()
      if (time2 - last_action_time < 15e3) {
        if (!_pause) current_time += time2 - last_time
      } else {
        if (_pause == false) toggle_play()
      }
      last_time = new Date().getTime()
      redraw_timer()
    }
    setTimeout(function() {
      _timer()
    }, 1000)
  }
  
  var timer = function() {
    if (_play && !_pause) {
      move_down()
    }
    setTimeout(timer, speed)
  }
  
  var states = [],
    states_forward = []
  
  var save_state = function() {
    states_forward = []
    $("#tbRedo").addClass('bt-disabled')
    if (moves == 0) return;
    var _state = {}
    _state.map = []
    for (y in map) {
      _state.map[y] = []
      for (x in map[y]) {
        //_color = map[y][x].block._get_color()
        _color = map[y][x].color
        _state.map[y][x] = {
          color: _color,
          stone: map[y][x].stone
        }
      }
    }
    _state.shape = clone(shape)
    _state.shape_x = shape_x
    _state.shape_y = shape_y
    _state.next_shape = clone(next_shape)
    if (use_rng) _state.rand_state = RNG.getState()
    _state.points = points
    _state.speed = speed
    _state.current_time = current_time
    _state.moves = moves
    _state.can_move = can_move
    _cl('STATES #0:', states, typeof states)
    
    states.push(_state)
    _cl('STATES:', _state, states)
    states_forward = []
    $('#tbUndo').removeClass('bt-disabled')
  }
  
  var set_state = function(_state) {
    for (y in _state.map) {
      for (x in _state.map[y]) {
        map[y][x].block._hide()
        map[y][x].color = _state.map[y][x].color
        map[y][x].stone = _state.map[y][x].stone
        if (_state.map[y][x].stone == true) {
          map[y][x].block._show()
          var _color = configuration.bg_mode == 1 ? _state.map[y][x].color : configuration.bg_mode == 2 ? configuration.grey_color : configuration.grey_color
          map[y][x].block._fill(_color)
        }
      }
    }
    shape = JSON.parse(JSON.stringify(_state.shape))
    next_shape = clone(_state.next_shape)
    shape_x = _state.shape_x
    shape_y = _state.shape_y
    if (use_rng) RNG.setState(_state.rand_state)

    if (check_space(shape, shape_x, shape_y)) show_shape(shape, shape_x, shape_y)

    clear_hint()
    show_shape_hint(next_shape)
    points = _state.points
    speed = _state.speed
    $('#info-lines').html(points)
    layer.draw()
    layer_hint.draw()
    $('#tbUndo').removeClass('bt-disabled')
  }
  
  var rewind = function() {
    if(!_play) return
    if (!states.length) return;
    var _state = states.pop()
    states_forward.push(_state)
    set_state(_state)
    moves = _state.moves
    points = _state.points
    can_move = _state.can_move
    if (states.length == 0) $('#tbUndo').addClass('bt-disabled')
    $('#tbRedo').removeClass('bt-disabled')
  }
  
  var forward = function() {
    if (!states_forward.length) return;
    var _state = states_forward.pop()
    states.push(_state)
    set_state(_state)
    moves = _state.moves
    points = _state.points
    if (states_forward.length == 0) $('#tbRedo').addClass('bt-disabled')
    $('#tbUndo').removeClass('bt-disabled')
  }
  
  var start_game_time = 0;
  this.rewind = rewind
  this.forward = forward

  var _prompt_done = null
  var _prompt_cancel = null
  
  var prompt_done = function() {
    if (typeof _prompt_done == "function") _prompt_done()
    $('.bubblePanel').hide()
  }
  
  this.prompt_done = prompt_done
  
  var prompt_cancel = function() {
    if (typeof _prompt_cancel == "function") _prompt_cancel()
    $('.bubblePanel').hide()
  }
  
  this.prompt_cancel = prompt_cancel
  
  var prompt = function(title, message, done, cancel) {
    $('#prompt-title').html(title)
    $('#prompt-text').html(message)
    $('#prompt-window').show()
    if (!_pause) toggle_play()
    _prompt_done = (typeof done == "function") ? done : null
    _prompt_cancel = (typeof done == "function") ? cancel : null
    move_map_to_center()
  }

  var new_game = function() {
    load_rating()

    can_move = true
      //_cl('new_game:', moves)
    if (moves >= min_moves && !localStorage.tetris_end && !only_drop) {
      prompt('', contexts['ui']['savegame'], function() {
        save_state()
        var _states = []
        _states.push(states.pop())
        send_history(_states)
        _new_game()
      }.bind(this), function() {
        send_history()
        _new_game()
      }.bind(this))
    } else {
      _new_game()
    }
    localStorage.removeItem('tetris_end')
    if (!_pause) toggle_play()
      /*if(end_game) {
        end_game = false
        send_history()
      }*/
  }
  
  var _new_game = function() {
    //$('.bubblePanel').hide()
    game_id = null
    _cl('NEW GAME')
    //end_game = false

    //send_history()
    moves = 0
    only_drop = true

    current_time = 0
    last_time = last_action_time = new Date().getTime()
    pause_timer = false
    redraw_timer()

    send_history()
    save_state()
    var random_seed = 1 + parseInt(Math.random() * 10000)
    RNG.setSeed(random_seed)
    clear_map()
    next_shape = random_shape()
    shape = clone(next_shape)
    shape_y = 0
    shape_x = parseInt(map_width / 2 - shape.shape.length / 2)
    next_shape = random_shape()
    show_shape(shape, shape_x, shape_y)
    clear_hint()
    show_shape_hint(next_shape)
    _play = true
      //_pause = false
    points = 0
    moves = 0
    $('#info-lines').html(points)
    layer.draw()
    layer_hint.draw()
    states = []
    speed = 1000
    start_game_time = new Date().getTime()
    _pause = false

    $("#tbReplay").removeClass("yellow")
    $('#tbUndo').addClass('bt-disabled')
    $('#tbRedo').addClass('bt-disabled')
    setTimeout(function() {
      toggle_play();
    }.bind(this), 100)
  }
  
  this.new_game = new_game

  var move_map_to_center = function() {
    _c = document.getElementsByClassName('in-center')
    for (i in _c) {
      if (typeof _c[i] == 'object') {
        var _pw = (typeof _c[i].parentNode.width != 'undefined') ? _c[i].parentNode.width : _c[i].parentNode.offsetWidth;
        var _ew = (typeof _c[i].width != 'undefined') ? _c[i].width : _c[i].offsetWidth;
        if (_c[i].getAttribute('width')) _ew = parseInt(_c[i].getAttribute('width'))
        _c[i].style.position = 'relative'
        _c[i].style.left = _pw / 2 - _ew / 2 + 'px';
      }
    }
    _c = document.getElementsByClassName('abs-pos')
    for (i in _c) {
      if (typeof _c[i] == 'object') {
        _c[i].style.position = 'absolute'
      }
    }

    if( window.navigator.userAgent.indexOf("MSIE ") > 0 ) {
        $("#game-field").css({left: '170px', position: 'relative'})
    }
  }
  this.move_map_to_center = move_map_to_center

  var _changes_ver = 'chahges-201014'
  
  var message = function(title, message) {
    $('#message-title').html(title)
    $('#message-text').html(message)
    $('#message-window').show()
    move_map_to_center()
  }
  
  var show_end_message = function() {
    
    message(contexts['ui']['gameOver'], contexts['ui']['yourScore'] + ' ' + (points|0) + ' ' + contexts['g_message']['rating_points'])
  }

  var play = function() {
    _pause = false
    _play = true
  }
  
  var pause = function() {
    
    _pause = true
  }
  
  this.play = play
  this.pause = pause

  var show_configuration_window = function() {
    if (!_pause) toggle_play()
    $("#configuration-window").show()
    move_map_to_center();
    $("[name='show-shadow']").prop({
      checked: configuration.show_shadow
    })
    $("[name='f-background'][value='f-background-" + configuration.bg_mode + "']").prop({
      checked: true
    })
    $("[name='f-weight'][value='f-weight-" + configuration.shape_theme + "']").prop({
      checked: true
    })
    $("[name='ipod']").prop({checked: configuration.ipod})
    $("[name='canvasbg']").prop({checked: configuration.canvasbg})
    $("input.color:eq(1)").attr({value: configuration.grey_color}).css({background: configuration.grey_color})
  }
  
  var save_configuration = function() {
    //play()
    configuration.show_shadow = $("[name='show-shadow']").prop('checked')
    var _drop_y = check_drop(shape, shape_x, shape_y)
    show_shadow(shape, shape_x, _drop_y)
    layer.draw()
    configuration.bg_mode = $("[name='f-background']:checked").val().split('-')[2] | 0
    configuration.shape_theme = $("[name='f-weight']:checked").val().split('-')[2] | 0
    configuration.ipod = $("[name='ipod']").prop('checked')
    configuration.canvasbg = $("[name='canvasbg']").prop('checked')
    if(configuration.canvasbg) {
      $(".kineticjs-content:first canvas").css({backgroundImage: 'url(img/bg.png)'})
    } else {
      $(".kineticjs-content:first canvas").css({backgroundImage: 'none'})
    }
    redraw_map()
    show_shape_hint(next_shape)
    layer_hint.draw()
  }
  
  this.save_configuration = save_configuration
  this.show_configuration_window = show_configuration_window

  //$("[name='f-background'][value='f-background-3']").prop({checked: true})

  var send_history = function(states) {
    if (only_drop) return;
    _play = false
    if (moves < 5) return;
    //moves = 0;
    var _date = new Date().getTime()
    var _time = formatGameTimeMS(current_time)
    _cl('send_history:', _userId, points, _date, _time)
    try{states[0].can_play = check_space(shape, shape_x, shape_y)} catch(e) {}
    var _data = {
      set           : true                                  ,
      user_id       : _userId                               ,
      points        : points                                ,
      date          : (_date / 1000) | 0                    ,
      time          : _time                                 ,
      states        : states ? JSON.stringify(states) : null,
      configuration : JSON.stringify(configuration)
    }
    if(states != null && game_id != null) {
      _data.game_id = game_id;
    }
    if (!_pause) toggle_play()
    $.post("./back/core.php", _data).done(function(response) {
      _cl('response:', response)
      if(response.game_id) {
        game_id = response.game_id;
      }
        //if(response.success) {
        //}
    })
  }
  
  var _toggle_history = false
  
  var history_preload = function() {
    if ($(".row").length == 0) {
      setTimeout(history_preload, 100)
    } else {
      $("html:not(:animated),body:not(:animated)").animate({
        scrollTop: 500
      }, 500);
      $('#history-preload').hide()
      $('#history-block, #history-title').show()
      $("#history-content").show()
      $(".history-block h4").show()

      $("#history-content .col-1").slice(1).css({width: '100px', textAlign: 'right'})
      $("#history-content .col-2").slice(1).css({width: '40px', textAlign: 'center'})
      $("#history-content .col-3").slice(1).css({width: '40px', textAlign: 'center'})
      $("#history-content .col-4").slice(1).css({textAlign: 'center'})

      move_map_to_center()
    }
  }
  
  var toggle_history = function() {
    _cl('toggle_history', _toggle_history)
    if (_toggle_rating) {
      $('#rating-block').hide();
      _toggle_rating = false;
    }
    $('#history-block:visible').hide()
    if (_toggle_history) {
      _toggle_history = false
      _cl('hide history')
    } else {

      $('#history-content .row').remove()
      $('#history-preload').show()
      $('#history-block, #history-title').hide()
      $("#history-content").hide()
      $(".history-block h4").hide()

      ui.showPanel({
        id: "history-block"
      })

      move_map_to_center()
      history_preload()

      setTimeout(function() {
          window.scrollTo(0, 500)
        }, 500)
        //$('#binfoTitle').html('История')
      move_map_to_center()

      var _e = $('#history-content')
      $('.row + .row', _e).remove()
      $('.row:eq(0)', _e).remove()
      get_history()
        /*
        if(_toggle_rating) {
          $("#rating-block").hide()
          _toggle_rating = !1
        }
        */
      _toggle_history = true
    }
  }
  
  this.hide_history = function() {
    
    if(_toggle_history) toggle_history()
  }
  
  this.hide_rating = function() {
     
     if(_toggle_rating) toggle_rating()
  }
  
  this._hide = function() {
    this.hide_history()
    this.hide_rating()
  }
  
  this.toggle_history = toggle_history
  
  var get_history = function(page) {
    if (page == null) page = 1
    $.post("./back/core.php", {
      get: true,
      user_id: _userId,
      page: page
    }).done(function(response) {
      if (response.success) {
        draw_history(response)
      }
    })
  }
  
  var loaded = false;
  
  var draw_history = function(e) {

    if(e.lines.length == 0) {
      $('#history-block:visible').hide()
      //show_info('Пока не сыграно ни одной игры')
    }

    for (i in e.lines) {
      var _row = $('<tr>').addClass('row').css({'background-color' : ((function () {try{_cl('can_play:', JSON.parse(e.lines[i].states)[0].can_play);return JSON.parse(e.lines[i].states)[0].can_play} catch(e) {return false}})() ? '#FFFFEE' : '#FFEEEE')})
        .append($('<td>').addClass('col col-1').html(formatDateRu2(e.lines[i].date))) // date
        .append($('<td>').addClass('col col-2').html(formatTime(e.lines[i].date).split(' ')[1])) // time
        .append($('<td>').addClass('col col-3').html(e.lines[i].time)) // time in game
        .append($('<td>').addClass('col col-4').html(e.lines[i].points)) // points
      if (e.lines[i].states) {
        var _store = JSON.parse(e.lines[i].states)
        var _game_id = JSON.parse(e.lines[i].game_id)

        $(_row).addClass("bt-recover").click(function() {
          var load = function() {
            try{_cl('LOAD:', this)
              if (!_pause) toggle_play()
              states = clone(this.store)
              //game_id = clone(this.game_id)
              game_id = this.game_id

              loaded = true
              if(states[states.length - 1]) current_time = states[states.length - 1].current_time
             //current_time = states[states.length - 1].game_id
              rewind()

              _cl('LOAD GAME, MOVES:', moves)
              moves = 0 // если только загрузили не пытаться сохранить по новой при загрузке другого сохранения или загрузке новой игры

              redraw_timer()
            } catch(e) {
              _cl('Error #1', e, this)
            }
          }.bind(this)
          if (!loaded && moves >= min_moves) {
            prompt('', contexts['ui']['savegame'],
              function() {
                var _states = []
                _states.push(states.pop())
                send_history(_states)
                load()
              },
              function() {
                send_history()
                load()
              })
          } else {
            load()
          }
        }.bind({
          store: _store,
          game_id: _game_id
        }))
      }
      $('#history-content').append(_row)
    }
    $(".col").css({backgroundColor: 'transparent'})
    $('.row').each(function() {
      $('td', this).slice(1, 3).each(function() {
        var a = $(this).html();
        a = a.split(":");
        for(i in a) a[i] = a[i].length == 1 ? '0' + a[i] : a[i]
        a = a.join(":")
        $(this).html(a);
      })
    })
    if (e.next_page) _cl('next_page:', e.next_page)
  }

  var toggle_hint = function() {
    $("#tbHelp").toggleClass("yellow")
    $("#canvas_hint canvas").toggle()
      //$('#canvas_hint').toggle()
    _cl('show hint:', _hint)
      //_hint ^= true
      //clear_hint()
      //show_shape_hint(next_shape)
  }
  
  this.toggle_hint = toggle_hint

  var toggle_play = function() {
    _pause ^= true
    if (_pause) {
      $("#tbReplay").addClass("yellow")
    } else {
      $("#tbReplay").removeClass("yellow")
    }

    try{if (!_key_press_time) {
      _key_press_time = new Date().getTime()
    } else {
      _key_press_time = new Date().getTime() - _key_press_time
    }} catch(e) {}
  }
  
  this.toggle_play = toggle_play

  var _toggle_rating = false

  var fixing = function() {

    // Да знаю, что это феерический П****Ц, зато быстро и работает

    bottomInfo = $('#bottomInfo')
    $('table', bottomInfo).css({
      'border-collapse': 'collapse'
    })
    $('table thead tr', bottomInfo).slice(0, 2).find('th').css({
      'background': '#eeeeee'
    });
    $('table thead tr:eq(1) th', bottomInfo).css({
      'border-top': '0px'
    });
    $('table thead tr:eq(0) th', bottomInfo).css({
      'border-bottom': '0px'
    })
    $('.rating-table tr').slice(2, 3).each(function() {
      $('td, th', this).slice(1, 2).css({
        'border-left': '0px'
      })
    })
    $('.rating-table tr').slice(2, 3).each(function() {
      $('td, th', this).slice(0, 1).css({
        'border-right': '0px'
      })
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).eq(1).css({
        'border-left': '0px'
      })
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).eq(0).css({
        'border-right': '0px'
      })
    })
    $('.rating-table').css({
      width: '100%'
    })
    $('.rating-table tr').slice(2).each(function() {
      $('td, th', this).slice(2).css({
        'text-align': 'center'
      })
    })
    $('.rating-table tr').slice(2).each(function() {
      $('td, th', this).eq(0).css({
        'text-align': 'right'
      })
    })
    $('.close_icon:visible:eq(1)').remove()
    $('.bubblePanel').css({
      'box-shadow': '0px 0px 0px',
      border: 'solid 1px #ddd'
    })
    $('.rating-table').css({
      'font-size': '8pt'
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).last().css({
        'width': '80px'
      })
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).eq(4).css({
        'width': '50px'
      })
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).eq(3).css({
        'width': '80px'
      })
    })
    $('.rating-table tr').slice(0, 2).each(function() {
      $('td, th', this).eq(2).css({
        'width': '80px'
      })
    })
    $('.rating-table tr').slice(3).each(function() {
      $('td ', this).slice(1, 5).css({
        textAlign: 'left',
        paddingLeft: '10px'
      })
    })

    $(".rating-table tr").slice(3).css({height: '26px', lineHeight: '26px'})

    $('.player-online')
    .parent().find('tr:eq(2)[userid]')
    .css({height : '30px'})
    .find('td:eq(0)')
    .css({borderRight : 'solid 1px #dcdcdc'})
    .parent().find('td').slice(1, Infinity)
    .css({paddingLeft : '10px', textAlign : 'left'})
    
    move_map_to_center()
  }

  var _online = false;

  var rating_preload = function() {
    if ($(".rating_username").length == 0) {
      setTimeout(rating_preload, 100)
    } else {
      $("#rating-content").show()
      $(".close_icon:visible:eq(1)").remove()
      $("#rating-preload").hide()
      $("html:not(:animated),body:not(:animated)").animate({
        scrollTop: 500
      }, 500);
      move_map_to_center()

      $("#rating-autocomplete").autocomplete({
        source: function (request, response) {
          $.ajax({
            type: "POST",
            url:"./back/core.php",
            data: {get_names: request.term},
            success: response,
            dataType: 'json'
          });
        },
        select: function(a, b) {
          _cl(b)
          get_rating2(null, null, null, b.item.value)
        }
      }, {minLength: 1});
    }
  }
  
  var toggle_rating = function() {
    $('#history-block:visible').hide()
    _toggle_history = false
    if (_toggle_rating) {
      $('#rating-block').hide();
      _toggle_rating = false;
      return;
    }
    $('#rating-block').show()
    _toggle_rating = true;

    $("#rating-content").hide()
    $("#rating-preload").show()
    move_map_to_center()
    rating_preload()

    RatingRender.setTabs([{
      id: 'all_players',
      title: contexts['ui']['allplayers']
    }, {
      id: 'online_players',
      title: contexts['ui']['onlineplayers']
    }]);

    RatingRender.setColumns([{
        id:                                                    'rank',
        title: contexts['rating']['placeLabel']
      }, {
        id:                                                    'username',
        title: contexts['rating']['usernameLabel']
      }, {
        id:                                                    'points',
        title: contexts['ui']['maxpointspergame'],
        order: 1,
        toptitle: 'Сортировать по Очкам',
        onClick: function(userid, colid, tabid, col) {
          _cl(colid, userid, col)
        }
      }, {
        id:                                                    'points_all',
        title: contexts['ui']['averagepoints'],
        order: 0,
        toptitle: 'Сортировать по Очкам'
      }, {
        id:                                                    'games_played',
        title: contexts['ui']['totalgames'],
        order: 0
      },
      //{  id: 'victory',     title: 'Выйграл <br> у соперников', order: 0, sup: true, tooltip: true },
      //{  id: 'percent',     title: '%', order: 0, isGrey: true },
      // {
      //   id:                                                    'date_first',
      //   title: contexts['profile']['regDateLabel'],
      //   order: 0,
      //   isGrey: true,
      //   isDate: true
      // }
    ]);

    RatingRender.setDiv($('#rating-content'));

    get_rating2(1, null, 1);
    setTimeout(function() {
      window.scrollTo(0, 1000)
    }, 500)

    RatingRender.onColumnClick(function(data) {
      _cl('onColumnClick', data);
      //RatingRender.render(testData);
      get_rating2(1, data.column.id, data.column.order, _online ? 1 : 0)
        //RatingRender.render(_debug);
    }).onTabClicked(function(data) {
      _cl('onTabClicked', data);
      _online = data.tabid == "online_players" ? true : false
      get_rating2(1, 'points', '1', data.tabid == "online_players" ? 1 : 0)
    }).onUserClick(function(data) {
      _cl('onUserClick', data);
      var id = data.userid
      var name = data.username
      controller.getClientServer().sendRequest(GTW_PLAYER_DETAIL, {
        playerId: id
      }, function(data1, data) {
        $.ajax({
          type: "POST",
          url: "/skiff/php/ratingAPI.php",
          data: "resource=getHistory&idglobal=" + id,
          cache: false,
          dataType: 'json'
        }).success(function(date) {
          $('#rating-content').html('<center><h2>' + name + '</h2></centeR>' + PlayerProfile.renderProfile(data.profile), 'info-user-block');
          ui.getUserProfile().bindActions(data.profile);
        }).error(function(e) {
          _cl('error');
          _cl(e);
        });

      });
    }).onFilter(function(data) {
      _cl('onFilter', data);
      get_rating2(null, null, null, data.filter)
    }).onClose(function() {
      _cl('close');
      $('#rating-block').hide()
    }).onShowMore(function(data) {
      _cl('onShowMore', data);
      RatingRender.append(testData);
    });
  }
  
  this.toggle_rating = toggle_rating

  var get_rating2 = function(page, sort_by, order, online) {
    _cl('get_rating2:', sort_by, order, online)
    if (page == null) page = 1
    if (order == null) order = '-1'
    if (sort_by == null) sort_by = 'points'
    if (online == null) online = 0

    var query = '';
    if (online != '1' && online != '0') {
      query = online
      online = 0
    }
    $.post("./back/core.php", {
      get_rating: true,
      user_id: _userId,
      page: page,
      order: order,
      sort_by: sort_by,
      online: online,
      query: query
    }).done(function(response) {
      _cl('get_rating done', response)
      if (response.success) {
        RatingRender.render(response);
        $('#rating-block').show();
        fixing();
      }
    })
  }

  var load_rating = function() {
    var next = function() {
      next.i++;
      if (next.i >= next.a.length) next.i = 0;
      return next.a[next.i];
    }
    next.i = 0;
    next.a = ['&nbsp;&nbsp;&nbsp;', '.&nbsp;&nbsp;', '..&nbsp;', '...'];
    var go = null;
    var a = function() {
      $(".info-rating-preload").html(next());
      go = setTimeout(a, 300)
    };
    a();
    // $.post("./back/core.php", {
    //   get_rating: true,
    //   user_id:    _userId,
    //   page:       1,
    //   order:      1,
    //   sort_by:    'points',
    //   onpage:     1
    // }).done(function(response) {
    //   _cl('load_rating', response)
    //   if(response.success) {
        
    //     clearTimeout(go)
    //     try { $('#info-rating-your').html(response.infoUser.points) } catch(e) {}
    //     try { $('#info-rating-max').html(response.infoAllUsers[0].points) } catch(e) {}
    //   }
    // })
  }

  var game_id = null
  
  var init = function() {
    
    $("#divArrows").hide()
    $("#divArrows2").hide()
    
    function isTouchDevice() {
      try {
        document.createEvent('TouchEvent');
        return window.navigator.vendor.toLowerCase().split(' ')[0] != "opera";
      }
      catch(e) {
        return false;
      }
    }
    
    if(isTouchDevice()) {
      //configuration.ipod = true
      $("#divArrows").show()
      //$("#divArrows2").show()
    }
    
    // document.getElementById('field').style.background = 'url(./bg/bg-3.jpg)'

    only_drop = true
    current_time = 0
    last_time = last_action_time = new Date().getTime()
    pause_timer = false

    moves = 0

    var random_seed = 1 + parseInt(Math.random() * 10000)
    RNG.setSeed(random_seed)

    start_game_time = new Date().getTime()
    stage = new Kinetic.Stage({
      container: canvas_area,
      width: canvas_width,
      height: canvas_height
    })
    layer = new Kinetic.Layer()
    stage.add(layer);
    stage_hint = new Kinetic.Stage({
        container: canvas_hint,
        width: block_width * 4,
        height: block_height * 4
      })
    layer_hint = new Kinetic.Layer()
    stage_hint.add(layer_hint);

    gen_map()
    gen_map_hint()

    next_shape = random_shape()

    shape = clone(next_shape)

    next_shape = random_shape()

    shape_y = 0
    shape_x = parseInt(map_width / 2 - shape.shape.length / 2)
    
    // $.post("./back/core.php", {
    //   get:     true,
    //   get_configuration: true,
    //   user_id: _userId,
    //   page:    1,
    //   onpage:  1
    // }).done(function(response) {
    //   if(response.configuration) {
    //     configuration = JSON.parse(response.configuration)
    //     if(configuration.show_hint) {
    //       $('#tbHelp').addClass('yellow')
    //       $('#tbHelp .title').toggle()
    //     }
    //   }
    //   if(configuration.bg2) document.getElementById('field').style.background = configuration.bg2
    //   if(configuration.bg1) document.body.style.background = configuration.bg1
    //   if(configuration.grey_color == null) configuration.grey_color = '#A0A0A0';
    //   /*if(configuration.ipod) {
    //     _cl('configuration.ipod:', configuration.ipod)
    //     $("#divArrows").show()
    //   }*/
    //   if(configuration.canvasbg) {
    //     $(".kineticjs-content:first canvas").css({backgroundImage: 'url(img/bg.png)'})
    //   }

    //   if(response.lines != null) {
    //     //draw_history(response)
    //     //try{
    //     if(response.lines == null || response.lines.length == 0 || response.lines[0].states == null || response.lines[0].states == "[null]") {
    //       _cl('EMPTY SAVE 1')
    //       _new_game()
    //     } else {
    //       game_id = response.lines[0].game_id
    //       _cl('GAME ID:', game_id, response)
    //       states = response.lines[0].states == null ? [] : JSON.parse(response.lines[0].states)
    //       _cl('configuration.bg:', configuration.bg1, configuration.bg2)
    //       current_time = states[0].current_time
    //       points = states[0].points
    //       redraw_timer()
    //       rewind()
    //       loaded = true
    //       $("#tbRedo").addClass('bt-disabled')
    //       //load_rating()
    //     }
    //     /* catch(e) {
    //       _cl('EMPTY SAVE 2', response, e)
    //       _new_game()
    //     }*/
    //     $("#preload-image").remove()

    //   } else {
    //     _new_game()
    //     $("#preload-image").remove()
    //   }
    // })

    show_shape_hint(next_shape)
    show_shape(shape, shape_x, shape_y)
    //map_hint[0][0]._show()
    //show_shape(random_shape(), 3, 3)
    layer.draw()
    layer_hint.draw()
    //_cl('WIDTH', stage_hint.content.children[0].width)
    stage_hint.content.children[0].style.width = 100
    stage_hint.content.children[0].style.height = 100
    $(stage_hint.content.children[0]).css({
      width: '100px',
      height: '100px'
    })
    //stage_hint.content.children[0].width = 100
    //stage_hint.content.children[0].height = 100
    var _key_press_time = 0
    var _down2 = true

    this.debug_pause = function() {
      _pause = false
      $("#tbReplay").removeClass("yellow")
      last_action_time = new Date().getTime()
    }

    document.addEventListener('keydown', function(e) {

      // if(ui.activePanels.length && ui.activePanels[0].id == "welcomePanel"){} else 
      // if($("#gbPostText:visible").length) {} else {
        last_action_time = new Date().getTime()

        var _key = true
        
        if (can_move) {
          if (mappings[e.keyCode]) {
            e.preventDefault();
            switch (mappings[e.keyCode]) {
              case 'left':
                move_left()
                _pause = false
                $("#tbReplay").removeClass("yellow")
                _key = false
                break;
              case 'right':
                _pause = false
                $("#tbReplay").removeClass("yellow")
                move_right()
                _key = false
                break;
              case 'drop':
                _pause = false
                $("#tbReplay").removeClass("yellow")
                drop()
                _key = false
                break;
              case 'down':
                //if (!_down2) break;
                _pause = false
                $("#tbReplay").removeClass("yellow")
                move_down()
                if (!_key_press_time) {
                  _key_press_time = new Date().getTime()
                } else {
                  _key_press_time = new Date().getTime() - _key_press_time
                }
                _key = false
                break;
              case 'rotate':
                _pause = false
                $("#tbReplay").removeClass("yellow")
                rotate()
                _key = false
                break;
            }
          }
        }

        if (e.keyCode == 90 || e.keyCode == 27) {
          rewind()
          if (_pause == false) toggle_play()
        } else
        //if (e.keyCode == 80 || e.keyCode == 71) {
        //}
        if (e.keyCode == 70) {
          forward()
        } else
        if (e.keyCode == 78) {
          new_game()
        } else
        if (e.keyCode == 72) {
          toggle_hint()
        } else if(_key){
          toggle_play()
        }

      // }

    })
    
    document.addEventListener('keyup', function(e) {
      
      // if(ui.activePanels.length && ui.activePanels[0].id == "welcomePanel"){} else 
      if (mappings[e.keyCode]) {
      } else if($("#gbPostText:visible").length) {} else {
        e.preventDefault();
        switch (mappings[e.keyCode]) {
          case 'left':
            press_left = false;
            break;
          case 'right':
            press_right = false;
            break;
          case 'drop':
            break;
          case 'down':
            _drop = true;
            _down = true;
            _down2 = true;
            _key_press_time = 0
            break;
          case 'rotate':
            press_rotate = false;
            break;
        }
      }

    })

    _pause = true
    $("#tbReplay").addClass("yellow")

    timer()
    _timer()
    load_rating()

    window.onresize = move_map_to_center;
  }.bind(this)
  
  init()
   
  window._onbeforeunload = window.onbeforeunload = function() {

    var _date = new Date().getTime()
    var _time = formatGameTimeMS(current_time)
    save_state()
    _cl('send_history:', _userId, points, _date, _time, states)
    _states = []
    _states.push(states.pop())
    if(_states.length == 0) {return;};
    try {
    _states[0].can_play = check_space(shape, shape_x, shape_y);
    } catch(e) {}
    _cl("ONBEFOREUNLOAD", 'states:', states, '_states:', _states)
    var _data = {
      set           : true                                    ,
      user_id       : _userId                                 ,
      points        : points                                  ,
      date          : (_date / 1000) | 0                      ,
      time          : _time                                   ,
      states        : _states ? JSON.stringify(_states) : null,
      configuration : JSON.stringify(configuration)
    }
    if(game_id != null) _data.game_id = game_id
    $.ajax({
      async:    false,
      url:      './back/core.php',
      type:     'POST',
      dataType: 'json',
      data:     _data,
      done:     function() {
      },
      success:  function(data) {
         _cl('SUCCESS', data)
      },
      success:  function(e) {
         _cl('ERROR', e)
      }
    })
  }
  
  this.set_configuration = function(a) {
    for(i in a) {
      configuration[i] = a[i]
      _cl('set_configuration:', configuration)
      if(i == 'grey_color') {
        var _color = a[i].split("(")[1].split(")")[0].split(",")
        configuration[i] = rgbToHex(_color[0]|0, _color[1]|0, _color[2]|0)
      }
    }
  }
  
  this.rotate = rotate
  this.drop = drop
  this.move_left = move_left
  this.move_right = move_right
  this.mmtc = move_map_to_center
}

// ---------------------------------------------------------------------------------------------------------

var set_configuration;
var move_map_to_center = null
$(document).ready(function() {
  var G = new Game()
  move_map_to_center = G.mmtc
  set_configuration = G.set_configuration
  $("#bbParameters").click(function() {
    G.show_configuration_window()
  })
  $("#gpCommit").click(function() {
    G.save_configuration()
    $('.bubblePanel').hide()
  })
  $('.gpCloseIcon').click(function() {
    $('.bubblePanel').hide()
    G._hide()
    $(".controlPanelLayout:eq(1) .cpButton").removeClass("yellow")
  })
  $("#gpCancel").click(function() {
    $('.bubblePanel').hide()
    G._hide()
    $(".controlPanelLayout:eq(1) .cpButton").removeClass("yellow")
  })
  $("#tbNewGame").click(function() {
    G.new_game()
  })
  $('#message-window .gpCloseIcon').click(function() {
    G.new_game()
  })
  $("#prompt-done").click(function() {
    G.prompt_done()
  })
  $("#prompt-cancel").click(function() {
    G.prompt_cancel()
  })
  $("#bbHistory, #history_close_icon").click(function() {
    G.toggle_history()
    var _yellow = !$(this).hasClass("yellow")
    $(".controlPanelLayout:eq(1) .cpButton").removeClass("yellow")
    if(_yellow) {
      $(this).addClass("yellow")
    } else {
      $(this).removeClass("yellow")
    }
  })
  $("#bbRatings, #rating_close_icon").click(function() {
    G.toggle_rating()
    var _yellow = !$(this).hasClass("yellow")
    $(".controlPanelLayout:eq(1) .cpButton").removeClass("yellow")
    if(_yellow) {
      $(this).addClass("yellow")
    } else {
      $(this).removeClass("yellow")
    }
  })
  $("#tbHelp").click(function() {
    $(".color-hint").toggle()
    G.toggle_hint()
  })
  
  $("#imgArrUp").bind('touchstart', function() {
    G.debug_pause()
    G.rotate()
  })
  var a = {}, b = {}

  document.body.getElementsByTagName('canvas')[0].addEventListener('touchstart', function(event) {
    a = {
      x: event.touches[0].screenX,
      y: event.touches[0].screenY
    }
  }, false);

  document.body.getElementsByTagName('canvas')[0].addEventListener('touchmove', function(event) {
    b = {
      x: event.touches[0].screenX,
      y: event.touches[0].screenY
    }
  }, false);
  
  document.body.getElementsByTagName('canvas')[0].addEventListener('touchend', function() {
    _cl(a, b)
    G.debug_pause()
    if( Math.abs(a.x - b.x) > Math.abs(a.y - b.y) ) {
      //if(Math.abs(a.x - b.x) < 50) {
      //  G.rotate()
      //  _cl('rotate')
      //} else {
        
        if(b.x > a.x) {
          G.move_right()
          _cl('right')
        } else {
          G.move_left()
          _cl('left')
        }
      //}
    } else {

        if(b.y > a.y) {
          G.drop()
          _cl('drop')
        } else {
          G.rotate()
          _cl('rotate')
        }

    }
    if (!_key_press_time) {
      _key_press_time = new Date().getTime()
    } else {
      _key_press_time = new Date().getTime() - _key_press_time
    }
  })
  $("#imgArrLeft").bind('touchstart', function() {
    G.debug_pause()
    G.move_left()
  })
  $("#imgArrRight").bind('touchstart', function() {
    G.debug_pause()
    G.move_right()
  })
  $("#imgArrDown").bind('touchstart', function() {
    G.debug_pause()
    G.drop()
  })

  $("#imgZoomPlus").bind('touchstart', function() {
    var scale = $('meta[name=viewport]').attr('content').split('initial-scale=')[1].split(',')[0] * 1 + 0.1
    $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=' + scale.toFixed(1) + ', user-scalable=yes')

  })

  $("#imgZoomMinus").bind('touchstart', function() {
    var scale = $('meta[name=viewport]').attr('content').split('initial-scale=')[1].split(',')[0] * 1 - 0.1
    $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=' + scale.toFixed(1) + ', user-scalable=yes')

  })

  $("#tbReplay").click(function() {
    G.toggle_play()
  })
  $('#tbUndo').click(function() {
    G.rewind()
  })
  $('#tbRedo').click(function() {
    G.forward()
  })
  $("#bbProfile").click(function() {
    var _yellow = !$(this).hasClass("yellow")
    $(".controlPanelLayout:eq(1) .cpButton").removeClass("yellow")
    if(_yellow) {
      $(this).addClass("yellow")
    } else {
      $(this).removeClass("yellow")
    }
  });
  window.debug = G.debug

  if( window.navigator.userAgent.indexOf("MSIE ") > 0 ) {
      $(".lg-vkgroup").css({left: '800px', position: 'absolute'}).find("img").width(100).css({border: '0px'})
      $(".switchLocale").css({left: '800px', position: 'absolute'}).width(26)
      $(".controlPanelLayout:eq(0)").height(36)
  }
  move_map_to_center()
})
