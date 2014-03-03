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

    var start = 2351116420
    var end = 0


    //create a time that is within data window
    var seconds = new Date().getTime()/1000;
    seconds = seconds % 90000;
    var time = 1343684300 + seconds;

    //switch houses by switching this variable
    var current = h1;

    //power usage, in kWh, per appliance
    var app = d3.map();

    //return power use in kwh
    var power = function(a) {
	var time = (a.time_off - a.time_on);
	var wattsec = time * a.watts;
	var kwattsec = wattsec/1000.0;
	var kwh = kwattsec/3600.0;
	
	if (a.time_on < start) {
	    start = a.time_on
	}
	if (a.time_off > end) {
	    end = a.time_off
	}
	
	return kwh;
    }

    //return cost of some number of kWh
    var cost = function(a) {
	//cost of energy in seattle is 7.93 cents per kWh
	//see http://www.seattle.gov/light/conserve/resident/cv5_faq.htm#Answer5
	return a * .0793;
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
	.attr("src",function(d) {return "static/pics/"+pic_map[d]+".png"})
	.attr("width",150)
	.on("mouseover",function(d) { 
	    d3.select(this)
		.attr("title",
		      app.get(d).toFixed(3) + " kWh\n$" 
		      + cost(app.get(d)).toFixed(2) + "\n$" +
		      (180*(cost(app.get(d)))).toFixed(2) + " per year"
		     )
		.attr("width",160)
	})
	.on("mouseout",function(d) { 
	    d3.select(this)
		.attr("title","")
		.attr("width",150)
	})
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

var getLabels = function(d) {
  console.log(d);
};

//asynchronously load data files, and call ready when finished
d3.dsv(" ", "text/plain")("low_freq/house_1/labels.dat", function(r) {
  return r['mains'];
}, getLabels);




