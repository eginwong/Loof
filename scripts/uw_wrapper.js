/*Function loads the order page. It is a facade.*/
function loadOrderPage() {
  buildingLocations();
  loadRes();
}


/*Function uses the uwAPI and populates a list of uw Locations to display on the order page.
Output  - the returned values are appended to the form in loof.html */
function buildingLocations() {
  var apiKey = "2a7eb4185520ceff7b74992e7df4f55e";

  var uwLocation = $.getJSON("https://api.uwaterloo.ca/v2/buildings/list.json?key=" + apiKey).done(function(list) {
    var buildingsToGet = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "13", "14", "16", "17", "18", "19", "20CC", "22", "24", "25CC", "26CC", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "42", "44", "45", "46", "47", "48", "49", "50", "53", "56", "57", "60"];
    var buildings = [];

    $.each(list.data, function(index, object) {
      //Use if statement to find all relevant buildings.
      if (jQuery.inArray(object.building_id, buildingsToGet) != -1) {
          buildings.push(object);
      }
    });

    //Sort buildings based on name.
    //Based on http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
    buildings.sort(function(a, b) {
      var nameA = a.building_code.toLowerCase(),
          nameB = b.building_code.toLowerCase()
      if (nameA < nameB) //sort string ascending
        return -1
      if (nameA > nameB)
        return 1
    });

    var output = '<option value="" disabled selected>Choose location</option>';
    $.each(buildings, function(index, object) {
      output += '<option value=' + object.building_code + '>' + object.building_code + ' - ' + object.building_name + '</option>';
    });

    $("#location-choice").empty().append(output);
  })
}


/*Function uses an AJAX call to retrieve the list of restaurants from the database.
Output  - populates the html element with restaurant options. */
function loadRes() {
  $.ajax({
    type: "GET",
    url : "scripts/delivery.php",
    dataType : "json",
    success : function(data) {
      var resList = '<option value="" disabled selected>Choose Restaurant</option>';
      $.each(data, function(index, object) {
        resList += '<option value=' + object.id + '>' + object.name + '</option>';
      })
      $("#restaurant").empty().append(resList);
    }
  })
}


/*Function creates an array encoded in JSON to pass back to the back-end layer through AJAX.
Output  - once successful, redirect the user to the main page. */
function ajaxDBOrder() {
  var jsonObj = {};
  jsonObj.restaurant = $("#restaurant").val();
  jsonObj.food = $("#food").val();
  jsonObj.location = $("#location-choice").val();
  jsonObj.tip = $("#tip").val();
  jsonObj.comments = $("#comments").val();
  jsonObj.profile = sessionStorage.getItem("profilePic");

  $.ajax({
    type: "POST",
    url: "scripts/delivery.php",
    datatype: "json",
    data: {json_data: JSON.stringify(jsonObj)},
    success : function()
    {
      //There is a delay as the back-end needs to process the order first before it is populated. 
      setTimeout(function(){ 
        document.location = 'http://mansci-ugdb.uwaterloo.ca/~e47wong/loof.html';}, 120 ); 
    }
  })
}