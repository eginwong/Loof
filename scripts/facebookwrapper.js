  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      //MAKE SURE THIS WORKS.
      if(sessionStorage.getItem("profilePic") === null) {
        getProfilePicture();
      }
      else {
      }
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '691755877586784',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.1' // use version 2.1
    });

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));


  /*Function is called and the user is stored in the database if not already.
  Otherwise, the user just has the profile stored as a session variable.
  Output  - new user can be created, session variable will be stored, and the user redirected to the home page. */
  function getProfilePicture() {
    var userData = {};

    FB.api('/me', function(response) {
      //Store the profile as a Session variable. It will be used throughout the app to identify the user.
      sessionStorage.setItem("profilePic", 'http://graph.facebook.com/' + response.id);

      userData.profile = 'http://graph.facebook.com/' + response.id;
      userData.fbFirstName = response.first_name;
      userData.fbLastName = response.last_name;

      //Use AJAX call to create a user in the database if they do not already exist.
      $.ajax({
        type: "POST",
        url : "scripts/user.php",
        async : false,
        data: { json_data: JSON.stringify(userData)},
        success : function() {
        },
        error : function() {
        }
      });

      //Reload the page, as the session variable will be stored and the user will be redirected.
      location.reload();
    });
  }

  /*Function allows the user to log out from the application.
  Output  - logs the user out of the application. */
  function logoutDropImage() {
    sessionStorage.clear();
    FB.logout(function(response) {
    });
    location.reload();
  }