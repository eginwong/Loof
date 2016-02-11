//Define global variable time.
var time = 0; 


/*Function checks if the user has their session variable stored. If not, redirect them to the index.
Output  - profile picture is stored in the application */
$(function(){
  if(sessionStorage.getItem("profilePic") === null){
    window.location = "http://mansci-ugdb.uwaterloo.ca/~e47wong";
  }
  else {
    //If logged in, change the profile picture to be what is stored.
    $(".fbProfile").html('<img src="'+ sessionStorage.getItem("profilePic") + '/picture?width=81"/>');
  }

  //Make all headers on all the pages the same.
  $().headerOnAllPages();

  init();
  checkTime();
  
});


/*Function makes all headers the same on each page of the application*/
jQuery.fn.headerOnAllPages = function() {
  var theHeader = $('#constantheader-wrapper').html();
  var allPages = $('div[data-role="page"]');

  for (var i = 1; i < allPages.length; i++) {
    allPages[i].innerHTML = theHeader + allPages[i].innerHTML;
  }
};


//Function initiates the application by loading the message baord, profile, and the order page.
function init()
{
  //Initialize the application.
  loadProfile();
  loadOrders();
  loadOrderPage();
}

//Function checks how much time has passed without any action from the user.
function checkTime()
{
  //Increment the idle time counter every minute.
  var idleInterval = setInterval(timerIncrement, 60000); // 1 minute
  //Zero the idle timer on mouse movement.
  $(this).mousemove(function (e) {
      time = 0;
  });
  $(this).keypress(function (e) {
      time = 0;
  });
}

//Function reloads the page if there has been inactivity for more than 5 minutes.
function timerIncrement() {
  time = time + 1;
  if (time > 4) { // 5 minutes
      window.location.reload();
  }
}