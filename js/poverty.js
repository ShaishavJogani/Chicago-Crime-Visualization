

	
	function updatePovViz(crimes) {


var filterData = socData.filter(function(g){
        if (crimes.length > 0) {
			var val = false;
            crimes.forEach(function(crime) {
                if (g["primary_type"] == crime)
                    val = true
                else if (crime == "others") {
                    if( (g["primary_type"] != "08A") && (g["primary_type"] != "03") &&(g["primary_type"] != "01A") &&(g["primary_type"] != "09") &&(g["primary_type"] != "06") &&(g["primary_type"] != "07") &&(g["primary_type"] != "05") &&(g["primary_type"] != "16") &&(g["primary_type"] != "02") &&(g["primary_type"] != "17") ) {
                        val = true;
                    }
                }
            });
            return val;
        } else {
			return true;
		}
	});
	
	var chosenData = d3.nest().key(function(d){
	                          return d['name'];
                          }).rollup(function(leaves) {
                             return {
								x : leaves[0].x,
								name : leaves[0].name,
								z : leaves[0].z,
								y: d3.sum(leaves, function(d) {
								 return d.y;
								})
							 };
                          }).entries(filterData);
						  
	var finalData=[];
						  
	chosenData.forEach(function(element) {
		finalData.push(element.value);
	});

		var chart = new CanvasJS.Chart("chartContainer2",
		{
			zoomEnabled: true,
                        animationEnabled: true,
			title:{
				text: "% Household Below Poverty Line VS Crimes and Population by Communities",  
				fontSize: 20,
				fontfamily: "Helvetica Neue",
				fontWeight: "normal",
				fontColor: "white"
			},

			backgroundColor: "#000",
			axisX: {
				title:"% Households Below Poverty Line",
				labelFontFamily: "Helvetica Neue",
				labelFontSize: 14,
				titleFontSize: 16,
				titleFontFamily: "Helvetica Neue",				
				labelFontColor:"white",
				titleFontColor:"white",
				valueFormatString: "#0'%'",
				maximum:80,
				minimum:-2,
				gridThickness: 1,
				tickThickness: 1,
				gridColor: "lightgrey",
				tickColor: "lightgrey",
				lineThickness: 2
			},
			axisY:{
				title: "Number of Crimes",   
				labelFontFamily: "Helvetica Neue",
				labelFontSize: 14,
				titleFontSize: 16,
				titleFontFamily: "Helvetica Neue",
				titleFontColor:"white",  
				labelFontColor:"white",         
				gridThickness: 1,
				tickThickness: 1,
				minimum:-10,
				gridColor: "lightgrey",
				tickColor: "lightgrey",
				lineThickness: 2,                
				valueFormatString: "#0''"

			},
           legend: {
                verticalAlign: "top",
				fontColor:"white"
            
            },
			data: [
			{        
			
			    showInLegend: true, 
             legendText: "Communities",
             legendMarkerColor: "LightSeaGreen",
              color: "LightSeaGreen",
			  markerBorderThickness: 1,
              markerBorderColor : "#16a085",
				type: "bubble",                   
              toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong>%below Poverty :</strong> {x}% <br/> <strong>No. of crimes :</strong> {y}<br/> <strong>Population : </strong> more than {z} thousand",
				dataPoints: finalData
			}
			]
		});

chart.render();
} 