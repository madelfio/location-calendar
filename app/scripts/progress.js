// ProgressBar adds a progress bar to an overlay div
// .start() shows the progress bar
// .set(done_frac) sets the width of the progress bar
// .done() shows the completed progress bar
// .clear() removes the progress bar from the overlay
//
// Requires D3.js

/* global d3 */
/* exported Progress */

function Progress(name, div) {
  "use strict";
  var progress = {},
      outer_div,
      inner_div,
      pdiv,
      spinner;

  if (typeof div === 'undefined') {
    outer_div = d3.select('.progress-overlay');
  } else if (typeof div === 'string') {
    outer_div = d3.select(div);
  }

  inner_div = outer_div.select('.progress-container');

  if (!outer_div.node()) {
    outer_div = d3.select('body')
      .append('div')
        .attr('class', 'progress-overlay')
        .style('position', 'fixed')
        .style('background-color', 'rgba(10, 10, 10, .3)')
        .style('left', 0)
        .style('right', 0)
        .style('top', 0)
        .style('bottom', 0)
        .style('display', 'none')
        .style('text-align', 'center');
  }
  if (!inner_div.node()) {
    inner_div = outer_div.append('div')
        .attr('class', 'progress-container')
        .style('position', 'absolute')
        .style('width', '400px')
        .style('left', '50%')
        .style('margin-left', '-200px')
        .style('top', '10%')
        .style('background', 'white')
        .style('border-radius', '2px')
        .style('padding', '10px')
        .style('box-sizing', 'border-box');
  }

  spinner = inner_div.selectAll('.progress-spinner');

  if (!spinner.node()) {
    spinner = inner_div.insert('div', ':first-child')
        .attr('class', 'progress-spinner')
        .style('display', 'inline-block');

    spinner.append('div')
        .attr('class', 'progress-spinner-swirl')
        .style('width', '20px')
        .style('height', '20px')
        .style('border', 'solid 3px transparent')
        .style('border-left-color', 'green')
        .style('border-top-color', 'green')
        .style('border-radius', '50%')
        .style('-webkit-animation', 'progress-spinner 500ms linear infinite')
        .style('animation', 'progress-spinner 500ms linear infinite');

    var s = document.createElement('style');
    s.innerHTML = '@-webkit-keyframes progress-spinner { 0% {-webkit-transform: rotate(0deg);} 100% {-webkit-transform: rotate(360deg);}} @keyframes progress-spinner { 0$ {transform: rotate(0deg);} 100% {transform: rotate(360deg);} }';
    document.body.appendChild(s);
  }

  progress.start = function() {
    outer_div.style('display', 'block');

    pdiv = inner_div.append('div')
        .attr('class', 'progress-bar');

    pdiv.append('span')
        .style('display', 'inline-block')
        .style('width', '45%')
        .style('vertical-align', 'top')
        .style('text-align', 'right')
        .text(name);

    pdiv.append('span')
        .attr('class','progress-bar-bg')
        .style('width', '45%')
        .style('height', '1.5ex')
        .style('display', 'inline-block')
        .style('border', '1px solid black')
        .style('margin-left', '10px')
        .style('overflow', 'hidden')
      .append('span')
        .attr('class', 'progress-bar')
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'block')
        .style('position', 'relative')
        .style('background-color', 'blue')
        .style('left', '-100%');

    return progress;
  };

  progress.set = function(frac) {
    pdiv.select('.progress-bar')
      .style('left', ((frac-1.0)*100) + '%');
    return progress;
  };

  progress.done = function() {
    progress.set(1.0);
    return progress;
  };

  progress.clear = function() {
    pdiv.remove();
    // count progress bars, if none, remove spinner and hide overlay
    if (!inner_div.selectAll('.progress-bar').node()) {
      outer_div.style('display', 'none');
    }

    return progress;
  };

  progress.clearAll = function() {
    inner_div.selectAll('.progress-bar').remove();
    outer_div.style('display', 'none');
  };

  return progress;
}
