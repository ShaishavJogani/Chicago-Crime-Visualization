var chart;
var xScale,yScale,xAxis,yAxis,nxScale,nxAxis;
var height = 330;
var width = 510;
var margin = {top: 10, right: 10, bottom: 70, left: 60};
var colors=["#FC4A1A","#F27914","#35B430","#C81329"];
var lowYr=lowerYear,highyr=upperYear,crimeList;
var frequencyXlabels = ["Year","Week","Month","Hour"];

var selectedCommunity=0;;

var weekdays=["","Mon","Tue","Wed", "Thu", "Fri", "Sat", "Sun"];
var months=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct", "Nov","Dec"];

var hour3=["12-3AM","3-6AM","6-9AM","9-12PM","12-3PM","3-6PM","6-9PM","9-12AM"];
var hour4=["12-4AM","4-8AM","8-12PM","12-4PM","4-8PM","8-12AM"];
var hour2=["12-2AM","2-4AM","4-6AM","6-8AM","8-10AM","10-12PM","12-2PM","2-4PM","4-6PM","6-8PM","8-10PM","10-12AM"];
var hour6=["12-6AM","6-12PM","12-6PM","6-12AM"];

  var type ;
  var group = 3;

function mapToLabel(key) {
	if(type == 0 || type == 5)
		return key;
	if(type == 1) {
		var index = +key;
		return weekdays[index];
	}
	if(type == 2) {
		var index = +key;
		return months[index];
	}
	if(type == 3) {
		var index = +key;
		if(group == 3)
		return hour3[index];
		else if (group ==4)
		return hour4[index];
		else if (group ==2)
		return hour2[index];
		else if (group ==6)
		return hour6[index];
	}
		if(type == 4) {
		return +key;
	}
	
}

function row(val) {
  return {
    year: +val.year, // convert "Year" column to number 
	primary_type: val.primary_type,
	community_area: +val.community_area,
	count: +val.count,
	weekday: +val.weekday,
	month:+val.month,
	hour:+val.hour,
	day:+val.day,
	arrest:+val.arrest
	}; 
}

//Gets called when the page is loaded.
function init(){
group = 3;
//	initialize();
	//	selectedCommunity = getXSelectedOption();
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

  yAxis = d3.axisLeft(yScale).ticks(6,"s");
  
    nxScale = d3.scaleLinear()
             .range([0, width]);
  
  nxAxis = d3.axisBottom(nxScale).ticks(12);
  
  crimeList = getCrimesArray();
  
 // updateClicked(crimeList);
}

function updateFrequency() {
group = getGroupSelectedOption();
type = getTypeSelectedOption();
	if(type == 3) {
	$('#'+'groupdropdown')[0].style.visibility="visible";
	}
	else {
	$('#'+'groupdropdown')[0].style.visibility="hidden";
	}
	updateClicked(crimeList)
}

function updateClicked(crimes){
	
	crimeList = crimes;
	
	type = getTypeSelectedOption();
	if(type == 0){
  // d3.csv('data/YearlyAreaCrime.csv',row,update);
  update(csvData);
}
if(type == 1){
  // d3.csv('data/WeeklyData.csv',row,update);
  update(week_csvData);
}
if(type == 2){
  // d3.csv('data/MonthlyData.csv',row,update);
  update(month_csvData);
}
if(type == 3){
  // d3.csv('data/HourlyData.csv',row,update);
  update(hour_csvData);
}
if(type == 4){
  // d3.csv('data/DailyData.csv',row,update);
  update(daily_csvData);
}

	
}

//Callback for when data is loaded
function update(rawdata){

//	rawdata = rawdata.filter(function(d){
  //      return (d.year>=2009 && d.year<2015) ? true : false;
    //});
  // Using the nesting functionality, we group the data based on the selected option on the X axis.
  // Then we aggregate the data in each group by summing up the property selected on the Y axis.
  var chosenData;
  
  	var filterData = rawdata.filter(function(d){
        return (d.year>=lowerYear && d.year<=upperYear) ? true : false;
	});
	
	if(selectedCommunity != 0) {
	filterData = filterData.filter(function(d){
        return (d.community_area == selectedCommunity) ? true : false;
	});
	}
  
  var tool_tip = d3.tip()
      .attr("class", "tooltip")
      .offset([-8, 0])
      .html(function(d) { return "Crime Count: " + d.value; });
    chart.call(tool_tip);

    type = getTypeSelectedOption();
  
  if(type ==0) {
  
  chosenData = d3.nest().key(function(d){
	                          return d['year'];
                          }).rollup(function(leaves) {
                              return d3.sum(leaves, function(d) {
								 return getCrimeCount(crimeList,d);
                              });
                          }).entries(filterData);
						  
  }
  
  if (type == 1) {
  
    chosenData = d3.nest().key(function(d){
	                          return d['weekday'];
                          }).rollup(function(leaves) {
                              return d3.sum(leaves, function(d) {
								 return getCrimeCount(crimeList,d);
                              });
                          }).entries(filterData);
  
  }
  
    if (type == 2) {
  
    chosenData = d3.nest().key(function(d){
	                          return d['month'];
                          }).rollup(function(leaves) {
                             return d3.sum(leaves, function(d) {
								 return getCrimeCount(crimeList,d);
                              });
                          }).entries(filterData);
  
  }
  
      if (type == 3) {
  
    chosenData = d3.nest().key(function(d){
	                          return Math.floor(d['hour']/group);
                          }).rollup(function(leaves) {
                              return d3.sum(leaves, function(d) {
								 return getCrimeCount(crimeList,d);
                              });
                          }).entries(filterData);
  
  }
  
  if (type == 4) {
  
    chosenData = d3.nest().key(function(d){
	                          return d['day'];
                          }).rollup(function(leaves) {
                             return d3.sum(leaves, function(d) {
								 return getCrimeCount(crimeList,d);
                              });
                          }).entries(filterData);
  
  }

 
  xScale.domain(chosenData.map(function(d) { return mapToLabel(d.key); }));
  yScale.domain([0, d3.max(chosenData, function(d) { return d.value; })]);
  nxScale.domain([0,370]);
  
  // Before adding the axes and the bars, we remove the old axes and the old bars.
  chart.select(".axisRed").remove();
  chart.select(".axisRed").remove();
  chart.selectAll(".bar").remove();


if (type == 3 && (group ==2 || group ==3)) {
  chart.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(0," + height + ")")
       .call(type != 4 ? xAxis : nxAxis).selectAll("text")	 
		.style("text-anchor", "end")
        .attr("transform", "rotate(-65)")
       .append("text")
       .attr("id","frequencyAxisX")
       .attr("transform", "translate("+ (-45) +","+(-height/2)+")rotate(-90)")
       .style("text-anchor", "middle")
       .text("Total Crimes");

  chart.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(" + 0 + ",0)")
       .call(yAxis)
       .append("text")
       .attr("id","frequencyAxisY")
       .attr("transform", "translate("+ (width/2) +","+(height+65)+")")
       .style("text-anchor", "middle")
       .text(frequencyXlabels[document.getElementById('typedropdown').options[document.getElementById('typedropdown').selectedIndex].value]);
} else {
  chart.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(0," + height + ")")
       .call(type != 4 ? xAxis : nxAxis)
       .append("text")
       .attr("id","frequencyAxisX")
       .attr("transform", "translate("+ (-45) +","+(-height/2)+")rotate(-90)")
       .style("text-anchor", "middle")
       .text("Total Crimes");

  chart.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(" + 0 + ",0)")
       .call(yAxis)
       .append("text")
       .attr("id","frequencyAxisY")
       .attr("transform", "translate("+ (width/2) +","+(height+45)+")")
       .style("text-anchor", "middle")
       .text(frequencyXlabels[document.getElementById('typedropdown').options[document.getElementById('typedropdown').selectedIndex].value]);
}

  




  chart.selectAll(".bar")
       .data(chosenData)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", function(d) { return type != 4 ? xScale(mapToLabel(d.key)): nxScale(mapToLabel(d.key)) ; })
       .attr("y", function(d) { return yScale(d.value); })
       .attr("height", function(d) { return height - yScale(d.value); })
       .attr("width", xScale.bandwidth())
	   .attr("fill",function(d,i){
		 return colors[0];
	   })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);;

}

// Returns the selected option in the X-axis dropdown. Use d[getXSelectedOption()] to retrieve value instead of d.getXSelectedOption()
function getXSelectedOption(){
  var node = d3.select('#communitiesdropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}

function getTypeSelectedOption(){
  var node = d3.select('#typedropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}

function getGroupSelectedOption(){
  var node = d3.select('#groupdropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}

function changeCommFromSel(sel) {
selectedCommunity = sel.value;
d3.select(".selected").classed("selected", false);
d3.select("#community"+sel.value).classed("selected", true);
updateClicked(crimeList);
updateCalendar(crimeList);
}




