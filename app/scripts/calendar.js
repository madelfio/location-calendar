/* global d3 */
/* exported Calendar */

function Calendar(div) {
  "use strict";
  var calendar = {};

  var colorList = [
    // (C: 0.4-1.3, L: 1-1.5)
    "#8CCCED", "#F89A5F", "#43F8A3", "#FDFD96", "#E1BE32", "#B8D5A0",
    "#8DCE54", "#D2DDF5", "#F7BD94", "#A0F2D5", "#F99AB7",
    // Higher chroma to highlight trips
    "#35DA74", "#EE3FF2", "#F1441A", "#3E8DCE", "#E3E01B", "#EE3A84",
    "#A7720E", "#456CF3", "#B562B6", "#38F42D", "#74A220", "#F5B412",
    "#DE5B4C", "#A4F33D", "#2C8F3C", "#F223AA", "#B776F0", "#E97E21",
    "#ED2D58", "#48B221", "#55E655", "#7B80CD", "#C55A98", "#BE9A0D",
    "#488EEE", "#BD8CE8", "#D140B6", "#EE3F3C", "#767EEB", "#A4B419",
    "#7F8B18", "#E779DE", "#DD4C71", "#C559DE", "#C1E222", "#E1572A",
    "#8ED031", "#956EBF", "#469323", "#DA8D20", "#CE49A3", "#CC6324",
    "#E2578F", "#3FAC43", "#E640D0", "#E971C4", "#E34C5D", "#55C94C",
    "#A45ECC", "#50E026", "#CC54F0", "#FA1B8C", "#F02971", "#DE79ED",
    "#E948AA", "#EB3C93", "#986AEC", "#6C65E9", "#83E529", "#D03F7F"
 ];

  var color = d3.scale.ordinal().range(colorList);

  function primeColorPalette(locationNames) {
    var counts = {};
    locationNames.forEach(function(n) {
      counts[n] = counts[n] + 1 || 1;
    });

    var sortable = [];
    for (var n in counts) {
      sortable.push([n, counts[n]]);
    }

    sortable.sort(function(a, b) {return b[1] - a[1];});

    sortable.forEach(function(s) {
      color(s[0]);
    });
  }

  var day = d3.time.format('%w'),
      week = d3.time.format('%U'),
      year = d3.time.format('%Y'),
      format = d3.time.format('%Y-%m-%d');
  var width = 960,
      height = 136,
      cellSize = 15;

  calendar.render = function(data, params, cb) {

    // ensure div is not hidden
    div.style('display', 'block');

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
        .attr('fill', '#f3f3f3')
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

    primeColorPalette(data.map(function(d) {return d.location.n;}));

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

    cb();
  };

  return calendar;
}

