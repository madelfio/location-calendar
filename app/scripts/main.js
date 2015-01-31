/* configuration for jshint */
/* global d3, Calendar, LocalGeocoder, Progress */

(function() {
  'use strict';

  var file,
      DAY_HOURS = [11, 15],
      NIGHT_HOURS = [23, 4],
      hour_range = NIGHT_HOURS;

  var geocoder = LocalGeocoder(),
      calendar = Calendar(d3.select('#calendar'));

  // UID functions
  var fileUID = function(d) {
    return d.file.lastModified + '' + d.file.size + '' + d.file.name;
  };

  var fullUID = function(d) {
    return fileUID(d) + '' + d.hour_range;
  };

  // Processing functions
  function loadFile(env, cb) {
    var file = env.file,
        file_reader = new FileReader();

    file_reader.onprogress = function(e) {env.progress.set(e.loaded / e.total);};
    file_reader.onload = function(e) {cb(e.target.result);};
    file_reader.readAsText(file);
  }

  function parseJson(raw_data, env, cb) {
    cb(JSON.parse(raw_data));
  }

  function filterHours(data, env, cb) {
    var filtered_data = {},
        batches = 50,
        batch = Math.floor(data.locations.length / batches),
        l, t, d,
        hr;

    if (hour_range[0] < hour_range[1]) {
      hr = function(h) {return (h > hour_range[0] && h < hour_range[1]) ? 0 : null;};
    } else {
      hr = function(h) {return (h > hour_range[0] ? 0 : h < hour_range[1] ? 1 : null);};
    }

    function getApproxLocalTime(ts, lon) {
      return new Date(ts + (lon/15) * 60 * 60 * 1000);
    }

    var fmt = d3.time.format.utc('%Y-%m-%d');

    // Given a Date object, return yyyy-mm-dd for beginning of filter range
    // *iff* the time in estimated tz falls within filter range
    function getDay(t) {
      var offset = hr(t.getUTCHours());
      return (offset === null ? null :
              fmt(new Date(t.getTime() - offset * 24 * 60 * 60 * 1000)));
    }

    // pull out dates that satisfy hour ranges
    function applyFilter(first, last) {
      last = Math.min(last, data.locations.length - 1);
      for (var i = first; i <= last; i++) {
        l = data.locations[i];
        t = getApproxLocalTime(+l.timestampMs, l.longitudeE7 * 1e-7);
        d = getDay(t);

        if (d) {
          d in filtered_data || (filtered_data[d] = []);
          filtered_data[d].push({
            lat: l.latitudeE7, lon: l.longitudeE7, ts: l.timestampMs, day: d
          });
        }
      }

      if (first >= last) {
        cb(filtered_data);
      } else {
        env.progress.set(last / data.locations.length);
        setTimeout(applyFilter, 1, last, last + batch);
      }
    }

    applyFilter(0, batch);

  }

  // Return new object, with one location representing each day.
  // Currently using stub logic -- should eventually find time-offset-weighted
  // centroid of points rather than the first
  function selectRepresentatives(filtered_data, env, cb) {
    var reps = {};
    for (var day in filtered_data) {reps[day] = filtered_data[day][0];}
    cb(reps);
  }

  // return new object, with assigned place name and info for each
  // representative
  function reverseGeocode(representatives, env, cb) {
    var georeps = d3.values(representatives).map(function(r) {
      r.location = geocoder.geocode(r);
      return r;
    });
    cb(georeps);
  }

  function render(georeps, env, cb) {
    d3.select('#container').style('display', 'block');
    calendar.render(georeps, env, cb);
  }

  // construct processing pipeline
  var loadFileC = progressify(loadFile, 'Processing File'),
      parseJsonC = pipeline(parseJson, 'Parsing JSON', fileUID, loadFileC),
      filterC = pipeline(filterHours, 'Applying Time Filter', fileUID, parseJsonC),
      repC = pipeline(selectRepresentatives, 'Selecting Locations', fullUID, filterC),
      geocodeC = pipeline(reverseGeocode, 'Reverse Geocoding', fullUID, repC),
      renderC = pipeline(render, 'Rendering', fullUID, geocodeC);

  // add caching to determine when required inputs have already been computed.
  function cachify(main_func, uid_func, prereq_func) {
    var cache = {};
    return function(env, cb) {
      var uid = uid_func(env);
      if (!cache.hasOwnProperty(uid)) {
        prereq_func(env, function() {
          cache[uid] = [].slice.call(arguments, 0);
          setTimeout(function() {
            main_func.apply(this, [].concat(cache[uid], env, cb));
          }, 100);
        });
      } else {
        setTimeout(function() {
          main_func.apply(this, [].concat(cache[uid], env, cb));
        }, 100);
      }
    };
  }

  // add progress bar during execution of main_func
  //
  // The main_func is assumed to take an env object as the penultimate
  // argument, and a "done" callback as the last argument.  The progress bar
  // is initialized on function invocations and automatically completed on
  // callback invocations.  Also, a reference to the progress bar object is
  // added to the env to allow calls to progress.set().
  function progressify(main_func, txt) {
    return function() {
      var args = [].slice.call(arguments, 0);
      if (args.length >= 2) {
        var progress = Progress(txt).start(),
            cb = args[args.length - 1];
        args[args.length - 2].progress = progress;
        args[args.length - 1] = function() {
          progress.done();
          cb.apply(this, arguments);
        };
        setTimeout(function() {
          main_func.apply(this, args);
        }, 100);
      }
    };
  }

  function pipeline(main_func, txt, uid_func, prereq_func) {
    return cachify(progressify(main_func, txt), uid_func, prereq_func);
  }

  function run(file, hour_range) {
    renderC({file: file, hour_range: hour_range}, function() {
      setTimeout(Progress().clearAll, 200);
      scrollToCalendar();
    });
  }

  function scrollToCalendar() {
    d3.transition().duration(1000)
        .tween('scroll', scrollTween(d3.select('#container').property('offsetTop')));
  }

  function scrollTween(offset) {
    return function() {
      var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
      return function(t) { scrollTo(0, i(t)); };
    };
  }

  d3.select('#file-input').on('change', function() {
    run(file = this.files[0], hour_range);
  });

  d3.selectAll('#options input').on('change', function() {
    hour_range = this.value === 'night' ? NIGHT_HOURS : DAY_HOURS;
    console.log('you selected hour_range:', hour_range);
    if (file) {
      run(file, hour_range);
    }
  });

})();
