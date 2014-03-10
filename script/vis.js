window.addEventListener('load', function() {
  var state = {
    numHouses: 6,
    house: 1
  };
  setupHouseChooser(state);
  loadHouse(state);
}, true);

var setupHouseChooser = function(state) {
  var chooser = document.createElement('select');
  for (var i = 0; i < state.numHouses; i++) {
    var opt = '<option value=' + (i+1) + '>House ' + (i+1) + '</option>';
    chooser.innerHTML += opt;
  }
  chooser.addEventListener('change', function() {
    state.house = chooser.value;
    loadHouse(state);
  });
  document.getElementById('choosehouse').appendChild(chooser);
};

var loadHouse = function(state) {
  if (state.conn) {
    state.conn.send('{"thing":"reset"}');
  } else {
    state.conn = new WebSocket('ws://' + location.host + '/data/stream');
    state.conn.addEventListener('message', function(m) {
      onMsg(state, m);
    });
    state.conn.addEventListener('open', function() {
      onMsg(state, {data:"{}"});
    });
  }
  state.toSend = [];
  loadChannels(state.house, function(channels) {
    for (var i = 0; i < channels.length; i++) {
      state.toSend.push('{"thing": "1.' + (i+1) + '.1303132959.1303132979"}');
    }
    console.warn(state.conn.readyState);
    if (state.conn.readyState === 1) {
      onMsg(state, {data:"{}"});
    }
    state.channels = channels;
    makeGraphs(state);
  });
};

var loadChannels = function(thing, cb) {
  d3.dsv(" ", "text/plain")("label/" + thing, function(r) {
    return r['mains'];
  }, cb);
};

var makeGraphs = function(state) {
  var container = document.getElementById('container');
  container.innerHTML = '';

  state.graphs = {};
  for (var i = 0; i < state.channels.length; i++) {
    var thing = state.house + "." + (i + 1) + ".1303132959.1303132979";
    var el = document.createElement('div');
    container.appendChild(el);
    var graph = {
      data: [],
      el: el
    };
    state.graphs[thing] = graph;
      
    graph.refresh = function() {
      if (this.data.length > 2) {
        this.graph.render();
      }

      if (this.data.length == 2) {
        this.graph = new Rickshaw.Graph( {
          element: this.el,
          width: 600, 
          height: 200, 
          series: [{
            color: 'steelblue',
            data: this.data
          }]
        });

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: this.graph
        });

        var xAxis = new Rickshaw.Graph.Axis.Time({
            graph: this.graph
        });

        xAxis.render();
      }
    }
  }
};

var onMsg = function(state, m) {
  while (state.toSend.length) {
    var item = state.toSend.shift();
    console.warn('subscribing to ' + item);
    state.conn.send(item);
  }
  var msg = JSON.parse(m.data);
  if (msg.data == 'connected' || !msg || !msg.thing) {
    return;
  }
  if (state.graphs[msg.thing] == undefined) {
    console.warn('no' + msg.thing);
    return;
  }
  state.graphs[msg.thing].data.push({
    x: state.graphs[msg.thing].data.length,
    y: Number(msg.data)
  });
  state.graphs[msg.thing].refresh();
};

