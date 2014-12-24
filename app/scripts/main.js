(function() {
  'use strict';

  var hour_range = [23, 5];

  // Step One
  function uploadFile() {
    console.log('Initializing upload zone');
    var file_input = document.getElementById('file-input');

    file_input.addEventListener('change', function(e) {
      var file = file_input.files[0];
      processFile(file);
    });
  }

  uploadFile();

  // Step Two
  function processFile(file) {
    console.log('Processing file');
    var file_reader = new FileReader(),
        file_size = file.size;

    file_reader.onprogress = function(e) {
      var pct = Math.round((e.loaded / e.total) * 100);
      showStatus(pct, file_size);
    };

    file_reader.onload = function(e) {
      //try {
        computeLocations(e.target.result);
      //} catch (exception) {
      //  console.log('Error loading data');
      //  console.log(exception);
      //}
    };

    file_reader.readAsText(file);

    function showStatus(pct, file_size) {
      console.log(pct, file_size);
    }
  }

  // Step Three
  function computeLocations(raw_data) {
    console.log('computing locations');
    var data = JSON.parse(raw_data);
    window.data = data;
    var locations = {}, representatives = {};
    var t, d, h;
    var checkHour;

    var num_candidates = 5;

    if (hour_range[0] < hour_range[1]) {
      checkHour = function(h) {
        return (h > hour_range[0] && h < hour_range[1]);
      };
    } else {
      checkHour = function(h) {
        return (h > hour_range[0] || h < hour_range[1]);
      };
    }

    // pull out dates that satisfy hour ranges
    data.locations.forEach(function(l) {
      t = new Date(+l.timestampMs);
      d = getDay(t);

      if (d) {
        d in locations || (locations[d] = []);
        locations[d].push({
          lat: l.latitudeE7,
          lon: l.longitudeE7,
          ts: l.timestampMs,
        });
      }
    });

    // choose representatives
    for (var l in locations) {
      // compute target date
      // compute candidates
      // compute centroid
      // return candidate nearest to centroid

      // temp logic.  TODO: implement steps above
      representatives[l] = locations[l][0];
    }

    console.log('got json');
    reverseGeocode(data, locations, representatives);

    // Given a Date object, return yyyy-mm-dd for beginning of filter range
    // *iff* the time in estimated tz falls within filter range
    function getDay(t) {
      if (checkHour(t.getHours()) !== false) {
        return t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
      } else {
        return null;
      }
    }

  }

  // Step Four
  function reverseGeocode(data, locations, representatives) {
    console.log('reverse geocoding locations...');
    window.locations = locations;
    window.representatives = representatives;
    renderCalendar(data, locations);
  }

  // Step Five
  function renderCalendar(data, locations) {
    console.log('rendering calendar');
  }

  //
  // Utility Functions
  //

  // Function to prettify a disk size value.
  //
  // E.g., pretty(1234567) => "1.2MB"
  //       pretty(1234567, 'KB') => "1205.6KB"
  function pretty(size, unit) {
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
        unit_idx = unit && sizes.indexOf(unit);

    if (unit_idx) {
      return (size/Math.pow(1024, unit_idx)).toFixed(1) + unit;
    }

    for (var i = sizes.length; i > 0; i--) {
      var min = Math.pow(1024, i);
      if (size > min) {
        return (size/min).toFixed(1) + sizes[i];
      }
    }
  }

//  function GoogleGeocoder() {
//    var geocoder = {};
//
//    var cache = {},
//        queue = [],
//        p = 4,  // lat/lon decimal precision to use for cache lookups
//        ts = 1000,
//        tu = 2000;
//
//    var precision = 4; // number of lat/lon digits to use for cache lookups
//
//    geocoder.geocode = function(lat, lon, cb) {
//      // add to queue
//      queue.append([lat, lon, cb]);
//      processQueue();
//    }
//
//    function processQueue() {
//      // check if any in queue can be answered approximately, if so return
//      // them
//      var hits = [];
//      queue.forEach(function(l, i) {
//        if (l[0]) {}
//      });
//
//      // check time since last request, if was successful and t > ts or was
//      // unsuccessful and t > tu, then run.  else, clear scheduled calls and
//      // schedule next call of processQueue for appropriate time.
//    }
//
//    return geocoder;
//  }

  function LocalGeocoder() {
    var geocoder = {},
        tree;

    function geodist(a, b) {
      var rad = Math.PI / 180,
          lat1 = a.latitude * rad,
          lon1 = a.longitude * rad,
          lat2 = b.latitude * rad,
          lon2 = b.longitude * rad,
          dLat = (lat2 - lat1),
          dLon = (lon2 - lon1),
          x = Math.sin(dLat / 2),
          y = Math.sin(dLon / 2),
          c = x * x + y * y * Math.cos(lat1) * Math.cos(lat2);

      return Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
    }

    tree = new kdTree();

    geocoder.geocode = function(lat, lon, cb) {

    };
  }

})();
