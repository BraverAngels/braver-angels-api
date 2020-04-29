const fetch = require('node-fetch');
require('dotenv').config()

function removeMember(email) {


  // find the person's distinct osdi url
  var personUrl = fetch(`https://actionnetwork.org/api/v2/people/?filter=email eq '${email}'`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OSDI-API-Token': process.env.AN_KEY
        },
      })
      .then(res => {
        if (!res.ok) {
          throw "Request error"
        }
        return res.json()
      })
      .then((data) => {
        return data._links['osdi:people'][0].href
      })
      .catch((err) => {
        return err;
      });



    // find the member tagging link if the tag exists for member
    var tagging = personUrl.then(function(response) {
      return fetch(response + '/taggings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'OSDI-API-Token': process.env.AN_KEY
          },
        })
        .then(res => {
          if (!res.ok) {
            throw "Request error"
          }
          return res.json()
        })
        .then((data) => {
          return data._links['osdi:taggings'].find((item) => {
            return item.href.includes('052aaaef-0638-41e9-9d5d-85b0b0e6c49a');
          })
        })
        .catch((err) => {
          return err;
        });
    })



    //return true if member does not have tag, false if failure
    return tagging.then((url) => {
      if (!url) {
        return true
      }
      return fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'OSDI-API-Token': process.env.AN_KEY
          },
        })
        .then(res => {
          if (!res.ok) {
            throw "Request error"
          }
          return res.json()
        })
        .then((response) => {
          return true;
        })
        .catch((err) => {
          return err;
        });
    })
    
}


module.exports = removeMember
