<?php

$connection = mysqli_connect("localhost","e47wong","Fall2014","e47wong") or die("Error " . mysqli_error($link)); 


//This switch determines which function will be performed based on what parameters are passed in.
if(isset($_POST['json_data']) && !empty($_POST['json_data'])) {
  insertUser(json_decode($_POST['json_data']));
}
else if(isset($_GET['phone']) && !empty($_GET['phone'])) {
	//run update User
  updateUser($_GET['p'], $_GET['phone']);
}
else {
	$return = array();
  $return = searchUser($_GET['p']);

  //Retrieve result, encode the array and echo the string back to the application layer.
	echo json_encode($return);
}


/*Function stores Facebook credentials into the MySQL db.
Input  - $fbInfo, a variable for an array decoded from JSON input.
Output - returns nothing. */
function insertUser($fbInfo)
{
  global $connection;

  //Check if there already exists a user with the same Facebook userID.	
  $test = "SELECT COUNT(*) FROM `User` WHERE fBLink = '$fbInfo->profile'";

  $res = $connection->query($test);
  $row = $res->fetch_row();
  
  //If the result is 0, proceed with inserting the new user into the MySQL database.
  if ($row[0] == 0) {

    $sql = "INSERT INTO `User`(`firstName`, `lastName`, `fBLink`) VALUES ('$fbInfo->fbFirstName', '$fbInfo->fbLastName', '$fbInfo->profile')";
    $result = $connection->query($sql);
  }
}


/*Function searches for the user's name, phone number, and rating.
Input  - $profile, a string with the user's profile string from Facebook.
Output - returns array with name, phone number, and ratings for the user. */
function searchUser($profile)
{
  global $connection;

  $ret = array();

  //Queries for user profile and ratings.
  $sql1 = "SELECT firstName, lastName, phone FROM `User` WHERE fBLink = '$profile'" or die("Error in the consult.." . mysqli_error($connection));
  $sql2 = "SELECT AVG(b.rating) AS avg FROM `User` a INNER JOIN `Ratings` b ON a.userID = b.userID WHERE a.fBLink = '$profile'" or die("Error in the consult.." . mysqli_error($connection));
  $sql3 = "SELECT COUNT(b.rating) AS count FROM `User` a INNER JOIN `Ratings` b ON a.userID = b.userID WHERE a.fBLink = '$profile'" or die("Error in the consult.." . mysqli_error($connection));
  
  //The queries are performed in unison so that all the data can be added to the returning array at once.
  $result = $connection->query($sql1);
  if ($result->num_rows > 0) {
    while ($obj = $result->fetch_object()) {
	  $res2 = $connection->query($sql2);
	  if ($res2->num_rows > 0) {
    	while ($obj2 = $res2->fetch_object()) {
		  $res3 = $connection->query($sql3);
		  if ($res3->num_rows > 0) {
		    while ($obj3 = $res3->fetch_object()) {
	  		  $ret[] = array('firstName' => $obj->firstName, 'lastName' => $obj ->lastName, 'phone' => $obj->phone, 'avg_rating' => round($obj2->avg,0,PHP_ROUND_HALF_UP), 'sum_rating' => $obj3->count);
    		}
    	  }
    	}
      }
      else
      {
      	//Just in case the user has no reviews.
	      $ret[] = array('firstName' => $obj->firstName, 'lastName' => $obj ->lastName, 'phone' => $obj->phone, 'avg_rating' => 0, 'sum_rating' => 0);
      }  
    }
  }
  return $ret;
}


/*Function stores Facebook credentials into the MySQL db.
Input  - $profile, $phone, variables with the user's profile string and phone number.
Output - returns nothing. */
function updateUser($profile, $phone)
{
  global $connection;

  $sql = "UPDATE `User` SET phone = '$phone' WHERE fBLink = '$profile'";
  $result = $connection->query($sql);
}

?>