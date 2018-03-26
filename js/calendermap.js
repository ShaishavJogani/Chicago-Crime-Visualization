var width3 = 900,
    height3 = 105,
    cellSize = 12; // cell size
    week_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
	
var dailydata,lowYear=lowerYear, highYear=upperYear, crimeArray;
	
var day = d3.timeFormat("%w"),
    week = d3.timeFormat("%U"),
    percent = d3.format(".1%"),
	format = d3.timeFormat("%Y-%m-%d");
	//parseDate = d3.time.format("%Y-%m-%d").parse;
		
    
var svg = d3.select(".calender-map").selectAll("svg")
    .data(d3.range(lowerYear, upperYear +1))
  .enter().append("svg")
.attr("id", function(d) {
                return "year"+d;
            })
    .attr("width3", '100%')
    .attr("data-height", '0.5678')
    .attr("viewBox",'0 0 900 105')
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width3 - cellSize * 53) / 2) + "," + (height3 - cellSize * 7 - 1) + ")");

svg.append("text")
.attr("fill",'#fff')
    .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });
 
for (var i=0; i<7; i++)
{    
svg.append("text")
	.attr("fill","#ffffff")
    .attr("transform", "translate(-5," + cellSize*(i+1) + ")")
    .style("text-anchor", "end")
    .attr("dy", "-.25em")
    .text(function(d) { return week_days[i]; }); 
 }

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter()
	.append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .attr("fill",'#fff')
    .datum(format);

var legend = svg.selectAll(".legend")
      .data(month)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (((i+1) * 50)+8) + ",0)"; });

legend.append("text")
.attr("fill",'#fff')
   .attr("class", function(d,i){ return month[i] })
   .style("text-anchor", "end")
   .attr("dy", "-.25em")
   .text(function(d,i){ return month[i] });
   
svg.selectAll(".month")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("id", function(d,i){ return month[i] })
    .attr("d", monthPath);

	  
	
d3.csv("data/DailyDataDate.csv", function(error, csv) {

  dailydata = csv;
  
 updateCalendar(getCrimesArray());
  
});

function updateCalendar(crimes) {

	for (var i=2007 ; i<=2016;i++) {

	if(i<lowerYear || i> upperYear) {

		var id1 = "year" +i;
		$('#'+id1).height(0);
		
	} else {
		var id1 = "year" +i;
		$('#'+id1).height(140);
		}

	}


  	var filterData = dailydata.filter(function(d){
        return (d.year>=lowerYear && d.year<=upperYear) ? true : false;
	});

	
	if(selectedCommunity != 0) {
	filterData = filterData.filter(function(d){
        return (d.community_area == selectedCommunity) ? true : false;
	});
	}
	
var data = d3.nest()
    .key(function(d) { return d.date; })
    .rollup(function(leaves) { return d3.sum(leaves, function(d) {
						 return getCrimeCount(crimes, d);
                              });
							  })
    .object(filterData);
	
	var count_max = d3.max(d3.values(data));
	var count_min = d3.min(d3.values(data));
	var color = d3.scaleLinear().range(["#ffffb2", '#b10026'])
    .domain([count_min, count_max])

	
  rect.filter(function(d) { return d in data; })
  .attr("class","calender")
    .attr("fill", function(d) { return color(data[d]); })
	.attr("data-title", function(d) { return "value : "+data[d]})
   .on("mouseover", function(d) {
                dayhighlight(d,data[d]);
            })
            .on("mouseout", function(d) {
                daydehighlight();
            });   
	//$("rect").tooltip({container: 'body', html: true, placement:'top'}); 
}

function dayhighlight(d,data) {


    var labelAttribute = "<b>Day: " + "</b>" + d + "<br /><b>Crime Count: " +
        data + "</b></style>"


    var tooltip = d3.select("#cal-map").append("div").attr("id", "tooltip").attr("class", "tooltip");

    tooltip.style("left", (d3.event.pageX + 10) + "px") //reposition label horizontal
        .style("top", (d3.event.pageY - 15) + "px") //reposition label vertical
        .html(labelAttribute);
};

function daydehighlight() {
    d3.select("#tooltip").remove();
};


function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
