FreqVis = function(_parentElement, _data, _metaData, _eventHandler, _eventHandler2){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.eventHandler2 = _eventHandler2;
    this.displayData = [];
    this.originalData = [];
    this.currentWord = [];
    this.selectword = "";
    // this.difference = 0;

    // TODO: define all "constants" here
    this.margin = {top: 10, right: 10, bottom: 100, left: 40};
    this.margin2 = {top: 430, right: 10, bottom: 20, left: 40};
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.height2 = 500 - this.margin2.top - this.margin2.bottom;

    this.initVis();
}

FreqVis.prototype.initVis = function(){
    

    var that = this;

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.focus = this.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    
    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .style("opacity", 0)

    this.back = this.svg.append("g")
        .style("display", "none")

    this.back.append("line")
        .attr("class", "tool")
        .style("stroke", "#CDEDF6")
        .style("stroke-width", 5)
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", this.height+10)
        .attr("x1", 42)
        .attr("x2", 42);

    this.back.append("circle")
        .attr("class", "y")   
        .attr("cx", 42)
        .attr("cy", 10) //10      
        .style("fill", "#CDEDF6")
        .attr("r", 5) //5

    this.back.append("rect")
        .attr("class", "y3")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 30)
        .attr("width", 170)
        .style("fill", "black")
        .style("opacity", 0.8)
        .style("border-radius", 10)

    /*this.back.append("text")
        .attr("class", "y3")
        .attr("x", 42)
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");*/

    this.back.append("text")
        .attr("class", "y4")
        .attr("x", -10)
        .attr("dx", 8)
        .attr("dy", "-1em")
        .style("fill", "white");

    this.context = this.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

/*
    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width / 2.2))             
        .attr("y", 20)
        .style("color", "#FF2B2B")
        .text("Frequency of Words over Time");*/

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.x2 = d3.scale.linear()
      .range([0, this.width]);

    this.xbrush = d3.scale.linear()
      .range([0, this.width]);

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
      .tickFormat(d3.format(""))
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .ticks(6);


    this.valueline = d3.svg.line()
        .interpolate('linear')
        .x(function(d, i) { return that.x(i + 1882); })
        .y(function(d) {return that.y(d.count); });

    this.valueline2 = d3.svg.line()
        .x(function(d, i) { return that.x2(i + 1882); })
        .y(function(d) {return that.y2(d.count); });

        // Add axes visual elements
    this.focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    
    this.focus.append("g")
        .attr("class", "y axis")
        //.attr("transform", "translate(100,0)")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of articles, yearly")

    
    this.focus.append("rect")   
        .attr("class", "background")          
        .attr("width", this.width)            
        .attr("height", this.height)  
        //.attr("transform", "translate(100,0)")
        .style("fill", "none")                
        .style("pointer-events", "all")       


    this.context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height2 + ")")

    this.context.append("g")
        .attr("class", "brush");

    
    // filter, aggregate, modify data
    this.wrangleData();

    this.brush = d3.svg.brush()
      .x(this.x2)
      .on("brush", function(d) {

        $(that.eventHandler2).trigger("brushChanged", that.brush.extent());
        that.brushed(that.displayData, that.brush.extent());})

    // call the update method
    this.updateVis(this.displayData);
}

FreqVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    var that = this;
    this.displayData = this.data.filter(function(d){ return that.currentWord.indexOf(d.word) != -1});

    this.originalData = this.displayData;

}

FreqVis.prototype.updateVis = function(newdata, extent){


    if (newdata) {
        this.displayData = newdata;
    }
    var that = this;

    if (extent && extent[0] != extent[1]) {
        this.valueline.x(function(d, i) { return that.x(i + d3.round(extent[0])); })
        this.x.domain([d3.round(extent[0]), d3.round(extent[1])]) ;
    }
    else {
        this.x.domain([1882, 2014]);
    }

    this.x2.domain([1882, 2014]);
    this.xbrush.domain([1882, 2014]);

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
    
    this.svg.call(this.tip);
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
      
      //.attr("transform", "translate(100,0)");

    path
      .attr("id", function(d, i) {
        console.log("path", i, that.currentWord)
        return that.currentWord[i];})
      .on("click", function(d){
        window.location.href = "#percent";
        $(that.eventHandler).trigger("selectionChanged", this.id);

      })

    function draw(k) {
        path
            .attr('d',function(d) {
              if (this.id == that.currentWord[that.currentWord.length-1]) {
                return that.valueline(d.slice(0,k+1));}
              else {return that.valueline(d);};
            });
    }
    
    var k=1, n = 132;
    d3.timer( function() { 
        draw(k);
        if((k+=2) >= n-1) {
            draw(n-1);
            //next transitions
            return true;
        }
    })

    var path2 = this.context.selectAll(".line")
      .data(this.originalData.map(function(d) {return d.inform}))
      
    path2.enter()
      .append("path")
      .attr("class", "line")
      //.attr("transform", "translate(100,0)");

    path2.transition(3000)
      .attr("d", this.valueline2);

    this.focus.selectAll(".line")
      .on("mouseover", function(d,i) {

          var selected = this.id;
          console.log("graph's id", this.id)
          that.selectword = this.id;
          d3.selectAll(".word")
            .style("opacity", 0.35)
            .filter(function(p) { 
              return this.innerHTML == selected;
            })
            .style("opacity", 1)
            .style("color", "#F0C808");

          /*d3.selectAll(".focus .line")
            .style("opacity", 0.35)
            .filter(function(p) { 
              return this.id == selected;
            })
            .style("opacity", 1)
            .style("stroke", "#F0C808")
            .style("stroke-width", 2.5);*/

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
            mousemove(this, that, this.selectword)
        }); 

      this.tip
        .html(function(d) {
          return "<strong>" + d + "</strong>";
      })


    path.exit()
      .remove();

    path2.exit()
      .remove();

    this.brush.x(this.xbrush)
    
    this.svg.select(".brush")
        .call(this.brush)
      .selectAll("rect")
        .attr("height", this.height2);


  d3.selectAll(".focus .line").transition()
      .duration(30000)
      .each("end", function() { d3.select(this).attr("clip-path", null); });


/*function stackedArea() {
    that.y= d3.scale.ordinal()
      .rangeRoundBands([0, that.height],.1)

    that.x = d3.scale.linear()
      .range([0, that.width])

      that.y.domain(that.displayData.map(function(d,i){
        return d.word}))

    that.x.domain([0, 250]);
  that.svg.select(".y.axis")
        .call(this.yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")

    that.rows = that.svg
                    .selectAll(".row")
                    .data(that.displayData)
    
    that.rows.enter().append("rect")
        .attr("class", "row")
        .attr("transform", "translate(60,0)")
    

    that.rows
        .attr("fill", "#CDEDF6") 
        .attr("height" , that.y.rangeBand())
        .attr("width" , function (d) {return that.x(d.sum)-3})
        .attr("y", function(d,i){ return that.y(d.word)})
        .attr("x", 3)

    that.rows.exit().remove()

}

  setTimeout(stackedArea,3500);

  setTimeout(function() {
    that.svg.selectAll("*").remove();
  }, 3000);*/

}

FreqVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

}

FreqVis.prototype.brushed = function(data, extent) {
    console.log(extent)
    var dateFormatter = d3.time.format("%Y.%m.%d");

    this.difference =  extent[0] - d3.round(extent[0]);
    var filtered_data = filterdates(this.originalData, d3.round(extent[0]), d3.round(extent[1]));
    console.log(filtered_data)
    this.updateVis(filtered_data, extent);
    var div = document.getElementById('brushInfo');
    div.innerHTML = d3.round(extent[0])+ " to " + d3.round(extent[1]);

}


