// 2. Setting up variables that describe our chart's space.
const width = 1000;
const height = 600;;
const margin = ({top: 10, right: 10, bottom: 20, left: 20});
var active = d3.select(null);
var scale = 140;

// 3. Create a SVG we will use to make our chart.
var svg1 = d3.select("#main_map").append('svg')
  .attr('width', width)
  .attr('height', height);

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(scale)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([2, 4, 8, 16, 32, 64] )
  .range(d3.schemeBlues[7]);

var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

function zoomed() {
    svg1.selectAll("g").style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    svg1.selectAll("g").attr("transform", d3.event.transform); // updated for d3 v4
  }

// THREAT CHART STUFF
var tmargin = {top: 50, right: 40, bottom: 150, left: 40};
var twidth = 400 - tmargin.left - tmargin.right;
var theight = 500 - tmargin.top - tmargin.bottom;

var svg2 = d3.select("#threat").append("svg")
    .attr("width", twidth + tmargin.left + tmargin.right)
    .attr("height", theight + tmargin.top + tmargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

var x = d3.scaleBand() // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([0, twidth])
    .padding(0.1);

var y = d3.scaleLinear().range([theight, 0]);

var threatData, xAxis, yAxis;
var threat_cts = {};

d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-cindy/main/threats.csv", function(error, data) {
    if (error) throw error;

    threatData = data;

    // var threat_cts = {};

    data.forEach( function(d) {
        var ttype = d.threat_type;
        var threatened = +d.threatened;
        if (threat_cts[ttype] === undefined){
            threat_cts[ttype] = 0;
        } else if (threatened==1) {
            threat_cts[ttype] = threat_cts[ttype] + 1;
        }

    });

    threat_cts = d3.entries(threat_cts);
    threat_cts.sort(function(x, y){
        return d3.descending(x.value, y.value);
     })
  
    // Scale the range of the data in the domains
    x.domain(threat_cts.map(function(d) { return d.key; }));
    y.domain([0, d3.max(threat_cts, function(d) { return d.value; })]);
  
    // append the rectangles for the bar chart
    svg2.selectAll("rect")
        .data(threat_cts)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return theight - y(d.value); })
        .attr("fill", "Crimson");

    svg2.append("text")
        .attr("x", (twidth / 2))             
        .attr("y", 0 - margin.top/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .attr("font-family", "Arial, Helvetica, sans-serif")  
        .text("Number of Species by Threat");
  
    // add the x Axis
    xAxis = svg2.append("g")
        .attr("class","xaxis")
        .attr("transform", "translate(0," + theight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");
  
    // add the y Axis
    yAxis = svg2.append("g")
        .call(d3.axisLeft(y));

});

var svg3 = d3.select("#actions").append("svg")
    .attr("width", twidth + tmargin.left + tmargin.right)
    .attr("height", theight + tmargin.top + tmargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

var x_a = d3.scaleBand() // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([0, twidth])
    .padding(0.1);

var y_a = d3.scaleLinear().range([theight, 0]);
var actionData, xAxis_a, yAxis_a;
var action_cts = {};

d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-cindy/main/actions.csv", function(error, data) {
    if (error) throw error;

    actionData = data.filter(d => d.action_type!='Unknown');

    actionData.forEach( function(d) {
        var atype = d.action_type;
        var action_taken = +d.action_taken;
        if (action_cts[atype] === undefined){
            action_cts[atype] = 0;
        } else if (action_taken==1) {
            action_cts[atype] = action_cts[atype] + 1;
        }
    });

    action_cts = d3.entries(action_cts);
    action_cts.sort(function(x, y){
        return d3.descending(x.value, y.value);
     })
  
    // Scale the range of the data in the domains
    x_a.domain(action_cts.map(function(d) { return d.key; }));
    y_a.domain([0, d3.max(action_cts, function(d) { return d.value; })]);
  
    // append the rectangles for the bar chart
    svg3.selectAll("rect")
        .data(action_cts)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x_a(d.key); })
        .attr("width", x_a.bandwidth())
        .attr("y", function(d) { return y_a(d.value); })
        .attr("height", function(d) { return theight - y_a(d.value); })
        .attr("fill", "#69b3a2");

    svg3.append("text")
        .attr("x", (twidth / 2))             
        .attr("y", 0 - margin.top/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .attr("font-family", "Arial, Helvetica, sans-serif")    
        .text("Actions Taken");
  
    // add the x Axis
    xAxis_a = svg3.append("g")
        .attr("class","xaxis")
        .attr("transform", "translate(0," + theight + ")")
        .call(d3.axisBottom(x_a))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");
  
    // add the y Axis
    yAxis_a = svg3.append("g")
        .call(d3.axisLeft(y_a));

});

// PLANTS OVER TIME

var date_ranges = ['Before 1900', '1900-1919', '1920-1939','1940-1959','1960-1979','1980-1999','2000-2020'];

// append the svg object to the body of the page
var svg4 = d3.select("#plants").append("svg")
        .attr("width", twidth + 50 + tmargin.right)
        .attr("height", theight + tmargin.top + tmargin.bottom)
        .append("g")
        .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

var x_p = d3.scalePoint().range([0, twidth]).domain(date_ranges);

var y_p = d3.scaleLinear().range([ theight, 0 ]);

var plantData, xAxis_p, yAxis_p;
var plant_cts = {};

d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-cindy/main/plants.csv", function(data) {

        plantData = data.filter(d => d.year_last_seen!="NA");

        plantData.forEach( function(d) {
            var year = d.year_last_seen;
            if (plant_cts[year] === undefined){
                plant_cts[year] = 0;
            } else {
                plant_cts[year] = plant_cts[year] + 1;
            }
        });
    
        plant_cts = d3.entries(plant_cts);
        console.log(plant_cts);
        // Add Y axis
        y_p.domain([0, d3.max(plant_cts, function(d) { return  d.value; })])
        plant_cts.sort(function(first, second) {
            return date_ranges.indexOf(first.key) - date_ranges.indexOf(second.key);
          });

        // Add the area
        svg4.append("path")
        .datum(plant_cts)
        .attr("class","areaChart")
        .attr("fill", "#69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("d", d3.area()
            .x(function(d) { console.log(x_p(d.key)); return x_p(d.key) })
            .y1(function(d) { console.log(y_p(d.value)); return y_p(d.value) })
            .y0(theight)
            );

        svg4.append("text")
            .attr("x", (twidth / 2))             
            .attr("y", 0 - margin.top/2)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px")   
            .attr("font-family", "Arial, Helvetica, sans-serif")  
            .text("Number of Species Last Seen");
    
         // Add X axis --> it is a date format
         xAxis_p = svg4.append("g")
                    .attr("class","xaxis")
                    .attr("transform", "translate(0," + theight + ")")
                    .call(d3.axisBottom(x_p))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", "rotate(-25)");

         yAxis_p = svg4.append("g").call(d3.axisLeft(y_p));

})


var svgl = d3.select("#species").append("ol");

clicked = function(d) {

    // 1. UPDATE THREAT CHART
    const newData = threatData.filter(datum => datum.country == d.properties.name);
    var new_threat_cts = {};

    newData.forEach( function(dd) {
        var ttype = dd.threat_type;
        var threatened = +dd.threatened;
        if (new_threat_cts[ttype] === undefined){
            new_threat_cts[ttype] = 0;
        } else if (threatened==1) {
            new_threat_cts[ttype] = new_threat_cts[ttype] + 1;
        }

    });

    new_threat_cts = d3.entries(new_threat_cts);
    new_threat_cts.sort(function(x, y){
        return d3.descending(x.value, y.value);
     })

    console.log(d.properties.name);

    x.domain(new_threat_cts.map(function(datum) { return datum.key; }));

    svg2.selectAll(".xaxis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");
    y.domain([0, d3.max(new_threat_cts, function(datum) { return datum.value; })]);
    yAxis.transition().duration(100).call(d3.axisLeft(y));


    var u = svg2.selectAll("rect").data(new_threat_cts)
    
    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("x", function(datum) { return x(datum.key); })
        .attr("width", x.bandwidth())
        .attr("y", function(datum) { return y(datum.value); })
        .attr("height", function(datum) { return theight - y(datum.value); })
        .attr("fill", "Crimson");
    
    u.exit().remove()

    threat_cts = new_threat_cts;

    // 2. Update Actions Taken
    const newActions = actionData.filter(datum => datum.country == d.properties.name);
    var new_action_cts = {};

    newActions.forEach( function(d) {
        var atype = d.action_type;
        var action_taken = +d.action_taken;
        if (new_action_cts[atype] === undefined){
            new_action_cts[atype] = 0;
        } else if (action_taken==1) {
            new_action_cts[atype] = new_action_cts[atype] + 1;
        }
    });

    new_action_cts = d3.entries(new_action_cts);
    new_action_cts.sort(function(x, y){
        return d3.descending(x.value, y.value);
     })

    x_a.domain(new_action_cts.map(function(datum) { return datum.key; }));

    svg3.selectAll(".xaxis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x_a))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");
    y_a.domain([0, d3.max(new_action_cts, function(datum) { return datum.value; })]);
    yAxis_a.transition().duration(100).call(d3.axisLeft(y_a));

    var u3 = svg3.selectAll("rect").data(new_action_cts)
    
    u3.enter()
        .append("rect")
        .merge(u3)
        .transition()
        .duration(1000)
        .attr("x", function(datum) { return x_a(datum.key); })
        .attr("width", x_a.bandwidth())
        .attr("y", function(datum) { return y_a(datum.value); })
        .attr("height", function(datum) { return theight - y_a(datum.value); })
        .attr("fill", "#69b3a2");
    
    u3.exit().remove()

    action_cts = new_action_cts;

    // 3. Update Species Last Seen
    const newSpecies = actionData.filter(datum => datum.country == d.properties.name);
    var new_plant_cts = {};

    newSpecies.forEach( function(d) {
        var year = d.year_last_seen;
        if (new_plant_cts[year] === undefined){
            new_plant_cts[year] = 0;
        } else {
            new_plant_cts[year] = new_plant_cts[year] + 1;
        }
    });

    new_plant_cts = d3.entries(new_plant_cts);
    new_plant_cts.sort(function(first, second) {
        return date_ranges.indexOf(first.key) - date_ranges.indexOf(second.key);
      });
    // Add Y axis
    y_p.domain([0, d3.max(new_plant_cts, function(datum) { return datum.value; })]);
    yAxis_p.transition().duration(100).call(d3.axisLeft(y_p));

    // Add the area
    svg4.selectAll(".areaChart").remove();
    
    svg4.append("path")
    .datum(new_plant_cts)
    .attr("class", "areaChart")
    .attr("fill", "#69b3a2")
    .attr("stroke", "#69b3a2")
    .attr("d", d3.area()
        .x(function(d) { console.log(x_p(d.key)); return x_p(d.key) })
        .y1(function(d) { console.log(y_p(d.value)); return y_p(d.value) })
        .y0(theight)
        );
    plant_cts = new_plant_cts;
    

    var list = d3.select("#species").select("ol").selectAll("li")
    .data(d3.map(newSpecies, function(d){return d.binomial_name;}).keys())
    
    list.exit().remove();

    list.enter().append("li").text(d => `${d}`);

}

d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", )
  .defer(d3.csv, "https://raw.githubusercontent.com/6859-sp21/a4-cindy/main/plants_by_country.csv", function(d) { data.set(d.code, +d.count); })
  .await(ready);

  function ready(error, topo) {

    let mouseOver = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(0)
          .style("opacity", .5)
        d3.select(this)
          .transition()
          .duration(0)
          .style("opacity", 1)
          .style("stroke", "black")
        tooltip.transition()
          .duration(10)
          .style("opacity", .9);
        tooltip.html("Country: " + d.properties.name + "<br/>Extinct Species: " + data.get(d.id))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY-50) + "px");
      };

      let mouseLeave = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(0)
          .style("opacity", .8);
        d3.select(this)
          .transition()
          .duration(0)
          .style("stroke", "transparent");
        tooltip.transition()
            .duration(10)
            .style("opacity", 0);
      };

    // Draw the map
    svg1.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
        // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      .on("click", clicked);
    
    svg1.call(zoom);
      
  }