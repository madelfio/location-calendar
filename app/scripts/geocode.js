/* global kdTree, gaz */
/* exported LocalGeocoder */

function distance(a, b) {
  "use strict";
  var rad = Math.PI/180,
      lat1 = a.lat,
      lon1 = a.lon,
      lat2 = b.lat,
      lon2 = b.lon;

  var dLat = (lat2-lat1)*rad;
  var dLon = (lon2-lon1)*rad;
  lat1 = lat1*rad;
  lat2 = lat2*rad;

  var x = Math.sin(dLat/2);
  var y = Math.sin(dLon/2);

  a = x*x + y*y * Math.cos(lat1) * Math.cos(lat2);
  return Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function LocalGeocoder() {
  "use strict";

  var geocoder = {};

  var gaz_tree = new kdTree(gaz, distance, ['lat', 'lon']);

  geocoder.geocode = function(pt) {
    // given object with lat/lon attributes
    // return object with n (name), c (country), a (admin1)

    var q = {lat: pt.lat * 1e-7, lon: pt.lon * 1e-7};

    var n = gaz_tree.nearest(q, 1);

    console.log(q, n[0]);

    return n[0][0];

  };

  return geocoder;
}
