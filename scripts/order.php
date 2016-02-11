<?php

$database_link = mysqli_connect("localhost","e47wong","Fall2014","e47wong") or die("Error " . mysqli_error($link)); 


$return = array();

//This switch determines which function will be performed based on what parameters are passed in.
if(isset($_GET['q']) && !empty($_GET['q'])) {
  $return = populateOrders($_GET['q']);
}
else {
  $return = getDetails($_GET['o']);
}

//Retrieve result, encode the array and echo the string back to the application layer.
echo json_encode($return);


/*Function populates orders for the user given their user profile string.
Input  - $profile, a string with the user's profile string from Facebook.
Output - returns array with all the available applicable orders to the user */
function populateOrders($profile)
{
  global $database_link;

  $query = "SELECT a.orderID, c.firstName, a.userID, a.food, b.name, a.location FROM `Order` a INNER JOIN `Restaurant` b ON a.restaurant = b.restaurant_id INNER JOIN `User` c ON a.userID = c.userID WHERE c.fBLink LIKE '$profile' AND a.state >= 0 AND (current_timestamp() <= a.timestamp + INTERVAL 15 MINUTE)" or die("Error in the consult.." . mysqli_error($database_link));
  
  //Query2 for orders where the user is delivering the item.
  $query2 = "SELECT a.orderID, c.firstName, a.userID, a.food, b.name, a.location, a.deliveryID FROM `Order` a INNER JOIN `Restaurant` b ON a.restaurant = b.restaurant_id INNER JOIN `User` c ON a.deliveryID = c.userID WHERE c.fBLink LIKE '$profile' AND (current_timestamp() <= a.timestamp + INTERVAL 15 MINUTE)" or die("Error in the consult.." . mysqli_error($database_link));
  
  //Return information, but include the state parameter.
  $query4 = "SELECT a.orderID, c.firstName, a.userID, a.food, b.name, a.location, a.deliveryID, a.state FROM `Order` a INNER JOIN `Restaurant` b ON a.restaurant = b.restaurant_id INNER JOIN `User` c ON a.userID = c.userID WHERE a.state = 0 AND (current_timestamp() <= a.timestamp + INTERVAL 15 MINUTE)" or die("Error in the consult.." . mysqli_error($database_link));

  $arr = array();
  $arr2 = array();
  $arr3 = array();
  $final = array();

  //Execute the query.
  $result = $database_link->query($query);

  if ($result->num_rows > 0) {
    while ($obj = $result->fetch_object()) {
      $arr[] = array('firstName' => $obj->firstName, 'userID' => $obj ->userID, 'food' => $obj->food, 'name' => $obj->name, 'location' => $obj->location, 'orderID' => $obj ->orderID);
    }
  }

  $res2 = $database_link->query($query2);
  if ($res2->num_rows > 0) {
    while ($obj = $res2->fetch_object()) {
      //Need to specifically query for the name of the user who wants the food delivered to them.
      $query3 = "SELECT firstName FROM `User` WHERE userID =" . $obj->userID or die("Error in the consult.." . mysqli_error($database_link));

      $res3 = $database_link->query($query3);
      $obj2 = $res3->fetch_object();

      $arr2[] = array('firstName' => $obj2->firstName, 'userID' => $obj->userID, 'food' => $obj->food, 'name' => $obj->name, 'location' => $obj->location, 'orderID' => $obj ->orderID);
    }
  }

  $res3 = $database_link->query($query4);
  if ($res3->num_rows > 0) {
    while ($obj = $res3->fetch_object()) {
      $arr3[] = array('firstName' => $obj->firstName, 'userID' => $obj ->userID, 'food' => $obj->food, 'name' => $obj->name, 'location' => $obj->location, 'orderID' => $obj ->orderID);
    }
  }

  //Create an array of arrays by including all the previous result arrays.
  $final[] = array($arr, $arr2, $arr3);
  return $final;
}


/*Function retrieves details of an order, given the orderID.
Input  - $orderID, the number of the order.
Output - returns array with all the required information to populate the order Details page. */
function getDetails($orderID)
{
  global $database_link;

  $query = "SELECT a.orderID, c.firstName, b.name, a.food, a.details, a.location, a.tip, a.deliveryID, a.state, c.phone FROM `Order` a INNER JOIN `Restaurant` b ON a.restaurant = b.restaurant_id INNER JOIN `User` c ON a.userID = c.userID WHERE a.orderID = $orderID AND (current_timestamp() <= a.timestamp + INTERVAL 15 MINUTE)" or die("Error in the consult.." . mysqli_error($database_link));

  $arr = array();

  $result = $database_link->query($query);

  if ($result->num_rows > 0) {
    while ($obj = $result->fetch_object()) {
      //Query for the delivery ID if it exists.
      $query2 = "SELECT c.firstName, c.phone FROM `Order` a INNER JOIN `Restaurant` b ON a.restaurant = b.restaurant_id INNER JOIN `User` c ON a.deliveryID = c.userID WHERE a.orderID = $obj->orderID AND (current_timestamp() <= a.timestamp + INTERVAL 15 MINUTE)" or die("Error in the consult.." . mysqli_error($database_link));

      $res2 = $database_link->query($query2);

      //THIS ASSUMES THAT THE DELIVERER HAS INPUT A PHONE NUMBER.
      if ($res2->num_rows > 0) {
        while ($obj2 = $res2->fetch_object()) {
        $arr[] = array('orderID' => $obj->orderID, 'orderPerson' => $obj->firstName, 'deliverPerson' =>$obj2->firstName, 'restaurant' => $obj->name, 'food' => $obj->food, 'comments' =>$obj->details, 'location' => $obj->location, 'tip' => $obj->tip, 'state' => $obj->state, 'orderPersonPhone'=> $obj->phone, 'deliverPersonPhone' => $obj2->phone);
        }
      }
      else
      {
        $arr[] = array('orderID' => $obj->orderID, 'orderPerson' => $obj->firstName, 'restaurant' => $obj->name, 'food' => $obj->food, 'comments' =>$obj->details, 'location' => $obj->location, 'tip' => $obj->tip, 'state' => $obj->state);
      }
    }
  }

  return $arr;
}

?>