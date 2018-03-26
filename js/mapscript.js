var width1 = 425;
var height1 = 425;

var summary_data, police_summary_data;
var svg;
var g, g2, glegend;
var albersProjection;

function initialize() { //the first function called once the html is loaded
    setMap();
    init();
    initArrestTrend();
	initUnemp();
};

function setMap() { //set choropleth map parameters  
    svg = d3.select("#map_container")
        .append("svg")
        .attr("width", width1)
        .attr("height", height1);

    g = svg.append("g");
    g2 = svg.append("g");
    glegend = svg.append("g");

    albersProjection = d3.geoAlbers()
        .scale(55000)
        .rotate([87.647046, 0])
        .center([0, 41.8])
        .translate([width1 / 1.5, height1 / 1.75]);

    var geoPath = d3.geoPath()
        .projection(albersProjection);

    d3.queue() //use queue.js to parallelize asynchronous data loading for cpu efficiency
        .defer(d3.csv, "data/YearlyAreaCrime.csv") //load attributes data from csv
        .defer(d3.csv, "data/Police_Stations.csv") //load geometry from police station csv
        .defer(d3.csv, "data/PoliceDistrictData.csv") //load police crime data
        .defer(d3.csv, "data/WeeklyData.csv") //load weekly crime data
        .defer(d3.csv, "data/MonthlyData.csv") //load monthly crime data
        .defer(d3.csv, "data/HourlyData.csv") //load hourly crime data
        .defer(d3.csv, "data/DailyData.csv") //load daily crime data
        .defer(d3.json, "data/chicago_boundries_map.geojson")
        .defer(d3.json, "data/Police_Districts.geojson")
        .await(callback);

    function callback(error, rawdata, stations, policecrime, weeklydata,monthlydata,hourlydata,dailydata, chicagoboundries, districts) {

        csvData = rawdata;
        police_csvData = policecrime;
        month_csvData = monthlydata;
        week_csvData = weeklydata;
        hour_csvData = hourlydata;
        daily_csvData= dailydata;

        summary_data = d3.nest()
            .key(function(d) {
                return d["community_area"];
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g["count"];
                });
            }).object(csvData);

        police_summary_data = d3.nest()
            .key(function(d) {
                return d["district"];
            })
            .rollup(function(d) {
                return d3.sum(d, function(g) {
                    return g["count"];
                });
            }).object(police_csvData);

        var color = colorScale(summary_data);

        var communities = g.selectAll(".community")
            .data(chicagoboundries.features)
            .enter()
            .append("path")
            .attr("class", "community")
            .attr("id", function(d) {
                return "community"+d.properties.area_numbe;
            })
            .attr("value", function(d) {
                return d.properties.community;
            })
            .attr("fill", function(d) {
                return choropleth(d, color);
            })
            .attr("d", geoPath)
            .on("click", function(d) {
                clickCommunity(d);
            })
            .on("mouseover", function(d) {
                highlight(d);
            })
            .on("mouseout", function(d, i) {
                dehighlight(d);
            })
            .on("mousemove", function(d) {
                moveTooltip(d);
            });


        var policearea = g2.selectAll(".districts")
            .data(districts.features)
            .enter()
            .append("path")
            .attr("class", "district hidden")
            .attr("id", function(d) {
                return "police" + d.properties.dist_num;
            })
            .attr("d", geoPath);

        stations.forEach(function(i) {
            addpoint(i.LATITUDE, i.LONGITUDE, i);
        });


        updateColourScale();
        //console.log(JSON.stringify(summary_data));
        //console.log(JSON.stringify(police_summary_data));

      createTimeLine();
      createCommunityDropDown(chicagoboundries.features);
      update(csvData);
    };
};

function createCommunityDropDown(communities) {
    var select = document.getElementById("communitiesdropdown");
    communities.forEach(function(community){
        var option = document.createElement('option');
        option.text = community.properties.community;
        option.value = community.properties.area_numbe;
        option.id = "dropdown" + community.properties.area_numbe;
        select.add(option, 0);
    })
    var option = document.createElement('option');
    option.text = "All";
    option.value = "0";
    option.id = "dropdown" + "All";
    select.add(option, 0);

    //Function to sort values in dropdown using jQuery
    $("#communitiesdropdown").html($("#communitiesdropdown option").sort(function (a, b) {
        return a.value == b.value ? 0 : a.value < b.value ? -1 : 1
    }));

    select.selectedIndex = 0;        
}

function createTimeLine() {

    var svg = d3.select("#timeline"),
        margin = {
            top: 2,
            right: 2,
            bottom: 2,
            left: 20
        },
        width = 450,
        height = 20,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]).domain([2007, 2016]);

    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("end", brushmoved);

    g.append("g")
        .attr("class", "axis axis--x axisRed")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10, "d"));

    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush);

    var handle = gBrush.selectAll(".handle--custom")
        .data([{
            type: "w"
        }, {
            type: "e"
        }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("fill", "#666")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("cursor", "ew-resize");

    gBrush.call(brush.move, [2007, 2016].map(x));

    function brushmoved() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        var s = d3.event.selection;
        if (s == null) {
            // handle.attr("display", "none");
            return;
        } else {
            var d0 = s.map(x.invert);
            var d1 = d0.map(d3.format("d"));
            if (d1[0] >= d1[1]) {
                d1[0] = Math.floor(d0[0]);
                // d1[1] = d3.timeDay.offset(d1[0]);
                d1[1] = Math.floor(d0[1]);
            }
            if(d1[0] == d1[1]) d1[1]=d1[1]+0.01;
                d3.select(this).transition().call(d3.event.target.move, d1.map(x));
            // handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + height / 2 + ")"; });
            lowerYear = d1[0];
            upperYear = d1[1];
            changeAttribute(getCrimesArray());
        }
    }
};

function getCrimeCount(CrimesArray, g){
        var temp = "0";
        if (CrimesArray.length > 0) {
            CrimesArray.forEach(function(crime) {
                if (g["primary_type"] == crime)
                    temp = g["count"];
                else if (crime == "others") {
                    if( (g["primary_type"] != "08A") && (g["primary_type"] != "03") &&(g["primary_type"] != "01A") &&(g["primary_type"] != "09") &&(g["primary_type"] != "06") &&(g["primary_type"] != "07") &&(g["primary_type"] != "05") &&(g["primary_type"] != "16") &&(g["primary_type"] != "02") &&(g["primary_type"] != "17") ) {
                        temp = g["count"];
                    }
                }
            });
            return temp;
        } else {
			return g["count"];
		}
}

function changeAttribute(crimes) {
	updateClicked(crimes);
	updateArrestViz(crimes);
	updateCalendar(crimes);
	
	var filter_summary_data = csvData.filter(function(d){
        return (d.year>=lowerYear && d.year<=upperYear) ? true : false;
	});
	
	var filter_police_summary_data = police_csvData.filter(function(d){
        return (d.year>=lowerYear && d.year<=upperYear) ? true : false;
	});
	
	
    summary_data = d3.nest()
        .key(function(d) {
            return d["community_area"];
        })
        .rollup(function(d) {
            return d3.sum(d, function(g) {
                return getCrimeCount(crimes, g);
            });
        }).object(filter_summary_data);

    police_summary_data = d3.nest()
        .key(function(d) {
            return d["district"];
        })
        .rollup(function(d) {
            return d3.sum(d, function(g) {
               return getCrimeCount(crimes, g);
            });
        }).object(filter_police_summary_data);

    //console.log(JSON.stringify(summary_data));
    //console.log(JSON.stringify(police_summary_data));

    var color = colorScale(summary_data);

    //recolor the map
    d3.selectAll(".community") //select every region
        .style("fill", function(d) { //color enumeration units
            return choropleth(d, color); //->
        });

    updateColourScale();

};


function highlight(data) {

    var prop = data.properties;
    var labelAttribute = "<b>Community: " + "</b>" + prop.community + "<br /><b>Crimes: " +
        summary_data[prop.area_numbe] + "</b></style>"; //label content

    var mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
    });

    var tooltip = d3.select("#map_container").append("div").attr("id", "tooltip" + prop.area_numbe).attr("class", "tooltip");

    tooltip.style("left", (d3.event.pageX + 30) + "px") //reposition label horizontal
        .style("top", (d3.event.pageY - 50) + "px") //reposition label vertical
        .html(labelAttribute);
};

function dehighlight(data) {
    d3.select("#tooltip" + data.properties.area_numbe).remove();
};

function moveTooltip(data) {
    var mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
    });
    d3.select("#tooltip" + data.properties.area_numbe).style("left", (d3.event.pageX + 30) + "px") //reposition label horizontal
        .style("top", (d3.event.pageY - 0) + "px") //reposition label vertical;
};

function clickCommunity(d) {
    d3.select(".selected").classed("selected", false);
    d3.select("#community"+d.properties.area_numbe).classed("selected", true);
    console.log("clicked " + d.properties.area_numbe);
    var element = document.getElementById("communitiesdropdown");

    element.value = d.properties.area_numbe;
    selectedCommunity = d.properties.area_numbe;
	var crimes = getCrimesArray();
    updateClicked(crimes);
	updateArrestViz(crimes);
	updateCalendar(crimes);
};

function getTotalCrime(d, data) {
    return data[d.properties.area_numbe];
};


function colorScale(data) {
    var maxdata = getMax(data);
    var mindata = getMin(data);

    var color = d3.scaleSqrt()
        // .base(10)
        .domain([mindata, maxdata])
        .range([d3.rgb("#ffffb2"), d3.rgb('#b10026')]);
    // var color = d3.scaleLinear().domain([mindata, maxdata])
    //     .interpolate(d3.interpolateHcl)
    //     // .range("#ffffb2","#fed976","#feb24c","#fd8d3c", "#fc4e2a", "#e31a1c","#b10026");
    //     .range([d3.rgb("#ffffb2"), d3.rgb('#b10026')]);

    return color;
};

function getMax(data) {
    return d3.max(d3.values(data));
};

function getMin(data) {
    return d3.min(d3.values(data));
};

function choropleth(d, recolorMap) {

    //get data value
    var value = getTotalCrime(d, summary_data);
    //if value exists, assign it a color; otherwise assign gray
    if (value) {
        return recolorMap(value); //recolorMap holds the colorScale generator
    } else {
        return "#ccc";
    };
};

function addpoint(lon, lat, policestation) {

    var gpoint = g2.append("g").attr("class", "gpoint");
    var x = albersProjection([lat, lon])[0];
    var y = albersProjection([lat, lon])[1];

    // gpoint.append("svg:circle")
    // .attr("cx", x)
    // .attr("cy", y)
    // .attr("class","point")
    // .attr("r", 1.5);

    gpoint.append("svg:image")
        .attr("x", x)
        .attr("y", y)
        .attr("xlink:href", "images/ic_police_station.png")
        .attr("width", "20")
        .attr("height", "20")
        .attr("class", "grow")
        .on("mouseover", function(d) {
            var tooltip = d3.select("#map_container").append("div").attr("id", "district" + policestation.DISTRICT).attr("class", "tooltip");
            d3.select("#police" + policestation.DISTRICT).classed("hidden", false);
        })
        .on("mouseout", function(d, i) {
            d3.select("#district" + policestation.DISTRICT).remove();
            d3.select("#police" + policestation.DISTRICT).classed("hidden", true);
        })
        .on("mousemove", function(d, i) {
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });

            var labelAttribute = "<b>Police District: " + "</b>" + policestation.DISTRICT_NAME + "<br /><b>Crimes: " +
                police_summary_data[policestation.DISTRICT] + "</b></style>"; //label content

            d3.select("#district" + policestation.DISTRICT)
                .attr("style", "left:" + (d3.event.pageX + 10) + "px;top:" + (d3.event.pageY + 10) + "px")
                .html(labelAttribute);

        });
};


// update the colour scale, restyle the plot points and legend
function updateColourScale() {

    d3.select("#gradient").remove();
    d3.select("#gradientTick").remove();

    var legend = glegend.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#b10026")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffffb2")
        .attr("stop-opacity", 1);

    var w = 20;
    var h = 230;

    glegend.append("rect")
        .attr("width", 30)
        .attr("height", 150)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(" + w + ", " + h + ")");

    var min = getMin(summary_data);
    var max = getMax(summary_data);

    var y = d3.scaleSqrt().range([150, 0])
        .domain([min, max]);


    var yAxis = d3.axisRight().scale(y).ticks(4 , "s").tickValues([min, (min + max) / 3, (min + max) * 2 / 3, max]);

    glegend.append("g")
        .attr("id", "gradientTick")
        .attr("class", "y axis axisRed")
        .attr("transform", "translate(" + (w + 30) + ", " + h + ")")
        .call(yAxis)
        .append("text")
        .attr("y", w-35)
        .attr("x", 0)
        .style("text-anchor", "middle")
        .text("Total Crimes");
}