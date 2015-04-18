/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure

topWordsVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.metaData = _metaData;
    this.displayData = [];
    this.tot_avg = 0


    // TODO: define all constants here
    this.margin = {top: 50, right: 50, bottom: 100, left: 200},
    this.width = 230,
    this.height = 1000 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
topWordsVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    this.timespan = (this.timespan||397)

    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
    this.svg.append("g")
        .append("text")
        .attr("class", "title")
        .text("Deviation from Overall Avg. Priority Vote Rate")
        .attr("x",75)
        .attr("y", 30)
    this.svg=this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");;

    // this.tip = d3.tip()
    //             .attr('class', 'd3-tip')
    //             .offset([-10, 0])
    //             .html(function(d,i) {
    //                 return "<div><strong>Deviation from Average:</strong> <span style='color:#6495ED'> " + d + "</span></div>"//<div><strong>Votes Casted:</strong> <span style='color:#6495ED'> " + d + "</span></div>";
    //             })
    // this.svg.call(this.tip)

    this.wrangleData(null);

    //TODO: create axis and scales
    this.y= d3.scale.ordinal()
      .rangeRoundBands([0, this.height],.1)

    this.x = d3.scale.linear()
      .range([30, this.width/2])



    this.yAxis = d3.svg.axis()
      // .scale(this.y)
      .ticks(6)
      .orient("left");





    this.x_axes = this.svg.append("g")
        .attr("class", "x axis")

    this.svg.append("g")
        .attr("class", "y axis")



    //filter, aggregate, modify data

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
topWordsVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};





}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
topWordsVis.prototype.updateVis = function(){
	that=this

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};

    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs

    this.y.domain(this.displayData.map(function(d,i){return d.word}))

    this.x
      .domain([this.displayData[this.displayData.length-1].sum, this.displayData[0].sum]);

    this.yAxis.scale(this.y)


    this.svg.select(".y.axis")
        .call(this.yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")


    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.rows = this.svg
                    .selectAll(".row")
                    .data(this.displayData)
    this.rects =this.rows.enter()
                    .append("g")
                    // .on("mouseover", function(d,i){that.tip.show(d,i)})
                    // .on("mouseout", function(d,i){that.tip.hide(d,i)});

                this.rects
                    .append("rect")
    this.rows.attr("class", "row")
        .attr("transform", "translate(20,0)")
    this.rows.exit().remove()

    this.rows.selectAll("rect")
      	.attr("fill", "blue")//function(d,i,j){return that.metaData["priorities"][j]["item-color"]}) 
      	.attr("height" , this.y.rangeBand())
        .attr("width" , function (d) {return that.x(d.sum)})
        .attr("y", function(d,i){return that.y(d.word)})
        .attr("x", function(d,i) { return 0})

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
topWordsVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function



    var filter = function (d,i){
        return i>=(d3.round(selectionStart)-1700) && i<=(d3.round(selectionEnd)-1700)
    };
var test = d3.range(315).map(function(d, i){return i})

    this.wrangleData(filter);

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
topWordsVis.prototype.filterAndAggregate = function(_filter){


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
    var res = d3.range(this.data.length).map(function () {
        return {word:"", sum:0};
    });

    // accumulate all values that fulfill the filter criterion
    // TODO: implement the function that filters the data and sums the values


    console.log(this.data[0].inform.filter(filter))
    this.data.map(function(d,i){
        res[i] = {word: d["word"], sum: d3.sum(d["inform"].filter(filter).map(function(dd){return dd.count}))}
        })

    res.sort(function(a,b){if (a.sum > b.sum){ return -1} else if (a.sum < b.sum){ return 1} else {return 0}})
    res.filter(function(d,i){return i<10})

    return res;

}

