"use strict";

console.log("form.js starting");

addEventListener('load', start);

function start(){

	console.log("page loaded - starting");

	// FIRST FORM SUBMISSION
	var init_form = document.getElementById('num_deadlines');

	if (init_form.attachEvent) {
	    init_form.attachEvent("submit", createForm);
	} else {
	    init_form.addEventListener("submit", createForm);
	}

	// SECOND FORM SUBMISSION (listening to a div)
	var detail_form = document.getElementById('generated');

	if (detail_form.attachEvent) {
	    detail_form.attachEvent("submit", calcPriorities);
	} else {
	    detail_form.addEventListener("submit", calcPriorities);
	}

}

// Given the submitted DL details. Calc and visualise.
function calcPriorities(e){

	var raw = [];

	emptyNode('results');
	emptyNode('d3_graph');

	if (e.preventDefault) e.preventDefault();

	for (var i = 0; i < num_deadlines; i++) {
		var stats = calcDlStats(e, 0 + (i * 5));
		console.log(stats);
		raw.push(stats);
	};

	visualise(raw);

	return false;
}

function visualise(raw) {
	
	console.log("raw array:");
	console.log(raw);
	var length = raw.length;
	console.log(length);

	var data = [];

	// For each deadline in raw
	for(var index = 0; index < length; index++) {

		var datum = raw.pop();

		console.log("DATUM: ");
		console.log(datum);

		// Each data point has day, unit and hours
		for (var i = 0; i < datum.days; i++) {
			var item = {day: i.toString(), unit: datum.unit, hours: datum.hours};
			data.push(item);
		};
	}

	console.log("DATA ARRAY:");
	console.log(data);
	
	//----------------------------------------------------
 	var margin = {top: 20, right: 20, bottom: 30, left: 40},
   		width = 960 - margin.left - margin.right,
    	height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .1)
    	.domain(data.map(function(d) { return d.day; }));

    var barWidth = x.rangeBand() / num_deadlines;

    // Bar color: map unit names (domain) to colors (range):
    var color = d3.scale.ordinal()
    	.domain( data.map(function(d) { return d.unit; } ))
    	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var y = d3.scale.linear()
    	.range([height, 0])
    	.domain([0, d3.max(data, function(d) { return d.hours; })]);

    var x_offset = d3.scale.ordinal()
    	.domain(data.map(function(d){return d.unit; }))
    	.range([0, 1 * barWidth, 2 * barWidth, 3 * barWidth, 4 * barWidth, 5 * barWidth]);

	var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient("bottom");

    var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient("left");
    	
	var svg = d3.select("#d3_graph").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 	svg.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + height + ")")
      	.call(xAxis)
       .append("text")
        .attr("x", 460)
        .attr("y", 26)
        .style("text-anchor","end")
        .text("Day");

    svg.append("g")
      	.attr("class", "y axis")
      	.call(yAxis)
	  .append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", -20)
    	.attr("x", 15)
   		.attr("dy", ".71em")
    	.style("text-anchor", "end")
    	.text("Hours");

	var bar = svg.selectAll(".bar")
      .data(data);

    bar.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.day) + x_offset(d.unit); })
      .attr("y", function(d) { return y(d.hours); })
      .attr("height", function(d) { return height - y(d.hours); })
      .attr("width", barWidth)
      .style("fill", function(d) {return color(d.unit); });	  	

}


function type(d) {
  d.hours = +d.hours; // coerce to number
  return d;
}


// Calcuate the CP worth for an assignment
function calcDlStats(e, i) {

	var dl = new Object();
	var details = e.target.elements;

	// Raw info
	dl.unit = details.item(i).value;
	dl.date = details.item(i + 1).value;
	dl.percentage = details.item(i + 2).value;
	dl.credits = details.item(i + 3).value;
	dl.progress = details.item(i + 4).value;
	
	dl.worth = isWorth(dl.percentage, dl.credits);

	dl.daysLeft = daysLeft(dl.date);
	dl.hoursNeeded = (dl.worth * 10);  // Credit points x 10 hours
	
	// If some progress has been made already
	if (dl.progress != 0) {
		dl.hoursNeeded = dl.hoursNeeded * (1 - (dl.progress / 100));
	};

	dl.hoursPerDay = dl.hoursNeeded / dl.daysLeft;
	dl.hoursPerDay = dl.hoursPerDay.toFixed(1);
	dl.hoursNeeded = dl.hoursNeeded.toFixed(1);

	// Some output
	var result = document.createElement("p");

	BetterInnerHTML(result, dl.unit + " is worth " + dl.worth + "CP. You've got ~" + dl.hoursNeeded + " hours' work left to do."
	+ " There are " + dl.daysLeft + " days until the deadline."
	+ " That's " + dl.hoursPerDay + " hours/day.");

	var div = document.getElementById('results');
	div.appendChild(result);
	
	var stats = {unit: dl.unit, days: dl.daysLeft, hours: dl.hoursPerDay};
	return stats;
}

function isWorth(percentage, credits){
	return (percentage * credits)/100;
}

// How many days until the deadline
function daysLeft(date) {
	
	var today = new Date();

	// Handle the user picked deadline date
	var split = date.split("-");
	var dl_year = parseInt(split[0], 10);
	var dl_month = parseInt(split[1], 10);
	var dl_day = parseInt(split[2], 10);


	var day_ms = 24*60*60*1000;
	var dl = new Date(dl_year, dl_month-1, dl_day);
	dl.setUTCHours(0);
	dl.setUTCMinutes(1);
	today.setUTCHours(0);
	today.setUTCMinutes(1);

	var diffdays = 1 + Math.round( Math.abs( (dl.getTime() - today.getTime()) / day_ms ));
	console.log("diffdays: " + diffdays);

	return diffdays;
}

// Given a number of deadlines, create a new form to capture their details
function createForm(e) {
   

    if (e.preventDefault) e.preventDefault();

    // Clear anything generated on last submission
    emptyNode("generated");

    // Get the specified number of deadlines and make it GLOBAL
	window.num_deadlines = e.target.elements.item(0).value;
	console.log("Deadlines: " + num_deadlines);

	// Create a NEW form
	var form = document.createElement("form");
	form.setAttribute('method',"post");
	form.setAttribute('id', "dl_details");

	// Structure it around a table
	var table = document.createElement("table");
	table.setAttribute('class',"table");
	table.setAttribute('id',"dates_and_weights");

	// Setup table wireframe
	table = initTable(table);
	form.appendChild(table);

	// Generate the row
	for (var i = 0; i < num_deadlines; i++) {
		appendDeadlineRow(table);
	};

	var button = document.createElement("button");
	button.setAttribute('type',"submit");
	button.setAttribute('id',"submit_details");
	button.setAttribute('class',"btn btn-default")
	BetterInnerHTML(button, "Submit");

	// Put all the above inside a placeholder div
	form.appendChild(table);
	form.appendChild(button);
	document.getElementById('generated').appendChild(form);

    // return false to prevent the default form behavior
    return false;
}

// Clear all html within an element and remove children
function emptyNode(elementID){

	var node = document.getElementById(elementID);

	BetterInnerHTML(node, "");
	
	while (node.hasChildNodes()) {
    	node.removeChild(node.lastChild);
	}
}

// Really boring table generation/initialisation
function initTable(table){

	var caption = document.createElement("caption");
	var tbody = document.createElement("tbody");
	var topline = document.createElement("tr");
	var col1 = document.createElement("th");
	var col2 = document.createElement("th");
	var col3 = document.createElement("th");
	var col4 = document.createElement("th");
	var col5 = document.createElement("th");
	var heading1 = document.createElement("b");
	var heading2 = document.createElement("b");
	var heading3 = document.createElement("b");
	var heading4 = document.createElement("b");
	var heading5 = document.createElement("b");
	
	table.appendChild(caption);
	table.appendChild(tbody);
	tbody.appendChild(topline);
	topline.appendChild(col1);
	topline.appendChild(col2);
	topline.appendChild(col3);
	topline.appendChild(col4);
	topline.appendChild(col5);
	col1.appendChild(heading1);
	col2.appendChild(heading2);
	col3.appendChild(heading3);
	col4.appendChild(heading4);
	col5.appendChild(heading5);

	BetterInnerHTML(caption, "Enter the details below:");

	BetterInnerHTML(heading1, "Name");
	BetterInnerHTML(heading2, "Deadline");
	BetterInnerHTML(heading3, "Percentage of Unit");
	BetterInnerHTML(heading4, "Unit Credit Points");
	BetterInnerHTML(heading5, "Progress so far : %");

	return table;
}

function appendDeadlineRow(table){
	var row = document.createElement("tr");
	var col1 = document.createElement("td");
	var col2 = document.createElement("td");
	var col3 = document.createElement("td");
	var col4 = document.createElement("td");
	var col5 = document.createElement("td");

	var name = document.createElement("input");
	name.setAttribute('type',"text");
	name.setAttribute('name',"name");
	name.setAttribute('class',"form-control");
	name.setAttribute('value',"Deadline");

	var deadline = document.createElement("input");
	deadline.setAttribute('type', "date");
	deadline.setAttribute('name',"date");
	deadline.setAttribute('class',"form-control");
	deadline.setAttribute('value',"2015-04-01");

	var percentage = document.createElement("input");
	percentage.setAttribute('type', "number");
	percentage.setAttribute('name',"percentage");
	percentage.setAttribute('class',"form-control");
	percentage.setAttribute('value',50);

	var credits = document.createElement("input");
	credits.setAttribute('type', "number");
	credits.setAttribute('name',"credits");
	credits.setAttribute('class',"form-control");
	credits.setAttribute('value',10);

	var progress = document.createElement("input");
	progress.setAttribute('type', "number");
	progress.setAttribute('name',"progress");
	progress.setAttribute('class',"form-control");
	progress.setAttribute('value',0);

	col1.appendChild(name);
	col2.appendChild(deadline);
	col3.appendChild(percentage);
	col4.appendChild(credits);
	col5.appendChild(progress);

	table.appendChild(row);
	row.appendChild(col1);
	row.appendChild(col2);
	row.appendChild(col3);
	row.appendChild(col4);
	row.appendChild(col5);
}

// BetterInnerHTML v1.2, (C) OptimalWorks.net
function BetterInnerHTML(o,p,q){function r(a){var b;
	
	if(typeof DOMParser!="undefined")b=(new DOMParser()).parseFromString(a,"application/xml");
	else{var c=["MSXML2.DOMDocument","MSXML.DOMDocument","Microsoft.XMLDOM"];
	for(var i=0;
		i<c.length&&!b;
		i++){try{b=new ActiveXObject(c[i]);
		b.loadXML(a)}catch(e){}}}return b}function s(a,b,c){a[b]=function(){return eval(c)}}function t(b,c,d){if(typeof d=="undefined")d=1;
	if(d>1){if(c.nodeType==1){var e=document.createElement(c.nodeName);
		var f={};
		for(var a=0,g=c.attributes.length;
			a<g;
			a++){var h=c.attributes[a].name,k=c.attributes[a].value,l=(h.substr(0,2)=="on");
			if(l)f[h]=k;
		else{switch(h){case"class":e.className=k;
		break;
		case"for":e.htmlFor=k;
		break;
		default:e.setAttribute(h,k)}}}b=b.appendChild(e);
		for(l in f)s(b,l,f[l])}else if(c.nodeType==3){var m=(c.nodeValue?c.nodeValue:"");
			var n=m.replace(/^\s*|\s*$/g,"");
		if(n.length<7||(n.indexOf("<!--")!=0&&n.indexOf("-->")!=(n.length-3)))b.appendChild(document.createTextNode(m))}}for(var i=0,j=c.childNodes.length;
			i<j;
			i++)t(b,c.childNodes[i],d+1)}p="<root>"+p+"</root>";
		var u=r(p);
		if(o&&u){if(q!=false)while(o.lastChild)o.removeChild(o.lastChild);
			t(o,u.documentElement)}}