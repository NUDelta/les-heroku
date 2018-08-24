$(document).ready(function() {
  ////////////////////////////////
  /* Page Setup Related Content */
  ////////////////////////////////
  /**
   * Verify user is logged in before continuing
   */
  showPreferenceContent();

  // logout user
  $('#logout').click(function(e) {
    e.preventDefault();
    Parse.User.logOut().then(user => {
      window.location.href = '/';
    }).catch(error => {
      console.log(error);
    });
  });

  //////////////////////////////////////
  /* Completion Page Specific Content */
  //////////////////////////////////////
  /**
   * Take user back to home.
   */
  $('#go-home-button').click(function(e) {
    e.preventDefault();

    // update preference progress
    const user = Parse.User.current();
    user.set('preferenceProgress', 'coffeeshop');
    user.save().then(user => {
      console.log('beginning preference capture for user: ' + JSON.stringify(user));
      window.location.href = '/preferences/create/coffee-shops';
    }).catch(error => {
      console.log(error);
    });
  });

  const installationLink = 'https://i.diawi.com/ExASsV';
  function updateInstallationLinks() {
    let $diawiLink = $('#diawi-link'),
        $yellkeyLink = $('#yellkey-link'),
        $yellkeyText = $('#yellkey-text');

    // get yellkey for installation link
    let url = 'https://www.yellkey.com/api/new?url=' + installationLink + '&time=10';
    $.get(url, function (data, status) {
      // check if valid key exists in returned object
      let yellkeyUrl = '';
      if (status === "success" && data.hasOwnProperty('key')) {
        yellkeyUrl = 'https://www.yellkey.com/' + data.key;
      }

      // set HTML
      $diawiLink.attr("href", installationLink);
      $diawiLink.text(installationLink);

      if (yellkeyUrl !== ''){
        $yellkeyLink.attr("href", yellkeyUrl);
        $yellkeyLink.text(yellkeyUrl);
      } else {
        $yellkeyText.text('');
      }
    });
  }

  updateInstallationLinks();
});