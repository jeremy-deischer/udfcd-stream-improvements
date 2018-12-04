(function(){

  // synchronous calls to data files
    var statesJson = d3.json("data/us-states.json")
    facilityCSV = d3.csv("data/facility-emissions-2016.csv")

    // define radius generator
    var radius = d3.scaleSqrt().domain([0, 1e6]).range([1, 9])

    // define color generator
    var color = d3.scaleOrdinal(d3.schemeSet1)

    // use promise to call all data files, then send data to callback
    Promise.all([statesJson, facilityCSV]).then(drawMap)

    // function fired if there is an error
    function error(error) {
      console.log(error)
    }

    function drawMap(data) {
      console.log(data) // access to both datasets here

      // data is array of our two datasets
      var statesData = data[0],
        facilityData = data[1]

      // define width and height of our SVG
      var width = 960,
        height = 600

      // select the map element
      var svg = d3.select("#map")
        .append("svg") // append a new SVG element
        .attr("width", width) // give the SVS element a width attribute and value
        .attr("height", height) // same for the height

      // get the GeoJSON representation of the TopoJSON data
      var geojson = topojson.feature(statesData, {
        type: "GeometryCollection",
        geometries: statesData.objects.cb_2017_us_state_20m.geometries
      })

      // define a projection using the US Albers USA
      // fit the extent of the GeoJSON data to specified
      // width and height
      var projection = d3.geoAlbersUsa()
        .fitSize([width, height], geojson)

      // define a path generator, which will use
      // the specified projection
      var path = d3.geoPath()
        .projection(projection)

      // create and append a new SVG g element to the SVG
      var states = svg.append("g")
        .selectAll("path") // select all the paths (that don't exist yet)
        .data(geojson.features) // use the GeoJSON data
        .enter() // enter the selection
        .append("path") // append new path elements for each data feature
        .attr("d", path) // give each path a d attribute value
        .attr("class", "states") // give each path a class of state


      // Create  div for the tooltip and hide with opacity
      var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")

      // select the map element
      d3.select("#map")
        .on("mousemove", function(event) { // when mouse moves over it
          // update the position of the tooltip
          tooltip.style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
        })

      var facilities = svg.append("g")
        .selectAll("circle")
        .data(facilityData.sort(function(a, b) {
          return b.Total - a.Total // place the large ones on the bottom
        }))
        .enter().append("circle") // enter and append a circle element
        .attr("cx", function(d) { // define the x position
          d.position = projection([d.Longitude, d.Latitude]);
          return d.position[0];
        })
        .attr("cy", function(d) {
          return d.position[1];
        })
        .attr("r", function(d) {
          return radius(+d.Total)
        })
        .attr("class", "facility")
        .style("fill", function(d) { // give each facility a fill style
          return color(d.Industry_Type) // derive the hex color from the value
        })
        .on("mouseover", function(d) { // when mousing over an element
          d3.select(this).classed("hover", true).raise(); // select it, add a class name, and bring to front
          tooltip.style("opacity", 1).html(d.Facility_Name + "<br>"+ Number(d.Total).toLocaleString() + " tons") // make tooltip visible and update info
        })
        .on("mouseout", function() { // when mousing out of an element
          d3.select(this).classed("hover", false) // remove the class
          tooltip.style("opacity", 0) // hide the element
        })


      // Create  div for the tooltip and hide with opacity
      var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")

      // select the map element
      d3.select("#map")
        .on("mousemove", function(event) { // when mouse moves over it
          // update the position of the tooltip
          tooltip.style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
        })

      drawLegend(svg, width, height)

      addFilter(facilityData, facilities)

    } // end of drawMap

    function drawLegend(svg, width, height) {

      // append a new g element
      var legend = svg.append("g")
        .attr("dy", "1.3em") // adjust the vertical displacement
        .attr("class", "legend") // add a class (for CSS)
        .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
        .selectAll("g") // select all new g elements
        .data([5e6, 2e7]) // apply two numbers (approx median/max)
        .enter().append("g"); // enter and append the two new g elements

      // place the circles vertically and apply radius
      legend.append("circle")
        .attr("cy", function(d) {
          return -radius(d);
        })
        .attr("r", radius);

      // append text to each
      legend.append("text")
        .attr("y", function(d) {
          return -2 * radius(d);
        })
        .attr("dy", "1.3em")
        .text(d3.format(".1s"));

      // append a legend label at bottom
      legend.append("text")
        .attr("y", 16)
        .text("metric tons")

    } // end drawLegend()

    function addFilter(facilityData, facilities) {

      // select the map element
      var dropdown = d3.select('#map')
        .append('select') // append a new select element
        .attr('class', 'filter') // add a class name
        .on('change', onchange) //listen for change

      // array to hold select options
      var uniqueTypes = ["All facilities"];

      // loop through all features and push unique types to array
      facilityData.forEach(function(facility) {
        // if the type is not included in the array, push it to the array
        if (!uniqueTypes.includes(facility.Industry_Type)) uniqueTypes.push(facility.Industry_Type)
      })

      // sort types alphabeticaly in array
      uniqueTypes.sort();

      // ["All facilities", "Chemicals", "Metals", "Minerals", "Other", "Petroleum and Natural Gas Systems", "Power Plants", "Waste"]
      console.log(uniqueTypes)

      // select all the options (that don't exist yet)
      dropdown.selectAll('option')
        .data(uniqueTypes).enter() // attach our array as data
        .append("option") // append a new option element for each data item
        .text(function(d) {
          return d // use the item as text
        })
        .attr("value", function(d) {
          return d // use the time as value attribute
        })

      function onchange() {
        // get the current value from the select element
        var val = d3.select('select').property('value')

        // style the display of the facilities
        facilities.style("display", function(d) {
          // if it's our default, show them all with inline
          if (val === "All facilities") return "inline"
          // otherwise, if each industry type doesn't match the value
          if (d.Industry_Type != val) return "none" // don't display it
        })
      }

    } //end of addFilter
});
