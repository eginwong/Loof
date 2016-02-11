<?php

$connection = mysqli_connect("localhost","e47wong","Fall2014","e47wong") or die("Error " . mysqli_error($link)); 


//This switch determines which function will be performed based on what parameters are passed in.
if(isset($_POST['json_data']) && !empty($_POST['json_data'])) {
  ajaxDeliver(json_decode($_POST['json_data']));
}
else if (isset($_GET['action']) && !empty($_GET['action'])) {
  state($_GET['p'], $_GET['s'], $_GET['o'], $_GET['action'], $_GET['r']);
}
else {
  $return = array();
  $return = searchRestaurants();
  echo json_encode($return);
}


/*Function changes the state of the order and reflects that change to the database.
Input  - $state, $orderID, $call, [$profile, $rating], only required variables are the state, call, and the orderID.*/
function state($profile, $state, $orderID, $call, $rating)
{
  global $connection;

  //This case simulates if the user chooses to accept the order to deliver.
  if($call == "inc")
  {
    ++$state;
    $query1 = "SELECT userID FROM `User` WHERE fBLink LIKE '$profile'" or die("Error in the consult.." . mysqli_error($connection));

    $res = $connection->query($query1);
    $obj = $res->fetch_row();
    $userID = $obj[0];

    //Update the database and place the user as the deliveryID.
    $query = "UPDATE `Order` SET `deliveryID` = $userID, `state` = $state WHERE `orderID` = $orderID" or die("Error in the consult.." . mysqli_error($connection));
    $result = $connection->query($query);
  }
  //This case simulates if the user wants to delete their order after initially placing it.
  else if($call == "dec")
  {
    --$state;

    //Set state to -1, which will not be found by the query that populates the order page.
    $query = "UPDATE `Order` SET `state` = $state WHERE `orderID` = $orderID" or die("Error in the consult.." . mysqli_error($connection));
    $result = $connection->query($query);
  }
  //This case is used when another user has agreed to deliver your order. This acceptance state confirms the request
  //and shows the user's respective phone numberes to the other.
  else if ($call == "update")
  {
    ++$state;

    $query = "UPDATE `Order` SET `state` = $state WHERE `orderID` = $orderID" or die("Error in the consult.." . mysqli_error($connection));

    $result = $connection->query($query);
  }
  //This case updates ratings based on what the user or deliverer have marked on the order details page after receiving service.
  else if ($call == "ratings")
  {
    //Get ID of user who is submitting the rating.
    $query1 = "SELECT userID FROM `User` WHERE fBLink LIKE '$profile'" or die("Error in the consult.." . mysqli_error($connection));

    $res = $connection->query($query1);
    $obj = $res->fetch_row();
    $userID = $obj[0];

    $query2 = "SELECT userID, deliveryID FROM `Order` WHERE orderID = $orderID" or die("Error in the consult.." . mysqli_error($connection));
    $res2 = $connection->query($query2);
    $obj2 = $res2->fetch_row();
    $userIDFromOrder = $obj2[0];
    $deliveryID = $obj2[1];

    //If user is the instigator the order, rate the other individual.
    if($userID == $userIDFromOrder)
    {
      //INSERT RATING FOR DELIVERY
      $query3 = "INSERT INTO `Ratings` VALUES ($deliveryID, $rating)" or die("Error in the consult.." . mysqli_error($connection));
      $res3 = $connection->query($query3);
    }
    else //Otherwise, rate the initial user.
    {
      $query3 = "INSERT INTO `Ratings` VALUES ($userIDFromOrder, $rating)" or die("Error in the consult.." . mysqli_error($connection));
      $res3 = $connection->query($query3);
    }
  }
}


/*Function creates a new order given the json object full of all the necessary information.
Input  - $json_obj, an object with all the required information to create a new order. */
function ajaxDeliver($json_obj)
{
  global $connection;

  $test = "SELECT userID FROM `User` WHERE fBLink = '$json_obj->profile'";
  
  $res = $connection->query($test);
  $row = $res->fetch_row();
  $userID = $row[0];
  
  $sql = "INSERT INTO `Order` (`userID`, `restaurant`, `food`, `location`, `tip`, `details`, `deliveryID`) VALUES ($userID, $json_obj->restaurant, '$json_obj->food', '$json_obj->location', $json_obj->tip, '$json_obj->comments', NULL)";
  
  $result = $connection->query($sql);
}


/*Function looks through all the available restaurants and returns that array.
Output - returns array with all the available restaurants */
function searchRestaurants()
{
  global $connection;
  $arr = array();

  $sql = "SELECT * FROM `Restaurant` ORDER BY name ASC";

  $result = $connection->query($sql) or die($mysqli->error);
  if ($result->num_rows > 0) {
    while ($obj = $result->fetch_object()) {
      $arr[] = array('name' => $obj->name, 'id' => $obj->restaurant_id);
    }
  }
  return $arr;
}


?>