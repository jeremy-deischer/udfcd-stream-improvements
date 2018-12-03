(function(){

  //synchronous calls to data files
  var basinJson = d3.json("data/Basins.jason")


  //Function fired if there is an error
  function error(error){
    console.log(error)
  } //end of function error

  //Call all data files then send data to drawMap
  Promise.all([basinJson]).then(drawMap)

  function drawMap(data){
    console.log(data) //access to data

    // define width and height of our SVG
      var width = 960,
        height = 600

      // select the map element
      var svg = d3.select("#map")
        .append("svg") // append a new SVG element
        .attr("width", width) // give the SVS element a width attribute and value
        .attr("height", height) // same for the height
  }
});
