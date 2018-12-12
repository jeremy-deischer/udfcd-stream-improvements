(function() {

  var map = L.map('map', {
    zoomSnap: .1,
    center: [39.75, -104.97],
    zoom: 9,
    minZoom: 10,
    maxZoom: 20,
  });

  var accessToken = 'pk.eyJ1IjoiaWNvbmVuZyIsImEiOiJjaXBwc2V1ZnMwNGY3ZmptMzQ3ZmJ0ZXE1In0.mo_STWygoqFqRI-od05qFg'

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.outdoors',
    accessToken: accessToken
  }).addTo(map);

  // first load all data with deferred requests
  var streamsJson= d3.json("data/Streams.json"),
      districtJson = d3.json("data/District.json"),
      channelImproveJson = d3.json("data/channelimprov.json");

  // then wait to make sure they're all loaded with a promise
  Promise.all([streamsJson, districtJson, channelImproveJson])
    .then(processData);  // send them into another function here

  function processData(data) {
    // data come in within an array
    // can separate out here and assign
    // to different variables
    
    var streamsData = data[0],
        districtData = data[1],
        channelImproveData = data[2];

    // here you could do other data clean-up/processing/binding
    // if you needed to

    // when done, send to the drawMap function

    drawMap(streamsData, districtData, channelImproveData);

  }

  // //AJAX call to load streams
  // $.getJSON("data/Streams.json", function(data) {
  //   var options = {
  //     color: 'blue',
  //     weight: 1
  //   }
  //   var streams = L.geoJson(data, options).addTo(map)

  //   addFilter(data)
  // });

  // //AJAX call to load district boundary
  // $.getJSON("data/District.json", function(data) {
  //   //default option for styling
  //   var options = {
  //     color: 'gray',
  //     weight: 5,
  //     fillOpacity: 0,
  //   }

  //   var boundary = L.geoJson(data, options).addTo(map);
  // });

  // //AJAX call to load district boundary
  // $.getJSON("data/channelimprov.json", function(data) {
  //   drawMap(data)
  // });

  function drawMap(streamsData, districtData, channelImproveData) {

    // now you have all the data within this function
    // you can create the separate Leaflet layer groups using it
    // first ones added to the map are underneath the others

    var district = L.geoJson(districtData, {
      style: function() {
        return {
          color: 'yellow',
          weight: 1
        }
      }
    }).addTo(map);

    var streams = L.geoJson(streamsData, {
      style: function() {
        return {
          color: 'blue',
          weight: 1
        }
      }
    }).addTo(map);

    var channelImprov = L.geoJson(channelImproveData, {
      onEachFeature: function(feature, layer) {
        //Assigning color to each type of stream Improvements
        if (feature.properties.type.riprap) {
          layer.setStyle({
            fillColor: 'red',
          });
        } else if (feature.properties.type.boulders) {
          layer.setStyle({
            color: 'green'
          });
        } else if (feature.properties.type.excavation) {
          layer.setStyle({
            color: 'blue'
          });
        } else if (feature.properties.type.lowflow) {
          layer.setStyle({
            color: 'yellow'
          });
        } else if (feature.properties.type.toe) {
          layer.setStyle({
            color: 'black'
          });
        }

        // when mousing over a layer
        layer.on('mouseover', function() {

          // change the stroke color and bring that element to the front
          layer.setStyle({
            color: 'yellow'
          }).bringToFront();
        });

        // when mousing off layer
        layer.on('mouseout', function() {

          // reset the layer style to its original stroke color
          layer.setStyle({
            color: 'white'
          });
        });

        //Create tooltip for channel improvement
        var improvementTooltip = feature.properties.item + '<br>' + 'Study: ' +
         feature.properties.mdp_osp_st + ' ' + feature.properties.year_of_st +
          '<br>' + 'Current Cost Estimate: $' + feature.properties.current_co.toLocaleString();

        layer.bindTooltip(improvementTooltip);
      }
    }).addTo(map);

  } // end drawMap()

  // d3 to create dropdown of all the streams
  function addFilter(data) {

    // select the map element
    var dropdown = d3.select('#map')
      .append('select') // append a new select element
      .attr('class', 'filter') // add a class name
      .on('change', onchange) //listen for change

    // array to hold select options
    var uniqueTypes = ["All Drainageways"];

    //Log empty array and sample feature to console for testing before for each
    console.log(uniqueTypes)
    console.log(data.features[1].properties["str_name"])

    //cycle through streams layer and add unique values to array to use for dropdown
    for (i=0; i < data.features.length; i++){
      if (!uniqueTypes.includes(data.features[i].properties["str_name"]))
      uniqueTypes.push(data.features[i].properties["str_name"])
    }

    // sort types alphabeticaly in array
    uniqueTypes.sort();

    //Log array of unique stream names to console.
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
        if (d.year_of_st != val) return "none" // don't display it
      })
    }

  } //end of addFilter

})();
