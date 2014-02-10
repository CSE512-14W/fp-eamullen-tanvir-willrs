//change to something else when we deploy
//for now run by opening a terminal and typing
//"python -m SimpleHTTPServer" in the project directory
var host = "http://localhost:8000/"

//Mapping from appliances id to pictures
var pic_map = {};
pic_map[30] = "light_bulb";
pic_map[29] = "light_bulb";
pic_map[15] = "light_bulb";
pic_map[34] = "light_bulb";
pic_map[14] = "cfl_bulb";
pic_map[12] = "ceil_fan";
pic_map[13] = "cfl_bulb";
pic_map[3] = "cfl_bulb";
pic_map[1] = "cfl_bulb";
pic_map[5] = "cfl_bulb";
pic_map[4] = "cfl_bulb";
pic_map[6] = "light_bulb";
pic_map[18] = "light_bulb";
pic_map[10] = "cfl_bulb";
pic_map[22] = "cfl_bulb";
pic_map[23] = "cfl_bulb";
pic_map[31] = "cfl_bulb";
pic_map[33] = "cfl_bulb";
pic_map[37] = "light_bulb";
pic_map[26] = "cfl_bulb";
pic_map[27] = "cfl_bulb";
pic_map[28] = "cfl_bulb";
pic_map[25] = "cfl_bulb";
pic_map[24] = "light_bulb";
pic_map[7] = "cfl_bulb";
pic_map[11] = "dishwasher";
pic_map[2] = "dvd";
pic_map[17] = "tv";
pic_map[19] = "PS4";
pic_map[9] = "coffee_maker";
pic_map[21] = "light_bulb";
pic_map[11] = "dishwasher";
pic_map[38] = "washer";
pic_map[16] = "dryer";
pic_map[35] = "toaster";
pic_map[32] = "vacuum";
pic_map[8] = "vacuum";

var h1 = d3.map()
var h2 = d3.map()
var h3 = d3.map()
var h4 = d3.map()

//callback function that runs when all data is loaded
function ready() {

    //create a time that is within data window
    var seconds = new Date().getTime()/1000;
    seconds = seconds % 90000;
    var time = 1343684300 + seconds;

    //switch houses by switching this variable
    var current = h1;
    var app = d3.map();

    //return power use in kwh
    var power = function(a) {
	var time = a.time_off - a.time_on;
	var wattsec = time * a.watts;
	var kwattsec = wattsec/1000.0;
	var kwh = kwattsec/3600.0;
	return kwh;
    }

    for (var x in current.keys()) {
	if (!(current.get(x) === undefined)) {
	    var id = current.get(x).id;
	    var p = power(current.get(x));
	    if (app.get(id) === undefined) {
		app.set(id,p);
	    } else {
		var c = app.get(id);
		app.set(id,c+p);
	    }
	}
    }

    var data = app.keys().sort(function (a,b) {
	return app.get(b) - app.get(a);
    })

    var svgs = d3.select("body").selectAll("body")
	.data(data)
	.enter()
	.append("img")
	.attr("src",function(d) {return "appliances_pics/"+pic_map[d]+".png"})
	.attr("width",150)
	.on("mouseover",function(d) { d3.select(this).attr("title",app.get(d) + " kWh")})
	// .append("svg")
	// .style("width",150)
	// .style("height",150)
	// .text(function(d) {return d.num});

    // var circles = svgs
    // 	.append("circle")
    // 	.style("stroke","gray")
    // 	.style("fill","white")
    // 	.attr("r",40)
    // 	.attr("cx",50)
    // 	.attr("cy",50)

    // var texts = svgs
    // 	.append("text")
    // 	.attr("x",25)
    // 	.attr("y",55)
    // 	.attr("font-family","sans-serif")
    // 	.attr("font-size","20px")
    // 	.attr("fill","black")

    // svgs.on("mouseout", function(x){d3.select(this).select("text").text("")});
    // svgs.on("mouseover", function(x){d3.select(this).select("text").text(function(d) { return x.name })})
	// .on("mouseover", function(){d3.select(this)
	// .on("mouseout", function(){d3.select(this).style("fill","white")})
	// .text(function(x) {
	//     var a = current.get(x)
	//     return ("Appliance: " + a.name + " was on for: "
	// 			   + ((a.time_off - a.time_on)/60.0) + " minutes at time " + a.time_on) })
}

var i = 0;

//asynchronously load data files, and call ready when finished
queue()
    .defer(d3.csv, host + "data/H1_final.csv", function(d) { 
	h1.set(i++, {id: +d.ID, name: d.Name, time_on: +d.time_on, time_off: +d.time_off, watts: +d.watts}); 
    })
    // .defer(d3.csv, host + "data/H2.csv", function(d) { 
    // 	h2.set(++i, {num: i, id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    // })
    // .defer(d3.csv, host + "data/H3.csv", function(d) { 
    // 	h3.set(++i, {num: i, id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    // })
    // .defer(d3.csv, host + "data/H4.csv", function(d) { 
    // 	h4.set(++i, {num: i, id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    // })
    .await(ready)




