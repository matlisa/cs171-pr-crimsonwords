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
 * CountVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
CountVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.originalData = [];
    this.currentWord = ["education", "President", "Faust"];

    // TODO: define all "constants" here
    this.margin = {top: 20, right: 20, bottom: 30, left: 0},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountVis.prototype.initVis = function(){

    var that = this; // read about the this

    //TODO: implement here all things that don't change
    //TODO: implement here all things that need an initial status
    // Examples are:
    // - construct SVG layout
    // - create axis
    // -  implement brushing !!
    // --- ONLY FOR BONUS ---  implement zooming
    
    // TODO: modify this to append an svg element, not modify the current placeholder SVG element

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width / 2))             
        .attr("y", 0 - (this.margin.top/3))
        .style("color", "red")
        .text("Frequency of Words over Time");

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width-100]);

    this.xbrush = d3.scale.linear()
      .range([100, this.width]);

    this.y = d3.scale.pow()
      .range([this.height, 0])

    this.deform = d3.scale.pow()

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format(""))
      .ticks(7);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .ticks(6);


    this.valueline = d3.svg.line()
        .x(function(d, i) { return that.x(i + 1700); })
        .y(function(d) {return that.y(d.count); });

/*
    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) {return that.x(i + 1700); })
      .y0(this.height)
      .y1(function(d) {return that.y(d.count); });*/
    
    this.brush = d3.svg.brush()
      .on("brush", function(d) {
        $(that.eventHandler).trigger("selectionChanged", that.brush.extent());
        brushed(that.displayData, that.brush.extent());})

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(100," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(100,0)")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of articles, yearly")

    this.svg.append("g")
      .attr("class", "brush");

    //TODO: implement the slider -- see example at http://bl.ocks.org/mbostock/6452972
    this.addSlider(this.svg)

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis(that.displayData);
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    var that = this;
    this.displayData = this.data.filter(function(d){ return that.currentWord.indexOf(d.word) != -1});
    console.log(this.displayData)
    this.originalData = this.data;
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(){

    var that = this;
    // TODO: implement update graphs (D3: update, enter, exit)

    this.x.domain([1770, 2015]);
    this.xbrush.domain([1770, 2015]);

    //var max = [];
    var allcounts = d3.range(0, this.displayData.length).map(function(){return [];});
    this.displayData.forEach(
            function(d, j){ 
                d.inform.forEach(function(dd, i) {

                    allcounts[j][i] = dd.count;
                })
            })

    this.y.domain([0, d3.max(allcounts.map(function(d){return d3.max(d)}))])
                

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)
        .selectAll(".tick").each(function(data) {
            var tick = d3.select(this)
                .attr("transform", "translate(0," + that.y(that.deform(data)) + ")");
        });

    // updates graph

    var path = this.svg.selectAll(".line")
      //.data(this.displayData[0].inform)
      .data(this.displayData.map(function(d) {return d.inform}))
    console.log(path)
    
    path.enter()
      .append("path")
      .attr("class", "line")
      .attr("transform", "translate(100,0)");

    path.transition(3000)
      .attr("d", this.valueline);

    path.exit()
      .remove();
    
    this.brush.x(this.xbrush)
    
    this.svg.select(".brush")
        .call(this.brush)
      .selectAll("rect")
        .attr("height", this.height);
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CountVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function
    // do nothing -- no update when brushing
}


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */





/**
 * creates the y axis slider
 * @param svg -- the svg element
 */
CountVis.prototype.addSlider = function(svg){
    var that = this;

    // TODO: Think of what is domain and what is range for the y axis slider !!
    var sliderScale = d3.scale.linear().domain([0.01,0.99]).range([0, 200])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));
        var sliderValue = sliderScale.invert(value);

        // TODO: do something here to deform the y scale
        that.displayData = that.originalData;
        
        that.deform
            .domain(d3.extent(that.displayData, function(d) { return d.count; }))
            .range(d3.extent(that.displayData, function(d) { return d.count; }))
            .exponent(sliderValue)
        
        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })

        that.displayData = that.displayData.map(function(d, i) {
            return {count: that.deform(d.count), time: d.time};
        })

        that.updateVis();
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+0+","+30+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        y:0,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)

}

function brushed(data, extent) {
    var dateFormatter = d3.time.format("%Y.%m.%d");
 
    var filtered_data = filterdates(data, d3.round(extent[0]), d3.round(extent[1]));
    //var counts = aggregateCountsForRange(filtered_data);
    var div = document.getElementById('brushInfo');
    div.innerHTML = 
    "Time Interval: " + d3.round(extent[0])+ " to " + 
    d3.round(extent[1]) + ", First Word: " + filtered_data[0].word;
}