(function(){

  //synchronous calls to data files
  var basinJson = d3.json("data/Basins.jason")


  //Function fired if there is an error
  function error(error){
    console.log(error)
  } //end of function error

  function drawMap(data){
    console.log(data) //access to data
  }
});
