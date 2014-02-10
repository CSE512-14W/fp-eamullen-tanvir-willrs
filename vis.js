//here we'll import the real data
var dataset = [1,2,3,4,5,6];

//here we'll eventually make a table, with appliance graphics
d3.select("body").selectAll("p")
    .data(dataset)
    .enter()
    .append("p")
    .text(function(x) {return ("The data is: " + x);});
