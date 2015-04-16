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
 * AgeVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
AgeVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    this.bar_height = 10;

    // TODO: define all constants here
    this.margin = {top: 20, right: 20, bottom: 30, left: 0},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
AgeVis.prototype.initVis = function(){

    var that = this; // read about the this

    //TODO: construct or select SVG
    //TODO: create axis and scales

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width/1.5))             
        .attr("y", 0 - (this.margin.top/3))
        .style("color", "red")
        .text("Age Distribution");

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width-80]);

    this.y = d3.scale.linear()
      .range([ 0, this.height]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .ticks(2);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")

    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d) {return that.x(d) })
      .y0(this.height)
      .y1(function(d, i) { return that.y(i); });
    
    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(80," + this.height + ")")
    .append("text")
        .attr("x", 150)
        .attr("dy", "-0.5em")
        .style("text-anchor", "end")
        .text("Frequency");

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(80,0)")

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
AgeVis.prototype.wrangleData= function(_filterFunction, start, end){
    
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
AgeVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};


    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs

    var that = this;
    // TODO: implement update graphs (D3: update, enter, exit)
    this.x.domain(d3.extent(this.displayData, function(d,i) { return d; }));
    
    this.y.domain(d3.extent(this.displayData, function(d,i) { return i; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // updates graph

    /*  if we had wanted to use area instead

    var path = this.svg.selectAll(".area")
      .data([this.displayData])

    path.enter()
      .append("path")
      .attr("class", "area");

    path.transition(3000)
      .attr("d", this.area);

    path.exit()
      .remove();*/

    var rect = this.svg.selectAll(".rect")
        .data(this.displayData);
    rect.enter()
        .append("rect")
        .attr("class", "rect");
    rect.transition(3000)
        .attr("width", function(d) { return that.x(d);})
        .attr("height", that.height/100)
        .attr("x", 80)
        .attr("y", function(d, i) { return (that.height/100)*i; })
        .attr("fill", "#7eabf7")

    rect.exit().remove();
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
AgeVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){
    
    // TODO: call wrangle function
    this.wrangleData(filterdates, selectionStart, selectionEnd);
    this.updateVis();
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
AgeVis.prototype.filterAndAggregate = function(_filter, start, end){
    
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
    var res = d3.range(100).map(function () {
        return 0;
    });

    // accumulate all values that fulfill the filter criterion
    // TODO: implement the function that filters the data and sums the values

    var filtered = this.data.filter(function(d, i) {
        return (d.time >= start && d.time <= end);
    });

    filtered.forEach(function(d, i) { d.ages.map(function(dd, j) {
        res[j] = res[j] + dd;
        });
    });
    
    return res;
}