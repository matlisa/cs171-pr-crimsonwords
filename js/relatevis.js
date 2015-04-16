/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * PrioVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
PrioVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    // TODO: define all constants here
    this.margin = {top: 20, right: 20, bottom: 30, left: 0},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
PrioVis.prototype.initVis = function(){

    var that = this;

    //TODO: construct or select SVG
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width/2)+50)             
        .attr("y", 0 - (this.margin.top/3))
        .style("color", "red")
        .text("Priority Distribution");

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width-100]);

    this.y = d3.scale.linear()
      .range([this.height/2, 0])


    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(15)
      .tickFormat(function(d) {
      	if (d > 1) {
      	return that.metaData["priorities"][d-2]["item-title"]};})
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    this.tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .style("opacity", 0)

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(100," + this.height/2 + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(100,0)")

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis("default");
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
PrioVis.prototype.wrangleData= function(_filterFunction, start, end){
    
    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction, start, end);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
PrioVis.prototype.updateVis = function(view){
    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};

    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs

    var that = this;
    var partial_tot = this.displayData.total;
    var total = this.displayData.alltot;
    var partial_data = this.displayData.prio;
    var all_data = this.displayData.allp;
    var partial_days = this.displayData.days;
    var all_days = this.displayData.alldays;
   
    // TODO: implement update graphs (D3: update, enter, exit)
    
    this.x.domain([1, 17])

	if (view == "prop") {
		this.y.domain([0.01, 0.13]);
	}
	else if (view == "counts") {
		this.y.domain([0, d3.max(partial_data, function(d, i) { 
			if ((d/partial_days) >= (all_data[i]/all_days)) {
				return d/partial_days; }
			else return all_data[i]/all_days;})])
	}
	else {
		this.y.domain([d3.min(this.displayData.prio, function(d) { return d; })-20000,
		d3.max(this.displayData.allp, function(d) { return d; })]);
	}

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "translate(-10, 0)" + "rotate(-45)" 
                });

    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.svg
    	//.select(".d3-tip")
    	.call(this.tip);

    // updates graph
    var background = this.svg.selectAll(".background")
        .data(this.displayData.allp);
    background.enter()
        .append("rect")
        .attr("class", "background");
    background.transition(3000)
        .attr("width", (that.width-100)/16)
        .attr("height", function(d) { 
        	if (view == "prop") {
        		return (d/total) ==0 || !d/total ? 
        			0 : (that.height/2-(that.y(d/total)));}
         	else if (view == "counts") {
        		return (d/total) ==0 || !d/all_days ? 
        			0 : (that.height/2-(that.y(d/all_days)));}
        	else return (that.height/2-that.y(d));
		})
        .attr("x", function(d, i) { return that.x(i+1)+100; })
        .attr("y", function(d) { 
        	if (view == "prop") {
        		return (d/total) ==0 || !d/total ? 0 : that.y(d/total);}
        	else if (view == "counts") {
        		return (d/all_days) ==0 || !d/all_days ? 0 : that.y(d/all_days);}
        	else return that.y(d);
       	})
        .attr("fill", function(d, i) { 
        	if (view == "prop") {
	        	var change = ((partial_data[i]/partial_tot)-(d/total))/(d/total);
	        	if (change >= 0) {
	        		return that.metaData["priorities"][i]["item-color"];}
	        	else return "#d3d3d3"
	        }
	        if (view == "counts") {
	        	var change = ((partial_data[i]/partial_days)-(d/all_days))/(d/all_days);
	        	if (change >= 0) {
	        		return that.metaData["priorities"][i]["item-color"];}
	        	else return "#d3d3d3"
	        }
	    	else return "#d3d3d3";

        })
        .style("opacity", 0.3)

    var rect = this.svg.selectAll(".rect")
        .data(this.displayData.prio);
    rect.enter()
        .append("rect")
        .attr("class", "rect");
    rect.transition(3000)
        .attr("width", (that.width-100)/16)
        .attr("height", function(d, i) { 
        	if (view == "prop") {
	        	return (d/partial_tot) ==0 || !d/partial_tot ? 
	        		0 : (that.height/2-(that.y(d/partial_tot)));}
	        else if (view == "counts") {
	        	return (d/partial_days) ==0 || !d/partial_days ? 
	        		0 : (that.height/2-(that.y(d/partial_days)));}
	        else return (that.height/2-that.y(d)); 
	     })
        .attr("x", function(d, i) { return that.x(i+1)+100; })
        .attr("y", function(d) {  
        	if (view == "prop") {
        		return (d/partial_tot) ==0 || !d/partial_tot ? 
        			0 : that.y(d/partial_tot);}
        	else if (view == "counts") {
        		return (d/partial_days) ==0 || !d/partial_days ? 
        			0 : that.y(d/partial_days);}
        	else return (that.y(d));
        	})
        .attr("fill", function(d, i) { 
        	if (view == "prop") {
        		var change = ((d/partial_tot)-(all_data[i]/total))/(all_data[i]/total);
	        	if (change >= 0) {
	        		return that.metaData["priorities"][i]["item-color"];}
	        	else return "#d3d3d3" }
	        else if (view == "counts") {
        		var change = ((d/partial_days)-(all_data[i]/all_days))/(all_data[i]/all_days);
	        	if (change >= 0) {
	        		return that.metaData["priorities"][i]["item-color"];}
	        	else return "#d3d3d3" }
        	else return that.metaData["priorities"][i]["item-color"];})
     	.style("opacity", function(){
     		if (view == "prop" || view == "counts") {return 0.5}
     		else return 1 
     	})


	this.tip
		.html(function(d, i) {
		  	if (view == "prop") {
				var change = ((d/partial_tot)-(all_data[i]/total))/(all_data[i]/total);
				change = d3.round(change*100, 1);
				return "<strong>" + "Change from Average Proportions" + "</strong> <span style='color:#8F8F8F'>" 
					+ change + "%</span>";}
			else if (view == "counts") {
				var change = ((d/partial_days)-(all_data[i]/all_days))/(all_data[i]/all_days);
				change = d3.round(change*100, 1);
				return "<strong>" + "Change from Average Daily Counts" + "</strong> <span style='color:#8F8F8F'>" 
					+ change + "%</span>";}
			else {
				var prop = d/total;
				prop = d3.round(prop*100, 3);
				return "<strong>" + "Percent of Total Votes" + "</strong> <span style='color:#8F8F8F'>" 
					+ prop + "%</span>";}			
		})

	rect
	    .on("mouseover", this.tip.show)        
      	.on("mouseout", this.tip.hide)

    rect.exit().remove();
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
PrioVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){
    
    // TODO: call wrangle function
    this.wrangleData(filterdates, selectionStart, selectionEnd);
	if (d3.select("input[value=\"prop\"]").node().checked) {
    	this.updateVis("prop");
	}
	else if (d3.select("input[value=\"counts\"]").node().checked) {
    	this.updateVis("counts");
	}
	else {this.updateVis("default");}

}


/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */



/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
PrioVis.prototype.filterAndAggregate = function(_filter, start, end){
    
    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}
    
    var that = this;

    // create an array of values for age 0-100
    var priorities = d3.range(16).map(function () {
        return 0;
    });

    var all_priorities = d3.range(16).map(function () {
        return 0;
    });

  	var all_days = this.data.length;


    this.data.forEach(function(d, i) { d.prios.map(function(dd, j) {
        all_priorities[j] = all_priorities[j] + dd;
        });
    });

    var filtered = this.data.filter(function(d, i) {
        return (d.time >= start && d.time <= end);
    });

    var days = filtered.length;

    filtered.forEach(function(d, i) { d.prios.map(function(dd, j) {
        priorities[j] = priorities[j] + dd;
        });
    });

    var total_count = d3.sum(priorities)
    var all_total = d3.sum(all_priorities)
    
    var data_final = {"prio":priorities, "days": days, "total":total_count, 
    "allp": all_priorities, "alldays": all_days, "alltot": all_total}

    return data_final;

}