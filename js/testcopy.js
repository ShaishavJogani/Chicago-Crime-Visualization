var chart;
var xScale,yScale,xAxis,yAxis;
var height = 300;
var width = 450;
var margin = {top: 10, right: 100, bottom: 40, left: 45};
var colors=["#267DB1","#F27914","#35B430","#C81329"];

function row(val) {
  return {
    year: +val.year, // convert "Year" column to number 
	primary_type: val.primary_type,
	community_area: +val.community_area,
	count: +val.count
	}; 
}

//Gets called when the page is loaded.
function init(){
	
  // Creating an SVG and setting its width and height attributes. 
  // Appending a g element and transforming it based on the margins.	
  chart = d3.select("#vis").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Setting the new height and width for the visualization by removing the margins.		
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  xScale = d3.scaleBand()
             .rangeRound([0, width])
             .padding(0.1);

  yScale = d3.scaleLinear()
             .range([height, 0]);

  xAxis = d3.axisBottom(xScale);

  yAxis = d3.axisRight(yScale).ticks(6);
  
}

//Called when the update button is clicked
function updateClicked(){
  d3.csv('data/YearlyAreaCrime.csv',row,update);
}

//Callback for when data is loaded
function update(rawdata){

  // Using the nesting functionality, we group the data based on the selected option on the X axis.
  // Then we aggregate the data in each group by summing up the property selected on the Y axis.
  var chosenData = d3.nest().key(function(d){
	                          return d['year'];
                          }).rollup(function(leaves) {
                              return d3.sum(leaves, function(d) {
								  if(d['community_area'] == getXSelectedOption() && d['primary_type'] == getYSelectedOption()) {
                                return d['count'];
								  }
								  else {
									  return 0;
								  }
                              });
                          }).entries(rawdata);
 
  xScale.domain(chosenData.map(function(d) { return d.key; }));
  yScale.domain([0, d3.max(chosenData, function(d) { return d.value; })]);
  
  // Before adding the axes and the bars, we remove the old axes and the old bars.
  chart.select(".x").remove();
  chart.select(".y").remove();
  chart.selectAll(".bar").remove();

  chart.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

  chart.append("g")
       .attr("class", "y axis")
       .attr("transform", "translate(" + width + ",0)")
       .call(yAxis);


  chart.selectAll(".bar")
       .data(chosenData)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", function(d) { return xScale(d.key); })
       .attr("y", function(d) { return yScale(d.value); })
       .attr("height", function(d) { return height - yScale(d.value); })
       .attr("width", xScale.bandwidth())
	   .attr("fill",function(d,i){
		 return colors[i];
	   });

}

// Returns the selected option in the X-axis dropdown. Use d[getXSelectedOption()] to retrieve value instead of d.getXSelectedOption()
function getXSelectedOption(){
  var node = d3.select('#xdropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}

// Returns the selected option in the X-axis dropdown. 
function getYSelectedOption(){
  var node = d3.select('#ydropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}
