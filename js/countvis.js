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
    this.currentWord = [];
    this.selectword = "";

    // TODO: define all "constants" here
    this.margin = {top: 10, right: 10, bottom: 100, left: 40};
    this.margin2 = {top: 430, right: 10, bottom: 20, left: 40};
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.height2 = 500 - this.margin2.top - this.margin2.bottom;

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

    /*this.svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", this.width)
        .attr("height", this.height);*/



    this.focus = this.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        
    this.back = this.svg.append("g")
        .style("display", "none")

    this.back.append("circle")                                 // **********
        .attr("class", "y")   
        .attr("cx", 140)
        .attr("cy", 10)                          // **********
        .style("fill", "none")                             // **********
        .style("stroke", "blue")                           // **********
        .attr("r", 4)

    this.back.append("line")
        .attr("class", "tool")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", this.height)
        .attr("x1", 140)
        .attr("x2", 140);

    this.back.append("text")
        .attr("class", "y3")
        .attr("x", 140)
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    this.back.append("text")
        .attr("class", "y4")
        .attr("x", 140)
        .attr("dx", 8)
        .attr("dy", "1em");

    this.context = this.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");


    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width / 2))             
        .attr("y", 0 - (this.margin.top/3))
        .style("color", "red")
        .text("Frequency of Words over Time");

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width-100]);

    this.x2 = d3.scale.linear()
      .range([0, this.width-100]);

    this.xbrush = d3.scale.linear()
      .range([100, this.width]);

    this.y = d3.scale.linear()
      .range([this.height, 0])

    this.y2 = d3.scale.linear()
        .range([this.height2, 0]);

    this.deform = d3.scale.pow()

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format(""))
      .ticks(7);

    this.xAxis2 = d3.svg.axis()
        .scale(this.x2)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .ticks(6);


    this.valueline = d3.svg.line()
        .x(function(d, i) { return that.x(i + 1700); })
        .y(function(d) {return that.y(d.count); });

    this.valueline2 = d3.svg.line()
        .x(function(d, i) { return that.x2(i + 1700); })
        .y(function(d) {return that.y2(d.count); });

/*
    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) {return that.x(i + 1700); })
      .y0(this.height)
      .y1(function(d) {return that.y(d.count); });*/


        // Add axes visual elements
    this.focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(100," + this.height + ")")

    
    this.focus.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(100,0)")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of articles, yearly")

    this.focus.append("rect")   
        .attr("class", "background")                                  // **********
        .attr("width", this.width)                              // **********
        .attr("height", this.height)  
        .attr("transform", "translate(100,0)")                          // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")                    // **********


    this.context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(100," + this.height2 + ")")

    this.context.append("g")
        .attr("class", "brush");

    //TODO: implement the slider -- see example at http://bl.ocks.org/mbostock/6452972
    this.addSlider(this.svg)

    // filter, aggregate, modify data
    this.wrangleData();

    this.brush = d3.svg.brush()
      .x(this.x2)
      .on("brush", function(d) {

        //$(that.eventHandler).trigger("selectionChanged", that.brush.extent());
        that.brushed(that.displayData, that.brush.extent());})


    
    // call the update method
    this.updateVis(this.displayData);
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    var that = this;
    this.displayData = this.data.filter(function(d){ return that.currentWord.indexOf(d.word) != -1});

    this.originalData = this.displayData;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(newdata, extent){

    if (newdata) {
        this.displayData = newdata;
    }
    var that = this;
    // TODO: implement update graphs (D3: update, enter, exit)
    if (extent && extent[0] != extent[1]) {
        this.valueline.x(function(d, i) { return that.x(i + extent[0]); })
        this.x.domain(extent);
    }
    else {
        this.x.domain([1700, 2015]);
    }

    this.x2.domain([1700, 2015]);
    this.xbrush.domain([1700, 2015]);

    //var max = [];
    var allcounts = d3.range(0, this.displayData.length).map(function(){return [];});
    this.displayData.forEach(
            function(d, j){ 
                d.inform.forEach(function(dd, i) {

                    allcounts[j][i] = dd.count;
                })
            })

    var allcounts2 = d3.range(0, this.originalData.length).map(function(){return [];});
    this.originalData.forEach(
            function(d, j){ 
                d.inform.forEach(function(dd, i) {

                    allcounts2[j][i] = dd.count;
                })
            })

    this.y.domain([0, d3.max(allcounts.map(function(d){return d3.max(d)}))])
    this.y2.domain([0, d3.max(allcounts2.map(function(d){return d3.max(d)}))])

    // updates axis
    this.focus.select(".x.axis")
        .call(this.xAxis);

    this.context.select(".x.axis")
        .call(this.xAxis2);

    this.focus.select(".y.axis")
        .call(this.yAxis)
        .selectAll(".tick").each(function(data) {
            var tick = d3.select(this)
                .attr("transform", "translate(0," + that.y(that.deform(data)) + ")");
        });

    // updates graph



    var path = this.focus.selectAll(".line")
      .data(this.displayData.map(function(d) {return d.inform}))
    
    path.enter()
      .append("path")
      .attr("class", "line")
      .attr("id", function(d, i) { return that.currentWord[i];})
      .attr("transform", "translate(100,0)");

    path.transition(3000)
      .attr("d", this.valueline)
    
    var path2 = this.context.selectAll(".line")
      .data(this.originalData.map(function(d) {return d.inform}))
      
    path2.enter()
      .append("path")
      .attr("class", "line")
      .attr("transform", "translate(100,0)");

    path2.transition(3000)
      .attr("d", this.valueline2);

    this.focus.selectAll(".line")
        .on("mouseover", function(d,i) {
        var selected = this.id;
        that.selectword = this.id;
        d3.selectAll(".word")
          .style("opacity", 0.35)
          .filter(function(p) { 
            
            return this.innerHTML == selected;
          })
          .style("opacity", 1)
          .style("color", "red");

        d3.selectAll(".focus .line")
          .style("opacity", 0.35)
          .filter(function(p) { 
            return this.id == selected;
          })
          .style("opacity", 1)
          .style("stroke", "red")
          .style("stroke-width", 1.5);

      })
      .on("mouseout", function(d,i) {
        d3.selectAll(".word")
          .style("opacity", 1)
          .style("color", null)
        d3.selectAll(".focus .line")
          .style("opacity", 1)
          .style("stroke", null)
          .style("stroke-width", null);
        //that.selectword = "";
      });

    this.selectword = that.selectword;

    d3.select(".background")
        .on("mouseover", function() { that.back.style("display", null); })
        .on("mouseout", function() { that.back.style("display", "none"); })
        .on("mousemove", function() {
            mousemove(this, that)
        }); 
    /*d3.select(".background")
      .on("mousemove", function(){ 
         mousex = d3.mouse(this);
         mousex = mousex[0] + 5;
         that.vertical.attr("x", mousex )})
      .on("mouseover", function(){  
         mousex = d3.mouse(this);
         mousex = mousex[0] + 5;
         that.vertical.attr("x", mousex )});*/
    /*if (path[0].length) {

    var circle = 
        this.focus.append("circle")
          .attr("cx", 100)
          .attr("cy", 350)
          .attr("r", 3)
          .attr("fill", "red");

    var pathEl = path.node();
    var pathLength = pathEl.getTotalLength();
    var BBox = pathEl.getBBox();
    var scale = pathLength/BBox.width;
    var offsetLeft = document.getElementById("word1").offsetLeft;


    this.focus.on("mousemove", function() {
      var x = d3.event.pageX - offsetLeft-140; 
      console.log("hi", d3.event.pageX, offsetLeft)
      var beginning = x, end = pathLength, target;
      while (true) {
        target = Math.floor((beginning + end) / 2);
        pos = pathEl.getPointAtLength(target);
        if ((target === end || target === beginning) && pos.x !== x) {
            break;
        }
        if (pos.x > x)      end = target;
        else if (pos.x < x) beginning = target;
        else                break; //position found
      }
      console.log(x, pos)
      circle
        .attr("opacity", 1)
        .attr("cx", x+100)
        .attr("cy", pos.y);
    });
    }*/

    path.exit()
      .remove();

    path2.exit()
      .remove();
    




    this.brush.x(this.xbrush)
    
    this.svg.select(".brush")
        .call(this.brush)
      .selectAll("rect")
        .attr("height", this.height2);



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

CountVis.prototype.brushed = function(data, extent) {
    var dateFormatter = d3.time.format("%Y.%m.%d");
    /*
    this.x.domain(this.brush.empty() ? this.x2.domain() : this.brush.extent());

    this.focus.selectAll(".line")
        .attr("transform", "translate(100,0)")
        .attr("d", this.valueline);
    this.focus.select(".x.axis").call(this.xAxis);*/

    var filtered_data = filterdates(this.originalData, d3.round(extent[0]), d3.round(extent[1]));
    this.updateVis(filtered_data, extent);
    //var counts = aggregateCountsForRange(filtered_data);
    var div = document.getElementById('brushInfo');
    div.innerHTML = 
    "Time Interval: " + d3.round(extent[0])+ " to " + 
    d3.round(extent[1]);


}

/*CountVis.prototype.mousemove = function() {      
                       // **********
                       console.log(d3.mouse(this)[0])
        var x0 = this.x.invert(d3.mouse(this)[0]),              // **********
            i = bisectDate(data, x0, 1),                   // **********
            d0 = data[i - 1],                              // **********
            d1 = data[i],                                  // **********
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;     // **********
        console.log("data", data)

        this.back.select("circle.y")                           // **********
            .attr("transform",                             // **********
                  "translate(" + this.x(100) + "," +         // **********
                                 this.y(200) + ")");        // **********
        }   */






