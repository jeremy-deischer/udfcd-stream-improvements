(function() {

  var map = L.map('map', {
    zoomSnap: .1,
    center: [39.75, -104.97],
    zoom: 9,
    minZoom: 10,
    maxZoom: 15,
  });

  var accessToken = 'pk.eyJ1IjoiaWNvbmVuZyIsImEiOiJjaXBwc2V1ZnMwNGY3ZmptMzQ3ZmJ0ZXE1In0.mo_STWygoqFqRI-od05qFg'

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.outdoors',
    accessToken: accessToken
  }).addTo(map);


  //AJAX call to load Basins
  $.getJSON("data/Basins.json", function(data) {
    drawBasinMap(data)
  });

  //AJAX call to load streams
  $.getJSON("data/Streams.json", function(data) {
    drawStreamMap(data)
  });

  //AJAX call to load district boundary
  $.getJSON("data/District.json", function(data) {
    drawDistrictMap(data)
  });

  //AJAX call to load district boundary
  $.getJSON("data/channelImprovementsLinear.json", function(data) {
    drawMap(data)
  });

  function drawBasinMap(data) {
    //default option for styling
    var options = {
      pointToLayer: function(feature, ll) {
        return L.circleMarker(ll, {
          opacity: 1,
          weight: 2,
          fillOpacity: 0,
        })
      }
    }
    var basins = L.geoJson(data, options).addTo(map)
    return (basins)
  } //end of drawBasinMap


  function drawDistrictMap(data) {

    //default option for styling
    var options = {
      color: 'gray',
      weight: 5,
      fillOpacity: 0,
    }

    var boundary = L.geoJson(data, options).addTo(map);
    boundary.bringToFront();


  } //end of drawDistrictMap


  function drawStreamMap(data) {

    //default option for styling
    var options = {
      color: 'blue',
      weight: 1
    }
    var streams = L.geoJson(data, options).addTo(map)

  } //end of drawStreamMap

  // function drawMap(data) {
  //
  //   //default option for styling
  //   var options = {
  //     pointToLayer: function(feature, ll) {
  //       return L.circleMarker(ll, {
  //         opacity: 1,
  //         weight: 2,
  //         fillOpacity: 0,
  //       })
  //     }
  //   }
  //
  //   var channelImprov = L.geoJson(data, options).addTo(map)
  //
  //   // Fit Bounds of Map to district boundary
  //   map.fitBounds(girlsLayer.getBounds());
  //
  //   // adjust zoom level of map
  //   map.setZoom(map.getZoom() - .4);
  //
  //
  //   basin.setStyle({
  //     color: '#6E77B0',
  //   });
  //
  //   resizeCircles(girlsLayer, boysLayer, 1);
  //   sequenceUI(girlsLayer, boysLayer);
  //
  // } // end drawMap()

  function sequenceUI(girlsLayer, boysLayer) {

    // create Leaflet control for the slider
    var sliderControl = L.control({
      position: 'bottomleft'
    });

    sliderControl.onAdd = function(map) {

      var controls = L.DomUtil.get("slider");

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;
    }

    sliderControl.addTo(map); // sequenceUI function body

    // create Leaflet control for the current grade output
    var gradeControl = L.control({
      position: 'bottomleft'
    });

    // same as above
    gradeControl.onAdd = function(map) {

      var grade = L.DomUtil.get("current-grade");

      L.DomEvent.disableScrollPropagation(grade);
      L.DomEvent.disableClickPropagation(grade);

      return grade;

    }

    gradeControl.addTo(map);

    // select the grade output we just added to the map
    var output = $('#current-grade span');

    //select the slider's input and listen for change
    $('#slider input[type=range]')
      .on('input', function() {

        // current value of slider is current grade level
        var currentGrade = this.value;


        // update the output
        output.html(currentGrade);

      });


  } //end of slider control

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

  // function drawLegend(data) {
  //   // create Leaflet control for the legend
  //   var legendControl = L.control({
  //     position: 'bottomright'
  //   });
  //
  //   // when the control is added to the map
  //   legendControl.onAdd = function(map) {
  //
  //     // select the legend using id attribute of legend
  //     var legend = L.DomUtil.get("legend");
  //
  //     // disable scroll and click functionality
  //     L.DomEvent.disableScrollPropagation(legend);
  //     L.DomEvent.disableClickPropagation(legend);
  //
  //     // return the selection
  //     return legend;
  //
  //   }
  //
  //   // loop through all features (i.e., the schools)
  //   var dataValues = data.features.map(function(school) {
  //     // for each grade in a school
  //     for (var grade in school.properties) {
  //       // shorthand to each value
  //       var value = school.properties[grade];
  //       // if the value can be converted to a number
  //       if (+value) {
  //         //return the value to the array
  //         return +value;
  //       }
  //
  //     }
  //   });
  //
  //   // verify your results!
  //   // console.log(dataValues);
  //
  //   // sort our array
  //   var sortedValues = dataValues.sort(function(a, b) {
  //     return b - a;
  //   });
  //
  //   // round the highest number and use as our large circle diameter
  //   var maxValue = Math.round(sortedValues[0] / 1000) * 1000;
  //
  //   // calc the diameters
  //   var largeDiameter = calcRadius(maxValue) * 2,
  //     smallDiameter = largeDiameter / 2;
  //
  //   // select our circles container and set the height
  //   $(".legend-circles").css('height', largeDiameter.toFixed());
  //
  //   // set width and height for large circle
  //   $('.legend-large').css({
  //     'width': largeDiameter.toFixed(),
  //     'height': largeDiameter.toFixed()
  //   });
  //   // set width and height for small circle and position
  //   $('.legend-small').css({
  //     'width': smallDiameter.toFixed(),
  //     'height': smallDiameter.toFixed(),
  //     'top': largeDiameter - smallDiameter,
  //     'left': smallDiameter / 2
  //   })
  //
  //   // label the max and median value
  //   $(".legend-large-label").html(maxValue.toLocaleString());
  //   $(".legend-small-label").html((maxValue / 2).toLocaleString());
  //
  //   // adjust the position of the large based on size of circle
  //   $(".legend-large-label").css({
  //     'top': -11,
  //     'left': largeDiameter + 30,
  //   });
  //
  //   // adjust the position of the large based on size of circle
  //   $(".legend-small-label").css({
  //     'top': smallDiameter - 11,
  //     'left': largeDiameter + 30
  //   });
  //
  //   // insert a couple hr elements and use to connect value label to top of each circle
  //   $("<hr class='large'>").insertBefore(".legend-large-label")
  //   $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);
  //
  //
  //
  //   legendControl.addTo(map);
  // } //end of drawLegend

  // function retreiveInfo(boysLayer, currentGrade) {
  //   // select the element and reference with variable
  //   // and hide it from view initially
  //   var info = $('#info').hide();
  //
  //
  //   // since boysLayer is on top, use to detect mouseover events
  //   boysLayer.on('mouseover', function(e) {
  //
  //     // remove the none class to display and show
  //     info.show();
  //
  //     // access properties of target layer
  //     var props = e.layer.feature.properties;
  //
  //     // populate HTML elements with relevant info
  //     $('#info span').html(props.COUNTY);
  //     $(".girls span:first-child").html('(grade ' + currentGrade + ')');
  //     $(".boys span:first-child").html('(grade ' + currentGrade + ')');
  //     $(".girls span:last-child").html(Number(props['G' + currentGrade]).toLocaleString());
  //     $(".boys span:last-child").html(Number(props['B' + currentGrade]).toLocaleString());
  //
  //     // raise opacity level as visual affordance
  //     e.layer.setStyle({
  //       fillOpacity: .6
  //     });
  //
  //     // empty arrays for boys and girls values
  //     var girlsValues = [],
  //       boysValues = [];
  //
  //     // loop through the grade levels and push values into those arrays
  //     for (var i = 1; i <= 8; i++) {
  //       girlsValues.push(props['G' + i]);
  //       boysValues.push(props['B' + i]);
  //     }
  //
  //     $('.girlspark').sparkline(girlsValues, {
  //       width: '200px',
  //       height: '30px',
  //       lineColor: '#D96D02',
  //       fillColor: '#d98939 ',
  //       spotRadius: 0,
  //       lineWidth: 2
  //     });
  //
  //     $('.boyspark').sparkline(boysValues, {
  //       width: '200px',
  //       height: '30px',
  //       lineColor: '#6E77B0',
  //       fillColor: '#878db0',
  //       spotRadius: 0,
  //       lineWidth: 2
  //     });
  //
  //   }); //end of mouse over boys layer
  //
  //   // hide the info panel when mousing off layergroup and remove affordance opacity
  //   boysLayer.on('mouseout', function(e) {
  //
  //     // hide the info panel
  //     info.hide();
  //
  //     // reset the layer style
  //     e.layer.setStyle({
  //       fillOpacity: 0
  //     });
  //   });
  //
  //   // when the mouse moves on the document
  //   $(document).mousemove(function(e) {
  //     // first offset from the mouse position of the info window
  //     info.css({
  //       "left": e.pageX + 6,
  //       "top": e.pageY - info.height() - 25
  //     });
  //
  //     // if it crashes into the top, flip it lower right
  //     if (info.offset().top < 4) {
  //       info.css({
  //         "top": e.pageY + 15
  //       });
  //     }
  //     // if it crashes into the right, flip it to the left
  //     if (info.offset().left + info.width() >= $(document).width() - 40) {
  //       info.css({
  //         "left": e.pageX - info.width() - 80
  //       });
  //     }
  //   });
  //
  // } // end of retrieveInfo



})();
