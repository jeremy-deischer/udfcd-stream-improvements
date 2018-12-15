(function() {

    var map = L.map('map', {
      zoomSnap: .1,
    });

    var accessToken = 'pk.eyJ1IjoiaWNvbmVuZyIsImEiOiJjaXBwc2V1ZnMwNGY3ZmptMzQ3ZmJ0ZXE1In0.mo_STWygoqFqRI-od05qFg'

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: accessToken
    }).addTo(map);

    // first load all data with deferred requests
    var streamsJson = d3.json("data/Streams.json"),
      districtJson = d3.json("data/District.json"),
      channelImproveJson = d3.json("data/channelimprov.json");

    // then wait to make sure they're all loaded with a promise
    Promise.all([streamsJson, districtJson, channelImproveJson])
      .then(processData); // send them into another function here

    function processData(data) {
      // data come in within an array
      // can separate out here and assign
      // to different variables

      var streamsData = data[0],
        districtData = data[1],
        channelImproveData = data[2];

      // here you could do other data clean-up/processing/binding
      // if you needed to

      // when done, send the datasets to the drawMap function
      drawMap(streamsData, districtData, channelImproveData);

    }

    function drawMap(streamsData, districtData, channelImproveData) {

      // now you have all the data within this function
      // you can create the separate Leaflet layer groups using it
      // first ones added to the map are underneath the others

      var district = L.geoJson(districtData, {
        style: function() {
          return {
            color: '#484848',
            opacity: 0.6,
            fillColor: 'none'
          }
        }
      }).addTo(map);

      // set the extent of the map to the district bounds
      map.fitBounds(district.getBounds(), {
        padding: [20, 20]
      });

      var streams = L.geoJson(streamsData, {
        style: function() {
          return {
            weight: 1
          }
        }
      }).addTo(map);

      var channelImprov = L.geoJson(channelImproveData, {
          style: function() {
            return {
              weight: 2
            }
          },
          onEachFeature: function(feature, layer) {
            // Assigning color to each type of stream Improvements
            if (feature.properties.type === "boulders") {
              layer.setStyle({
                color: '#3288bd'
              });
            } else if (feature.properties.type === "SD") {
              layer.setStyle({
                color: '#fee08b'
              });
            } else if (feature.properties.type === "riprap") {
              layer.setStyle({
                color: '#d53e4f'
              });
            } else if (feature.properties.type === "Channel") {
              layer.setStyle({
                color: '#99d594'
              });
            } else if (feature.properties.type === "Excavation") {
              layer.setStyle({
                color: '#fc8d59'
              });
            } else
              layer.setStyle({
                color: 'e6f598'
              });


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
              if (feature.properties.type === "boulders") {
                layer.setStyle({
                  color: '#3288bd'
                });
              } else if (feature.properties.type === "SD") {
                layer.setStyle({
                  color: '#fee08b'
                });
              } else if (feature.properties.type === "riprap") {
                layer.setStyle({
                  color: '#d53e4f'
                });
              } else if (feature.properties.type === "Channel") {
                layer.setStyle({
                  color: '#99d594'
                });
              } else if (feature.properties.type === "Excavation") {
                layer.setStyle({
                  color: '#fc8d59'
                });
              } else
                layer.setStyle({
                  color: 'e6f598'
                });
            });

            //Create tooltip depending on whether cost data is available
            if (feature.properties.current_co == 0) {
              var improvementTooltip = feature.properties.item + '<br>' + 'Study: ' +
                feature.properties.mdp_osp_st + ' ' + feature.properties.year_of_st +
                '<br>' + 'Current Cost Estimate: Not available'
            } else {
              var improvementTooltip = feature.properties.item + '<br>' + 'Study: ' +
                feature.properties.mdp_osp_st + ' ' + feature.properties.year_of_st +
                '<br>' + 'Current Cost Estimate: $' + feature.properties.current_co.toLocaleString()

            }
            layer.bindTooltip(improvementTooltip);
          }

        })
        .addTo(map);

      // add the filter using the streamsData
      addFilter(streamsData, streams, channelImproveData);

    } // end drawMap()

    // d3 to create dropdown of all the streams
    function addFilter(data, streams, channelImproveData) {

      // create Leaflet control to add the select container
      // to the map
      var selectControl = L.control({
        position: 'topright'
      });
      selectControl.onAdd = function(map) {
        return L.DomUtil.get("select-container");
      }
      selectControl.addTo(map);

      // select the map element
      var dropdown = d3.select('#stream-select')
        .on('change', onchange) //listen for change

      // array to hold select options
      var uniqueTypes = [];

      //cycle through streams layer and add unique values to array to use for dropdown
      for (i = 0; i < data.features.length; i++) {
        if (!uniqueTypes.includes(data.features[i].properties["str_name"]))
          uniqueTypes.push(data.features[i].properties["str_name"])
      }

      // sort types alphabeticaly in array
      uniqueTypes.sort();

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

        // here you have access to the selected stream
        console.log(val)

        // you can use Leaflet to loop through all the
        // streams and see which one matches the selected one
        streams.eachLayer(function(layer) {
          if (layer.feature.properties.str_name == val) {

            // Access selected layer
            console.log(layer)

            // Highlight and zoom to selected stream
            layer.setStyle({
              color: 'cyan',
              weight: 4
            })
            map.flyToBounds(layer.getBounds())
          }
        })


        //use nest to sum the improvements
        var improveByStream = d3.nest()
          .key(function(k) {
            return k.properties.str_name;
          })
                    .entries(channelImproveData.features)

            console.log(improveByStream)
            console.log(channelImproveData.features)


          } //end of onchange

      } //end of addFilter

    })();
