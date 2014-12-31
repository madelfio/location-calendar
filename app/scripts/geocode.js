/* exported LocalGeocoder */

function LocalGeocoder() {
  "use strict";
  var geocoder = {};

  geocoder.geocode = function() {
    // given object with lat/lon attributes
    // return object with name, country, adm1
    return {
      name: 'Chevy Chase',
      country: 'United States',
      adm1: 'Maryland',
    };
  };

  return geocoder;
}
