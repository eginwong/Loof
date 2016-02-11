/*Function loads profile given the session variable.
Output  - profile page is loaded with proper profile picture and user info. */
function loadProfile()
{
  if(sessionStorage.getItem("profilePic") !== null)
  {  
    $("#largeProfile").empty().append('<img src="'+ sessionStorage.getItem("profilePic") + '/picture?type=large"/>');

    //Use AJAX call to populate user profile page.
    $.ajax({
      type: "GET",
      url : "scripts/user.php?p=" + sessionStorage.getItem("profilePic"),
      dataType : "json",
      success : function(data) {
        $.each(data, function(index, object) {
          $("#phonenumber").val(object.phone);
          $("#userName").empty().append(object.firstName + " " + object.lastName); 
          if(object.sum_rating === 0)
          {
            $("#ratingStars").empty().append("Rating: " + star(object.avg_rating) + "(no reviews)");  
          }
          else if (object.sum_rating == 1)
          {
            $("#ratingStars").empty().append("Rating: " + star(object.avg_rating) + " (" + object.sum_rating + " review)");            
          }
          else if (object.sum_rating > 1)
          {
            $("#ratingStars").empty().append("Rating: " + star(object.avg_rating) + " (" + object.sum_rating + " reviews)");            
          }
        });
      }
    });
  }
}


/*Function displays the correct number of stars given the average rating.
Input  - the average rating of the user
Output - the corresponding star image for the rating value. */
function star(num)
{
  if (num === 0)
  {
    return '<img src="images/0stars.png"></img>';
  }
  else if (num ==1)
  {
    return '<img src="images/1stars.png"></img>';
  }
  else if (num ==2)
  {
    return '<img src="images/2stars.png"></img>';
  }
  else if (num ==3)
  {
    return '<img src="images/3stars.png"></img>';
  }
  else if (num ==4)
  {
    return '<img src="images/4stars.png"></img>';
  }
  else if (num ==5)
  {
    return '<img src="images/5stars.png"></img>';
  }
}


/*Function updates the phone number given the updated value from the loof.html profile page.
Output  - page is reloaded to the profile with the updated phone number valued stored in the db. */
function updatePhoneNumber()
{
  var phone = $("#phonenumber").val();
  if(phone)
  {
    //Use AJAX to pass the phone number value and user profile to properly update the user's info.
    $.ajax({
      type: "GET",
      url : "scripts/user.php?p=" + sessionStorage.getItem("profilePic") + "&phone=" + phone,
      success : function() {
      }
    });
    setTimeout(function(){
      document.location ="http://mansci-ugdb.uwaterloo.ca/~e47wong/loof.html#profile";}, 50);
  }
}