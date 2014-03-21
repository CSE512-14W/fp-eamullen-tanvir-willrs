var names = {};
names["mains"] = "Total Power";
names["oven"] = "Oven";
names["refrigerator"] = "Refrigerator";
names["dishwaser"] = "Dishwasher";
names["kitchen_outlets"] = "Kitchen Appliances";
names["lighting"] = "Lights";
names["washer_dryer"] = "Washer and Dryer";
names["microwave"] = "Microwave";
names["bathroom_gfi"] = "Hair Dryer";
names["electric_heat"] = "Electric Heater";
names["stove"] = "Stove";
names["disposal"] = "Garbage Disposal";
names["electronics"] = "Electronics";
names["furnace"] = "Furnace";
names["outlets_unknown"] = "Unknown Electronics";
names["smoke_alarms"] = "Smoke Alarms";
names["furance"] = "Furnace";
names["air_conditioning"] = "Air Conditioning";
names["miscellaeneous"] = "Unknown Electronics";
names["subpanel"] = "Subpanel";

window.addEventListener('load', function() {
  var state = {
    numHouses: 5,
    house: 1
  };
  window.state = state;
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
    console.warn('state house now ' + state.house);
    loadHouse(state);
  });
  document.getElementById('choosehouse').appendChild(chooser);
};

var start_time = 1303132929
var curr_time = 1303139250

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
      state.toSend.push('{"thing": "' + state.house + '.' + (i+1) + '.' + start_time + '.' + curr_time + '"}');
    }
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
  }, function(vals) {
    vals.unshift('mains');
    cb(vals);
  });
};

var makeLabel = function(state, i) {
  var container = document.createElement('div');
  container.className = 'label';
  container.addEventListener('click', toggleDetails.bind({}, state, i), false);

  var img = document.createElement('img');
  img.src = '/static/pics/' + state.channels[i] + '.svg';
  img.style.height = '150px';
  var text = document.createElement('span');
  text.innerText = names[state.channels[i]];

  var on = document.createElement('img');
  on.src = "http://www.mediaworks7.com/public/images/bg/green-light.png";
  on.className = 'onLight';

  container.appendChild(img);
  container.appendChild(text);
  container.appendChild(on);
  
  return container;
};

var toggleDetails = function(state, i) {
  if (!state.details || state.details.i != i) {
    if (state.details) {
      var el = state.details.el;
      document.body.removeChild(el);
    }
    state.details = {
      i : i,
      el: document.createElement('div')
    };
    var el = state.details.el;
    document.body.appendChild(el);
    el.className = 'details';
    el.innerHTML = 'Details for channel ' + i;
  } else {
    var el = state.details.el;
    document.body.removeChild(el);
    delete state.details;
  }
};

var makeGraphs = function(state) {
  var container = document.getElementById('container');
  container.innerHTML = '';

  state.graphs = {};
  for (var i = 0; i < state.channels.length; i++) {
    var thing = state.house + "." + (i + 1) + "." + start_time + "." + curr_time;
    var el = document.createElement('div');
    el.className = "graph hide";
    container.appendChild(el);
    
    var label = makeLabel(state, i);
    container.appendChild(label);
    var graph = {
      i: i,
      data: [],
      el: el,
      label: label,
      name: state.channels[i],
      total: 0.0
    };
    state.graphs[thing] = graph;
      
    graph.refresh = function() {
      if (this.data.length > 2 && this.graph) {
        this.graph.render();
        if (this.data[this.data.length - 1].y == 0) {
          this.label.className = "label off";
        } else {
          this.label.className = "label";
        }
      }

      if (this.data.length >= 2 && !this.graph) {
        this.el.className = "graph";
        this.graph = new Rickshaw.Graph( {
          element: this.el,
          width: 600, 
          height: 200, 
          series: [{
            name: names[this.name],
            color: 'steelblue',
            data: this.data
          }],
          min: 0,
          max: 2100
        });

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: this.graph,
            yFormatter: function(y) {
              return y.toFixed(2) + ' W';
            }
        });

        var xAxis = new Rickshaw.Graph.Axis.Time({
            graph: this.graph
        });

        var yAxis = new Rickshaw.Graph.Axis.Y({
          graph: this.graph,
          tickFormat: function(x) {
            return x + ' W';
          }
        });

        yAxis.render();
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
    //console.warn('no' + msg.thing);
    return;
  }
  if (msg.data.length > 2) {
    for (var i = 0; i < msg.data.length; i++) {
      state.graphs[msg.thing].data.push({
        x: Number(msg.data[i][0]),
        y: Number(msg.data[i][1])
      });

      var mul = (parseInt(msg.thing.split(".")[1]) < 2 ? 1 : 3);
      state.graphs[msg.thing].total += msg.data[i][1] * mul;
    }
  } else {
    state.graphs[msg.thing].data.push({
      x: Number(msg.data[0]),
      y: Number(msg.data[1])
    });

    var mul = (parseInt(msg.thing.split(".")[1]) < 2 ? 1 : 3);
    state.graphs[msg.thing].total += msg.data[1] * mul;

    if(state.graphs[msg.thing].i == 0) {
      document.getElementById('total').innerText = Math.round(state.graphs[msg.thing].total / 1000 / 3600 * 100)/100 + ' kWh';
    }
  }
  state.graphs[msg.thing].refresh();
};
