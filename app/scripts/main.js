/* configuration for jshint */
/* global d3, LocalGeocoder, Progress */

(function() {
  'use strict';

  var DAY_HOURS = [11, 15],
      NIGHT_HOURS = [23, 4],
      hour_range = NIGHT_HOURS,
      raw_data = [],
      representative_cache = {};

  var geocoder = LocalGeocoder();

  uploadFile();

  // Step One
  function uploadFile() {
    var file_input = document.getElementById('file-input');

    file_input.addEventListener('change', function() {
      var file = file_input.files[0];
      processFile(file);
    });
  }

  // Step Two
  function processFile(file) {
    var file_reader = new FileReader(),
        file_size = file.size;

    var p = Progress('Processing File').start();

    file_reader.onprogress = function(e) {
      var pct = Math.round((e.loaded / e.total) * 100);
      p.set(e.loaded / e.total);
      showStatus(pct, file_size);
    };

    file_reader.onload = function(e) {
      raw_data = e.target.result;
      computeLocations(raw_data, hour_range);
      p.done().clear();
    };

    file_reader.readAsText(file);

    function showStatus(pct, file_size) {
      console.log(pct, file_size);
    }
  }

  // Step Three
  function computeLocations(raw_data, hour_range) {
    if (representative_cache.hasOwnProperty(hour_range)) {
      console.log('found representatives in cache');

      window.setTimeout(function() {
        reverseGeocode(data, locations, representative_cache[hour_range]);
      }, 1);
      return;
    }

    var p = Progress('Parsing File').start();
    var data = JSON.parse(raw_data);
    p.done();

    var p2 = Progress('Filtering Locations').start();

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

    representative_cache[hour_range] = representatives;

    console.log('finished computing representatives');

    window.setTimeout(function() {
      reverseGeocode(data, locations, representatives);
      p2.done().clear();
      p.done().clear();
    }, 1);

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
    window.locations = locations;
    window.representatives = representatives;

    var p = Progress('Geocoding').start();

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
    console.log('finished reverse geocoding');
    window.setTimeout(function() {
      renderAll(data, locations, rep_arr);
      p.done().clear();
    }, 1);
  }

  // Step Five
  function renderAll(data, locations, rep_arr) {
    var p = Progress('Rendering').start();
    d3.select('#container').style('display', 'block');
    renderCalendar(d3.select('#calendar'), rep_arr);
    //renderLegend(d3.select('#legend'), representatives);
    //renderList(d3.select('#listing'), representatives);
    p.done().clear();
    console.log('finished rendering');
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
        .attr('fill', function(d) {return color(data_lookup[d].location.n);})
      .select('title')
        .text(function(d) {return d + ' - ' + data_lookup[d].location.n;});

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

  d3.selectAll('input').on('change', function change() {
    hour_range = this.value === 'night' ? NIGHT_HOURS : DAY_HOURS;
    console.log('you selected hour_range:', hour_range);
    if (raw_data.length > 0) {
      computeLocations(raw_data, hour_range);
    }
  });
})();
