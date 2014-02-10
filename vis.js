//change to something else when we deploy
//for now run by opening a terminal and typing
//"python -m SimpleHTTPServer" in the project directory
var host = "http://localhost:8000/"

var h1 = d3.map()
var h2 = d3.map()
var h3 = d3.map()
var h4 = d3.map()

//callback function that runs when all data is loaded
function ready() {
    var current = h3;

    //grab the body tag from the DOM, select all paragraphs
    d3.select("body").selectAll("p")
    //set data as keys from h1 (house 1 data)
    //sort by time it came on (earliest first)
	.data(current.keys().sort(function(a,b) {return a.time_on - b.time_on}))
	.enter()
	.append("p")
	.text(function(x) {
	    var a = current.get(x)
	    return ("Appliance: " + a.name + " was on for: "
				   + ((a.time_off - a.time_on)/60.0) + " minutes at time " + a.time_on) })
}

var i = 0;

//asynchronously load data files, and call ready when finished
queue()
    .defer(d3.csv, host + "data/H1.csv", function(d) { 
	h1.set(i++, {id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    })
    .defer(d3.csv, host + "data/H2.csv", function(d) { 
	h2.set(i++, {id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    })
    .defer(d3.csv, host + "data/H3.csv", function(d) { 
	h3.set(i++, {id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    })
    .defer(d3.csv, host + "data/H4.csv", function(d) { 
	h4.set(i++, {id: +d.id, name: d.Name, time_on: +d.time_on, time_off: +d.time_off}); 
    })
    .await(ready)




