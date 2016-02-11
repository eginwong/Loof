/*Function populates the order detail page.
Input   - takes the orderId and the type of order option.
Output  - populates the order details page depending on the state and the user who is loading the page. */
function loadPage(orderID, str)
{
  //Use AJAX to retrieve order details from the db.
  $.ajax({
    type: "GET",
    url: "scripts/order.php?o=" + orderID,
    dataType: "json",
    success : function(data)
    {
      $.each(data, function(index, object) {
        $("#loadOrderNum").empty().append("Order Details: #" + object.orderID);
        $("#loadOrderID").attr('value', object.orderID);
        $("#loadOrderUser").empty().append("<u>User:</u> " + object.orderPerson);
        if(object.deliverPerson !== null)
        {
          $("#loadOrderDeliver").empty().append("<u>Delivered by:</u> " + object.deliverPerson);
        }
        $("#loadOrderRes").empty().append("<u>Restaurant:</u> " + object.restaurant);
        $("#loadOrderMeal").empty().append("<u>Meal:</u> " + object.food);
        $("#loadOrderComments").empty().append("<u>Comments:</u> " + object.comments);
        $("#loadOrderLocation").empty().append("<u>Deliver to:</u> " + object.location);
        $("#loadOrderTip").empty().append("<u>Tip:</u> $" + object.tip);
        $("#loadOrderState").attr('value', object.state);

        //State 0 is when the order has just been created.
        if(object.state === 0)
        {
          //If instigator opened it, they can delete it.
          if(str == "Order")
          {
            //If you created the order, you should be able to delete it.
            $("#loadOrderChoice").text("Delete?"); 
          }
          //Otherwise, it will show "Accept?" for other users.
          if(str == "Open")
          {
            $("#loadOrderChoice").text("Accept?"); 
          }
        }
        else if (object.state == 1) //State 1 is if another has chosen to deliver.
        {
          //Instigator can accept the person who is delivering the order.
          if(str == "Order")
          {
            $("#loadOrderChoice").text("Accept?");
          }
          else //If not the instigator, the user must wait for approval.
          {
            $("#loadOrderChoice").text("Waiting for approval...");
            $("#loadOrderChoice").attr('disabled','disabled');
          }
        }
        //State is 2 if both parties have confirmed the delivery. Rating is now enabled.
        else if(object.state == 2)
        {
          //Show the corresponding user phone number.
          if (str == "Order") {
            $("#loadOrderContact").empty().append("<u>Phone #:</u> <b>" + object.deliverPersonPhone + "</b>");
          }
          else {
            $("#loadOrderContact").empty().append("<u>Phone #:</u> <b>" + object.orderPersonPhone + "</b>");
          }

          $("#loadOrderChoice").text("Rate their service!");
          $("#loadOrderChoice").removeAttr('disabled');
          $("#loadOrderContact").css('display', 'block');
          $("#loadOrderRating").css('display', 'block');
        }              
      });
    }
  });
}


/*Function changes the state of the order, depending on the action of the user.
Output  - the corresponding result is passed on to the database through AJAX. */
function pushState()
{
  var state = $("#loadOrderState").val();
  //Understand what action is required.
  var action = $("#loadOrderChoice").text();
  var orderID = $("#loadOrderID").val();
  var call;
  var profile;
  var urlToBackend;

  if(state === 0)
  {
    if(action == "Accept?") //Acceptance stage for deliverer.
    {
      call = "inc";
      urlToBackend ="scripts/delivery.php?o=" + orderID + "&s=" + state + "&action=" + call + "&p=" + sessionStorage.getItem("profilePic");
    }
    else //Order will be soft-deleted, so that it won't be shown.
    {
      call = "dec"; 
      urlToBackend ="scripts/delivery.php?o=" + orderID + "&s=" + state + "&action=" + call;
    }
  }
  else if (state == 1) // Acceptance stage for original user
  {
    call = "update";
    urlToBackend ="scripts/delivery.php?o=" + orderID + "&s=" + state + "&action=" + call;
  }
  else if (state == 2) // Ratings to be added to the database by each party.
  {
    call = "ratings";
    var rating = $("#rating").val();
    urlToBackend ="scripts/delivery.php?o=" + orderID + "&s=" + state + "&action=" + call + "&r=" + rating + "&p=" + sessionStorage.getItem("profilePic");
  }

  //Use AJAX to pass the order changes and then redirect the page.
  $.ajax({
    type: "GET",
    url: urlToBackend,
    dataType: "json",
    success : function()
    {
      document.location = "http://mansci-ugdb.uwaterloo.ca/~e47wong/loof.html"; 
    },
    error : function(data)
    {
      document.location ="http://mansci-ugdb.uwaterloo.ca/~e47wong/loof.html";
    }
  });
}


/*Function loads the orders on the main page. 
Output  - the returned values are appended to the message board in loof.html */
function loadOrders()
{
  var printed = [];

  //Use AJAX to load the orders and assign them under the right section, based on their state and the user.
  $.ajax({
    type: "GET",  
    url : "scripts/order.php?q=" + sessionStorage.getItem("profilePic"), 
    dataType : "json",  
    success : function(data) {
      //Includes personal orders, and then delivered orders, then all orders.
      
      //Orders that the user has placed.
      var personal ='<h3>My Orders</h3>';
      $.each(data[0][0], function(index, object) {  
        personal += ('<a href="#orderDetails"><button onClick="loadPage(' + object.orderID +', \'Order\')">You ordered ' + object.food + ' from '+ object.name + " to be delivered to " + object.location + "!</button></a><br><br>");
        printed.push(object.orderID);
      });
      //Orders that the user has chosen to deliver.
      $.each(data[0][1], function(index, object) {  
        personal += ('<a href="#orderDetails"><button onClick="loadPage(' + object.orderID +', \'Deliver\')">Deliver ' + object.food + ' to ' + object.firstName + ' from '+ object.name + " to " + object.location + "!</button></a><br><br>");
        printed.push(object.orderID);
      });

      //If there are no personal orders, don't show anything in the html.
      if(personal != '<h3>My Orders</h3>')
      {
        $("#myOrders").empty().append(personal);
      }

      var outstanding ='<h3>Outstanding Orders</h3>';
      $.each(data[0][2], function(index, object) {
        if(jQuery.inArray(object.orderID, printed) == -1) {
          outstanding += ('<a href="#orderDetails"><button onClick="loadPage(' + object.orderID +', \'Open\')">' + object.firstName + ' wants ' + object.food + ' from ' + object.name + " delivered to " + object.location + "!</button></a><br><br>");   
        }
      });

      //If there are no outstanding orders, don't show anything in the html.
      if(outstanding != '<h3>Outstanding Orders</h3>')
      {
        $("#display").empty().append(outstanding);
      }
    }
  });
}