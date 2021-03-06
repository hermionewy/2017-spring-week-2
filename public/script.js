//Set up a drawing environment
var m = {t:50,r:50,b:50,l:50},
	w = document.getElementById('plot1').clientWidth - m.l - m.r,
	h = document.getElementById('plot1').clientHeight - m.t - m.b;
var plots = d3.selectAll('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('class','canvas')
	.attr('transform','translate('+m.l+','+m.t+')');
var plot1 = plots.filter(function(d,i){ return i===0;}),
    plot2= plots.filter(function(d,i){ return i===1;}),
		plot3 = plots.filter(function(d,i){ return i===2;});

d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	// console.log(trips);
	// console.log(stations);

	//Exercise 1: Draw a histogram to study trip durations
	var MIN_DURATION =0,
			MAX_DURATION = 3600,
			DURATION_STEP = 300;
var histogramDuration = d3.histogram()
		.domain([MIN_DURATION,MAX_DURATION])
		.thresholds(d3.range(MIN_DURATION,MAX_DURATION,DURATION_STEP))
		.value(function(d){ return d.duration});

console.log(histogramDuration(trips));

// mining the data for max and min
var binDuration = histogramDuration(trips);
  var scaleX = d3.scaleLinear().domain([MIN_DURATION, MAX_DURATION]).range([0,w]),
	    scaleY = d3.scaleLinear().domain([0, d3.max( binDuration, function(d){ return d.length})]).range([h,0]);

//console.log(scaleX.domain(), scaleY.domain(), scaleX.range(), scaleY.range());

// Join bin data to
// plot1.selectAll('.bin')
// 		 .data(binDuration)
// 		 .enter()
// 		 .expend('rect')
// 		 .attr('class','bin')
// 		 .attr('x', function(d){ return scaleX(d.x0)})
// 		 .attr('y', function(d){ return scaleY(d.length)})
// 		 .attr('width', function(d){return scaleX(d.x1)- scaleX(d.x1)})
// 		 .attr('height', function(d){ return h-scaleY(d.length)});
//
// var axisX = d3.axisBottom()
// 		.scale(scaleX)
// 		.tickValues(d3.range(MIN_DURATION,MAX_DURATION,DURATION_STEP));


	//Exercise 2: Draw a time series to study the overall number of trips over time

	var T_START = new Date(2011,0,1), T_END = new Date(2013,11,31);
  var histogramTime = d3.histogram()
	    .domain([T_START, T_END])
			.value(function(d){ return d.startTime})
			.thresholds(d3.timeDay.range(T_START, T_END, 1));

// There's something wrong about it
	var binDays = histogramTime(trips);
	console.log(binDays);

//

// Draw line
	var line = d3.line()
			.x( function(d){ return scaleTime(d.x0)})
			//.x(function(d){ return scaleTime( new Date(d.x0.valueOf()+ d.x1.valueOf())/2)})
			.y(function(d){ return scaleTime(d.height)});

	plot2.append('path')
			 .attr('class','time-series time-series-line')
			 .datum(binDays);

	var area = d3.area()
			.x(function(d){ return d.x0})
			.y(function(d){ return d.length})

	plot2.insert('.path','time-series-line')
			 .attr('class','time-series time-series-line')
			 .attr('d',area);

	//Exercise 3: Average number of trips by time of the day?
}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}
