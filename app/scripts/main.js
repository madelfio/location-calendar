/* configuration for jshint */
/* global d3, LocalGeocoder */

(function() {
  'use strict';

  var hour_range = [23, 5];

  uploadFile();

  // Step One
  function uploadFile() {
    console.log('Initializing upload zone');
    var file_input = document.getElementById('file-input');

    file_input.addEventListener('change', function() {
      var file = file_input.files[0];
      processFile(file);
    });
  }

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
    var t, d;
    var checkHour;

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
    for (d in locations) {
      // compute target date
      // compute candidates
      // compute centroid
      // return candidate nearest to centroid

      // temp logic.  TODO: implement steps above
      representatives[d] = locations[d][0];
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

    var geocoder = LocalGeocoder();
    // assign place name and info to each representative
    var r;
    var rep_arr = [];
    for (r in representatives) {
      if (representatives.hasOwnProperty(r)) {
        var v = representatives[r];
        v.location = geocoder.geocode(v);
        v.day = new Date(r);
        rep_arr.push(v);
      }
    }
    window.rep_arr = rep_arr;
    renderAll(data, locations, rep_arr);
  }

  // Step Five
  function renderAll(data, locations, rep_arr) {
    renderCalendar(d3.select('#calendar'), rep_arr);
    //renderLegend(d3.select('#legend'), representatives);
    //renderList(d3.select('#listing'), representatives);
  }

  function renderCalendar(div, data) {

    var colorMap = d3.scale.ordinal()
        .range(['#2ca02c', '#ffbb78', '#ff9896', '#c5b0d5', '#e377c2',
          '#f7b6d2', '#7f7f7f', '#c7c7c7 ', '#bcbd22', '#cbcb8d', '#17be6f',
          '#9edae5', '#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939',
          '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52',
          '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173',
          '#a55194', '#ce6dbd', '#de9ed6', '#3182bd', '#6baed6', '#9ecae1',
          '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354',
          '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc',
          '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9', 'darkblue',
          'darkgreen', 'crimson', 'darkmagenta', 'darkorange', 'darkorchid',
          'darkturquoise', 'darkviolet']);

    function color(place) {
      switch (place) {
        case 'Unknown':
          return '#eee';
        case 'Washington, DC, USA':
          return '#98df8a';
        case 'Richmond, VA, USA':
          return '#aec7e8';
        case 'Chevy Chase, MD, USA':
          return '#ff7f0e';
        case 'Oakton, VA, USA':
          return '#1fb7b4';
        case 'Chevy Chase Village, MD, USA':
          return 'gold';
        case 'Howard, MD, USA':
          return '#9467bd';
        case 'Vienna, VA, USA':
          return '#C76';
        case 'Corolla, NC, USA':
          return '#c49c94';
        case 'College Park, MD, USA':
          return 'lemonchiffon';
        default:
          return colorMap(place);
      }
    }

    var day = d3.time.format('%w'),
        week = d3.time.format('%U'),
        year = d3.time.format('%Y'),
        format = d3.time.format('%Y-%m-%d');
    var width = 960,
        height = 136,
        cellSize = 15;

    var year_range = d3.extent(data, function(d) {return +year(d.day);});

    var svg = div.selectAll('svg')
        .data(d3.range(year_range[0],year_range[1] + 1), function(d) {return d;})
      .enter().insert('svg', ':first-child')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'year')
      .append('g')
        .attr('transform', 'translate(' + ((width - cellSize * 53) / 2) + ',' + (height - cellSize * 7 - 1) + ')');

    svg.append('text')
      .attr('transform', 'translate(-28,' + cellSize * 3.5 + ')rotate(-90)')
      .style('text-anchor', 'middle')
      .text(function(d) {return d;});

    svg.append('g')
        .attr('transform', 'translate(-12,' + cellSize * 0.75 + ')')
        .attr('fill', '#666')
      .selectAll('text').data('Su,M,T,W,Th,F,S'.split(',')).enter().append('text')
        .attr('transform', function(d,i) {return 'translate(0,' + cellSize * i + ')';})
        .style('text-anchor', 'middle')
        .style('font-size', '10pt')
        .text(function(d) {return d;});

    var rect = svg.selectAll('.day')
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append('rect')
        .attr('class', 'day')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', function(d) {return week(d) * cellSize; })
        .attr('y', function(d) {return day(d) * cellSize; })
        .attr('fill', 'white')
        .datum(format);

    rect.append('title')
        .text(function(d) {return d;});

    svg.selectAll('.month')
        .data(function(d) {return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append('path')
        .attr('class', 'month')
        .attr('d', monthPath);

    var data_lookup = d3.nest()
      .key(function(d) {return format(d.day);})
      .rollup(function(d) {return d[0];})
      .map(data);

    d3.selectAll('.day')
        .filter(function(d) {return d in data_lookup;})
        .attr('fill', function(d) {return color(data_lookup[d].location.name);})
      .select('title')
        .text(function(d) {return d + ' - ' + data_lookup[d].location.name;});

    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return ("M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
              "H" + w0 * cellSize + "V" + 7 * cellSize +
              "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
              "H" + (w1 + 1) * cellSize + "V" + 0 +
              "H" + (w0 + 1) * cellSize + "Z");
    }
  }

  //
  // Utility Functions
  //

  // Function to prettify a disk size value.
  //
  // E.g., pretty(1234567) => "1.2MB"
  //       pretty(1234567, 'KB') => "1205.6KB"

  /* Commenting until used
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
  */

})();
