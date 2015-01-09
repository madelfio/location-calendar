function a(){var a=document.getElementById("file-input");a.addEventListener("change",function(){var c=a.files[0];b(c)})}function b(a){function b(a,b){console.log(a,b)}var d=new FileReader,e=a.size;d.onprogress=function(a){var c=Math.round(a.loaded/a.total*100);b(c,e)},d.onload=function(a){j=a.target.result,c(j,i)},d.readAsText(a)}function c(a,b){function c(a){return h(a.getHours())!==!1?a.getFullYear()+"-"+(a.getMonth()+1)+"-"+a.getDate():null}if(k.hasOwnProperty(b))return console.log("found representatives in cache"),void window.setTimeout(function(){d(e,i,k[b])},1);var e=JSON.parse(a);window.data=e;var f,g,h,i={},j={};h=b[0]<b[1]?function(a){return a>b[0]&&a<b[1]}:function(a){return a>b[0]||a<b[1]},e.locations.forEach(function(a){f=new Date(+a.timestampMs),g=c(f),g&&(g in i||(i[g]=[]),i[g].push({lat:a.latitudeE7,lon:a.longitudeE7,ts:a.timestampMs}))});for(g in i)j[g]=i[g][0];k[b]=j,console.log("finished computing representatives"),window.setTimeout(function(){d(e,i,j)},1)}function d(a,b,c){window.locations=b,window.representatives=c;var d,f=[];for(d in c)if(c.hasOwnProperty(d)){var g=c[d];g.location=l.geocode(g),g.day=new Date(d),f.push(g)}window.rep_arr=f,console.log("finished reverse geocoding"),window.setTimeout(function(){e(a,b,f)},1)}function e(a,b,c){d3.select("#container").style("display","block"),f(d3.select("#calendar"),c),console.log("finished rendering")}function f(a,b){function c(a){switch(a){case"Unknown":return"#eee";case"Washington, DC, USA":return"#98df8a";case"Richmond, VA, USA":return"#aec7e8";case"Chevy Chase, MD, USA":return"#ff7f0e";case"Oakton, VA, USA":return"#1fb7b4";case"Chevy Chase Village, MD, USA":return"gold";case"Howard, MD, USA":return"#9467bd";case"Vienna, VA, USA":return"#C76";case"Corolla, NC, USA":return"#c49c94";case"College Park, MD, USA":return"lemonchiffon";default:return e(a)}}function d(a){var b=new Date(a.getFullYear(),a.getMonth()+1,0),c=+f(a),d=+g(a),e=+f(b),h=+g(b);return"M"+(d+1)*l+","+c*l+"H"+d*l+"V"+7*l+"H"+h*l+"V"+(e+1)*l+"H"+(h+1)*l+"V0H"+(d+1)*l+"Z"}var e=d3.scale.ordinal().range(["#2ca02c","#ffbb78","#ff9896","#c5b0d5","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7 ","#bcbd22","#cbcb8d","#17be6f","#9edae5","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6","#3182bd","#6baed6","#9ecae1","#c6dbef","#e6550d","#fd8d3c","#fdae6b","#fdd0a2","#31a354","#74c476","#a1d99b","#c7e9c0","#756bb1","#9e9ac8","#bcbddc","#dadaeb","#636363","#969696","#bdbdbd","#d9d9d9","darkblue","darkgreen","crimson","darkmagenta","darkorange","darkorchid","darkturquoise","darkviolet"]),f=d3.time.format("%w"),g=d3.time.format("%U"),h=d3.time.format("%Y"),i=d3.time.format("%Y-%m-%d"),j=960,k=136,l=15,m=d3.extent(b,function(a){return+h(a.day)}),n=a.selectAll("svg").data(d3.range(m[0],m[1]+1),function(a){return a}).enter().insert("svg",":first-child").attr("width",j).attr("height",k).attr("class","year").append("g").attr("transform","translate("+(j-53*l)/2+","+(k-7*l-1)+")");n.append("text").attr("transform","translate(-28,"+3.5*l+")rotate(-90)").style("text-anchor","middle").text(function(a){return a}),n.append("g").attr("transform","translate(-12,"+.75*l+")").attr("fill","#666").selectAll("text").data("Su,M,T,W,Th,F,S".split(",")).enter().append("text").attr("transform",function(a,b){return"translate(0,"+l*b+")"}).style("text-anchor","middle").style("font-size","10pt").text(function(a){return a});var o=n.selectAll(".day").data(function(a){return d3.time.days(new Date(a,0,1),new Date(a+1,0,1))}).enter().append("rect").attr("class","day").attr("width",l).attr("height",l).attr("x",function(a){return g(a)*l}).attr("y",function(a){return f(a)*l}).attr("fill","white").datum(i);o.append("title").text(function(a){return a}),n.selectAll(".month").data(function(a){return d3.time.months(new Date(a,0,1),new Date(a+1,0,1))}).enter().append("path").attr("class","month").attr("d",d);var p=d3.nest().key(function(a){return i(a.day)}).rollup(function(a){return a[0]}).map(b);d3.selectAll(".day").filter(function(a){return a in p}).attr("fill",function(a){return c(p[a].location.n)}).select("title").text(function(a){return a+" - "+p[a].location.n})}var g=[11,15],h=[23,4],i=h,j=[],k={},l=LocalGeocoder();a(),d3.selectAll("input").on("change",function(){i="night"===this.value?h:g,console.log("you selected hour_range:",i),j.length>0&&c(j,i)})}();