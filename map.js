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

svg1.append("rect")
  .attr("class", "background")
  .attr("fill", "white")
  .attr("width", width)
  .attr("height", height)
  .on("click", reset);

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


var plant_info = d3.select("#plant_info")
            .style("opacity", 0);

function zoomed() {
    svg1.selectAll("g").style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    svg1.selectAll("g").attr("transform", d3.event.transform); // updated for d3 v4
  }

// THREAT CHART STUFF
var tmargin = {top: 50, right: 30, bottom: 50, left: 140};
var twidth = 550 - tmargin.left - tmargin.right;
var theight = 350 - tmargin.top - tmargin.bottom;

var svg2 = d3.select("#threat").append("svg")
    .attr("width", twidth + tmargin.left + tmargin.right)
    .attr("height", theight + tmargin.top + tmargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

var y = d3.scaleBand() // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([theight, 0])
    .padding(0.1);

var x = d3.scaleLinear().range([0, twidth]);

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
        return d3.ascending(x.value, y.value);
     })
    // Scale the range of the data in the domains
    y.domain(threat_cts.map(function(d) { return d.key; }));
    x.domain([0, d3.max(threat_cts, function(d) { return d.value; })]);
  
    // append the rectangles for the bar chart
    svg2.selectAll("rect")
        .data(threat_cts)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth())
        .attr("x", x(0))
        .attr("width", function(d) { return x(d.value); })
        .attr("fill", "Crimson");

    svg2.append("text")
        .attr("x", (twidth / 2) )             
        .attr("y", 0 - margin.top/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("font-weight", "bold") 
        .attr("font-family", "Arial, Helvetica, sans-serif")  
        .text("Number of Species by Threat");
  
    // add the x Axis
    xAxis = svg2.append("g")
        .attr("class","xaxis")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + theight + ")");
  
    // add the y Axis
    yAxis = svg2.append("g")
        .attr("class","yaxis")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "translate(0,0)");

});

var svg3 = d3.select("#actions").append("svg")
    .attr("width", twidth + tmargin.left + tmargin.right)
    .attr("height", theight + tmargin.top + tmargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tmargin.left + "," + tmargin.top + ")");

var y_a = d3.scaleBand() // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([theight, 0])
    .padding(0.1);

var x_a = d3.scaleLinear().range([0, twidth]);
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
        return d3.ascending(x.value, y.value);
     })
  
     
    // Scale the range of the data in the domains
    y_a.domain(action_cts.map(function(d) { return d.key; }));
    x_a.domain([0, d3.max(action_cts, function(d) { return d.value; })]);
  

    // append the rectangles for the bar chart
    svg3.selectAll("rect")
        .data(action_cts)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y_a(d.key); })
        .attr("height", y_a.bandwidth())
        .attr("x", x_a(0))
        .attr("width", function(d) { return x_a(d.value); })
        .attr("fill", "#69b3a2");

    svg3.append("text")
        .attr("x", (twidth / 2))             
        .attr("y", 0 - margin.top/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("font-weight", "bold") 
        .attr("font-family", "Arial, Helvetica, sans-serif")    
        .text("Actions Taken");
  
    // add the x Axis
    xAxis_a = svg3.append("g")
        .attr("class","xaxis")
        .call(d3.axisBottom(x_a))
        .attr("transform", "translate(0," + theight + ")");
        
    // add the y Axis
    yAxis_a = svg3.append("g")
        .attr("class","yaxis")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(y_a))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "translate(0,0)");

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
        // Add Y axis
        y_p.domain([0, d3.max(plant_cts, function(d) { return  d.value; })])
        plant_cts.sort(function(first, second) {
            return date_ranges.indexOf(first.key) - date_ranges.indexOf(second.key);
          });

        // Add the area
        svg4.append("path")
            .datum(plant_cts)
            .attr("class","lineTest")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x_p(d.key) })
                .y(function(d) { return y_p(d.value) })
            );  

        svg4.append("text")
            .attr("x", (twidth / 2))             
            .attr("y", 0 - margin.top/2)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px")   
            .style("font-weight", "bold") 
            .attr("font-family", "Arial, Helvetica, sans-serif")  
            .text("Date of Extinction");
    
         // Add X axis --> it is a date format
         xAxis_p = svg4.append("g")
                    .attr("class","xaxis")
                    .attr("transform", "translate(0," + theight + ")")
                    .call(d3.axisBottom(x_p))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("transform", "rotate(-15)");

         yAxis_p = svg4.append("g").attr("class", "yaxis").call(d3.axisLeft(y_p));
         
         svg4.append("text")
            .attr("class", "yaxis")
            .attr("text-anchor", "middle")
            .attr("y", -45)
            .attr("x", -130)
            .attr("dy", ".75em")
            .attr("font-family", "Arial, Helvetica, sans-serif")  
            .attr("transform", "rotate(-90)")
            .text("Number of species");

})

var lwidth = 400,
    lheight = 800;

var species = d3.select("#species").style("opacity", 0);
var species_dict = {};

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
        return d3.ascending(x.value, y.value);
     })
    
    x.domain([0, d3.max(new_threat_cts, function(datum) { return datum.value; })]);
    y.domain(new_threat_cts.map(function(datum) { return datum.key; }));

    xAxis.transition()
        .duration(1000)
        .call(d3.axisBottom(x));

    svg2.selectAll(".yaxis").transition()
        .duration(100)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "end");

    var u = svg2.selectAll("rect").data(new_threat_cts)
    
    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("y", function(datum) { return y(datum.key); })
        .attr("height", y.bandwidth())
        .attr("x", function(datum) { return x(0) })
        .attr("width", function(datum) { return x(datum.value); })
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
        return d3.ascending(x.value, y.value);
     })

    y_a.domain(new_action_cts.map(function(datum) { return datum.key; }));

    svg3.selectAll(".yaxis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y_a))
        .selectAll("text")
        .style("text-anchor", "end");

    x_a.domain([0, d3.max(new_action_cts, function(datum) { return datum.value; })]);
    xAxis_a.transition().duration(100).call(d3.axisBottom(x_a));

    var u3 = svg3.selectAll("rect").data(new_action_cts)
    
    u3.enter()
        .append("rect")
        .merge(u3)
        .transition()
        .duration(1000)
        .attr("y", function(datum) { return y_a(datum.key); })
        .attr("height", y_a.bandwidth())
        .attr("x", x(0))
        .attr("width", function(datum) { return x_a(datum.value); })
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
    if (new_plant_cts.hasOwnProperty("NA")) {delete new_plant_cts["NA"]; }
    console.log(Object.keys(new_plant_cts))

    new_plant_cts = d3.entries(new_plant_cts);
    new_plant_cts.sort(function(first, second) {
        return date_ranges.indexOf(first.key) - date_ranges.indexOf(second.key);
      });
    // Add Y axis
    y_p.domain([0, d3.max(new_plant_cts, function(datum) { return datum.value; })]);
    yAxis_p.transition().duration(100).call(d3.axisLeft(y_p));

    svg4.selectAll(".lineTest").remove();

    svg4.append("path")
        .datum(new_plant_cts)
        .attr("class","lineTest")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x_p(d.key) })
            .y(function(d) { return y_p(d.value) })
        ); 


    plant_cts = new_plant_cts;
    
    species_dict = d3.map(newSpecies, function(d){return d.binomial_name;});
    
    species.transition().duration(10).style("opacity", .9);;
    species.select("p").text(`Extinct Species in ${d.properties.name}`).style("font-weight", "bold");
    species.select("ol").selectAll("li").remove();
    species.select("ol")
            .selectAll("li")
            .data(species_dict.keys())
            //.data(newSpecies)
            .enter()
            .append("li")
            .text(d => `${d}`)
            .on("mouseover", display_plant)
            .on("mouseleave", display_plant_reset);

    // MAP ZOOM INTO COUNTRY
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
  
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x0 = (bounds[0][0] + bounds[1][0]) / 2,
        y0 = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x0, height / 2 - scale * y0];
  
    svg1.transition()
        .duration(750)
        // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4

}

  function reset() {
    active.classed("active", false);
    active = d3.select(null);
  
    svg1.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4

    species.transition()
            .duration(10)
            .style("opacity", 0);

    // 1 - THREAT GRAPH
    const newData = threatData
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
        return d3.ascending(x.value, y.value);
     })
    
    x.domain([0, d3.max(new_threat_cts, function(datum) { return datum.value; })]);
    y.domain(new_threat_cts.map(function(datum) { return datum.key; }));

    xAxis.transition()
        .duration(1000)
        .call(d3.axisBottom(x));

    svg2.selectAll(".yaxis").transition()
        .duration(100)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "end");

    var u = svg2.selectAll("rect").data(new_threat_cts)
    
    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("y", function(datum) { return y(datum.key); })
        .attr("height", y.bandwidth())
        .attr("x", function(datum) { return x(0) })
        .attr("width", function(datum) { return x(datum.value); })
        .attr("fill", "Crimson");
    
    u.exit().remove()
    threat_cts = new_threat_cts;

    // 2. Update Actions Taken
    const newActions = actionData;
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
        return d3.ascending(x.value, y.value);
     })

    y_a.domain(new_action_cts.map(function(datum) { return datum.key; }));

    svg3.selectAll(".yaxis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y_a))
        .selectAll("text")
        .style("text-anchor", "end");

    x_a.domain([0, d3.max(new_action_cts, function(datum) { return datum.value; })]);
    xAxis_a.transition().duration(100).call(d3.axisBottom(x_a));

    var u3 = svg3.selectAll("rect").data(new_action_cts)
    
    u3.enter()
        .append("rect")
        .merge(u3)
        .transition()
        .duration(1000)
        .attr("y", function(datum) { return y_a(datum.key); })
        .attr("height", y_a.bandwidth())
        .attr("x", x(0))
        .attr("width", function(datum) { return x_a(datum.value); })
        .attr("fill", "#69b3a2");
    
    u3.exit().remove()

    action_cts = new_action_cts;

    // 3. Update Species Last Seen
    const newSpecies = actionData;
    var new_plant_cts = {};

    newSpecies.forEach( function(d) {
        var year = d.year_last_seen;
        if (new_plant_cts[year] === undefined){
            new_plant_cts[year] = 0;
        } else {
            new_plant_cts[year] = new_plant_cts[year] + 1;
        }
    });
    if (new_plant_cts.hasOwnProperty("NA")) {delete new_plant_cts["NA"]; }
    console.log(Object.keys(new_plant_cts))

    new_plant_cts = d3.entries(new_plant_cts);
    new_plant_cts.sort(function(first, second) {
        return date_ranges.indexOf(first.key) - date_ranges.indexOf(second.key);
      });
    // Add Y axis
    y_p.domain([0, d3.max(new_plant_cts, function(datum) { return datum.value; })]);
    yAxis_p.transition().duration(100).call(d3.axisLeft(y_p));

    svg4.selectAll(".lineTest").remove();

    svg4.append("path")
        .datum(new_plant_cts)
        .attr("class","lineTest")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x_p(d.key) })
            .y(function(d) { return y_p(d.value) })
        ); 


    plant_cts = new_plant_cts;

    }

  function display_plant(d) {
    var group = species_dict.get(d)["group"];
    var red_list_category = species_dict.get(d)['red_list_category'];
    var threats = [];
    
    plant_info.transition()
            .duration(10)
            .style("opacity", .9);
    plant_info.html(
        `<b>Group:</b> ${group} <br><br>
         <b>Red list Category:</b> ${red_list_category} <br><br> 
         <b>Photo: </b><br><img src="pictures/${d}.png">`
     );

  }

  function display_plant_reset(d) {
    plant_info.transition()
        .duration(10)
        .style("opacity", 0);
  }

d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/6859-sp21/a4-cindy/main/world.geojson", )
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
      .attr("d", path.projection(projection)
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