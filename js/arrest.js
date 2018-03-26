
var data;
var xScale1,yScale1,xAxis1,yAxis1,chart1;
var crimeList1;
var height5 = 350;
var width5 = 510;

var labelKeys = ["08A","03","01A","09","06","07","05","16","02","17"];

  var labels = {
	"08A" : "Assault",
	"03" : "Robbery",
	"Others": "Others",
	"01A":"Homicide",
	"09":"Arson",
	"06": "Theft",
	"07":"Theft",
	"05":"Burglary",
	"16":"Prostitution",
	"02":"Sexual Abuse",
	"17":"Sexual Abuse"
  };
  

	
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
  
  
  function initArrestTrend() {

	chart1 = d3.select("#arrestTrend").append("svg")
            .attr("width", width5)
            .attr("height", height5)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  width5 = width5 - margin.left - margin.right;
  height5 = height5 - margin.top - margin.bottom;

 xScale1 = d3.scaleBand()
             .rangeRound([0, width5])
             .padding(0.1);

  yScale1 = d3.scaleLinear()
             .range([height5, 0]);

  xAxis1 = d3.axisBottom(xScale1);

  yAxis1 = d3.axisLeft(yScale1).ticks(6,"s");


  
  d3.csv('data/YearlyArrestData.csv' , row, function(rawdata) {
  
  data = rawdata;
  
  updateArrestViz(getCrimesArray());
   });
   }

function updateArrestViz(crimes) {   

crimeList1 = crimes;

var filterData = data.filter(function(d){
        return (d.year>=lowerYear && d.year<=upperYear) ? true : false;
	});
	
	if(selectedCommunity != 0) {
	filterData = filterData.filter(function(d){
        return (d.community_area == selectedCommunity) ? true : false;
	});
	}
	
var filterData1 = filterData;
	
        if (crimes.length > 0) {
	filterData1 = filterData.filter(function(g){
                var temp = false;
            crimes.forEach(function(crime) {
                if (g["primary_type"] == crime) {
                    temp = true;
					}
                else if (crime == "others") {
                    if( (g["primary_type"] != "08A") && (g["primary_type"] != "03") &&(g["primary_type"] != "01A") &&(g["primary_type"] != "09") &&(g["primary_type"] != "06") &&(g["primary_type"] != "07") &&(g["primary_type"] != "05") &&(g["primary_type"] != "16") &&(g["primary_type"] != "02") &&(g["primary_type"] != "17") ) {
                        temp = true;
                    }
                }
            });
            return temp;
	});
	}
	
	var chosenData;
	
	
	
	   
    chosenData = d3.nest().key(function(g){
							 if( (g["primary_type"] != "08A") && (g["primary_type"] != "03") &&(g["primary_type"] != "01A") &&(g["primary_type"] != "09") &&(g["primary_type"] != "06") &&(g["primary_type"] != "07") &&(g["primary_type"] != "05") &&(g["primary_type"] != "16") &&(g["primary_type"] != "02") &&(g["primary_type"] != "17") ) {
								return labels["Others"];
							} else {
								return labels[g["primary_type"]];
							}
                          })
						  .rollup(function(leaves) {
							var perc = getArrestPercent(leaves);
						  return {
						  
							y : perc,
								label : labelValue(leaves[0].primary_type),
								indexLabel: perc+ "%"
                             };
                          }).entries(filterData1);
						  
	var finalData=[];
						  
	chosenData.forEach(function(element) {
		finalData.push(element.value);
	});
  
        var chart = new CanvasJS.Chart("chartContainer3", {
			backgroundColor: "#000",
            
            animationEnabled: true,
            axisY: {
              title:"% Of Police Arrests",
              titleFontColor:"white",
              labelFontFamily: "Helvetica Neue",
              titleFontSize: 14,
              gridThickness: 0,
              tickThickness: 1,
              tickColor: "white",
              lineThickness: 1,
              labelFontColor: "white"			
            },
            axisX: {
              title:"Types of Crimes",
              titleFontSize: 16,
              titleFontFamily: "Helvetica Neue",        
              titleFontColor:"white",
              tickThickness: 1,
              lineThickness: 2,
              labelFontSize: 15,
              labelFontColor: "white",
              labelFontFamily: "Helvetica Neue"

            },
            data: [
            {
                
                

                indexLabelPlacement: "outside",
                indexLabelFontColor: "#FFF",
                indexLabelFontWeight: 700,
                indexLabelFontSize: 10,
                indexLabelFontFamily: "Verdana",
                color: "#FC4A1A",
                type: "bar",
				showInLegend: false,
        legendText: "Violent",
		legendMarkerColor:"#28A9BC",
                dataPoints: finalData
            },
			
			{
        type: "bar",
        showInLegend: false,
		legendMarkerColor:"#36C4D0",
        legendText: "Property",
        dataPoints: [
        

        ]
           },
			
		{
        type: "bar",
        showInLegend: false,
		legendMarkerColor:"#92DBC7",
        legendText: "Sexual crime",
        dataPoints: [
        

        ]
           },
			
			{
        type: "bar",
        showInLegend: false,
        legendText: "Other",
		legendMarkerColor:"#C6F0DA",
        dataPoints: [
        

        ]
           } 
       
	  	  
		
            ]
        });

        chart.render();

renderArrestTrend(filterData);
    }

function renderArrestTrend(filterData) {





 var tool_tip = d3.tip()
      .attr("class", "tooltip")
      .offset([-8, 0])
      .html(function(d) { return "Arrest %: " + d.value; });


    chart1.call(tool_tip);

    var chosenData = d3.nest().key(function(d){
	                          return d['year'];
                          }).sortKeys(d3.ascending)
						  .rollup(function(leaves) {
                             return getArrestPercent(leaves);
                          }).entries(filterData);
	

	 xScale1.domain(chosenData.map(function(d) { return d.key; }));
  yScale1.domain([0, d3.max(chosenData, function(d) { return d.value; })]);
  
  // Before adding the axes and the bars, we remove the old axes and the old bars.
  chart1.select(".axisRed").remove();
  chart1.select(".axisRed").remove();
  chart1.selectAll(".bar").remove();


  chart1.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(0," + height5 + ")")
       .call(xAxis1)
       .append("text")
       .attr("id","frequencyAxisX")
       .attr("transform", "translate("+ (-45) +","+(-height5/2)+")rotate(-90)")
       .style("text-anchor", "middle")
       .text("% of arrest");

  


  chart1.append("g")
       .attr("class", "axisRed")
       .attr("transform", "translate(" + 0 + ",0)")
       .call(yAxis1)
       .append("text")
       .attr("id","frequencyAxisY")
       .attr("transform", "translate("+ (width5/2) +","+(height5+36)+")")
       .style("text-anchor", "middle")
       .text("Year");;


  chart1.selectAll(".bar")
       .data(chosenData)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", function(d) { return xScale1(d.key); })
       .attr("y", function(d) { return yScale1(d.value); })
       .attr("height", function(d) { return height5 - yScale1(d.value); })
       .attr("width", xScale1.bandwidth())
	   .attr("fill",function(d,i){
		 return colors[0];
	   })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);


}

function labelValue(type) {

	for (var key of labelKeys) {

		if(key == type) {
			return labels[type];
		}
	}
	return "Others";
}

function getArrestPercent(leaves) {

	var total = 0;
	var arrest = 0;
		leaves.forEach(function(g) {
        if (crimeList1.length > 0) {
            crimeList1.forEach(function(crime) {
                if (g["primary_type"] == crime) {
                    total+= g["count"];
					arrest+= g["arrest"];
				}
                else if (crime == "others") {
                    if( (g["primary_type"] != "08A") && (g["primary_type"] != "03") &&(g["primary_type"] != "01A") &&(g["primary_type"] != "09") &&(g["primary_type"] != "06") &&(g["primary_type"] != "07") &&(g["primary_type"] != "05") &&(g["primary_type"] != "16") &&(g["primary_type"] != "02") &&(g["primary_type"] != "17") ) {
                       total+= g["count"];
						arrest+= g["arrest"];
					}
                }
            });
        } else {
			total+= g["count"];
			arrest+= g["arrest"];
		}
		});
		return Math.round(100*(arrest/total));
}
