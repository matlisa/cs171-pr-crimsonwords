topWordsVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.metaData = _metaData;
    this.displayData = [];
    this.tot_avg = 0
    
    this.margin = {top: 20, right: 20, bottom: 30, left: 0},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.initVis();

}

topWordsVis.prototype.initVis = function(){

    var that = this; 

    this.color= d3.scale.category10()

    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)

    /*this.svg.append("g")
        .append("text")
        .attr("class", "title")
        .text("Top 10 Words of Selected Period")
        .attr("x", this.width/4)
        .attr("y", 20)*/
    this.svg=this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.wrangleData(null);

    this.y= d3.scale.ordinal()
      .rangeRoundBands([0, this.height],.1)

    this.x = d3.scale.linear()
      .range([0, this.width-150])

    this.yAxis = d3.svg.axis()
      .ticks(6)
      .orient("left");


    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(2)
      .orient("bottom");


    this.svg.append("g")
        .attr("class", "x axis")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(150, 0)")

    this.updateVis();
}

topWordsVis.prototype.wrangleData= function(_filterFunction){

    this.displayData = this.filterAndAggregate(_filterFunction);

}

topWordsVis.prototype.updateVis = function(){
    
    var len=this.displayData.length
    var space =""
    for (var i =0; i < 6-len; i++){
        var space = space +" "
        this.displayData.push({sum:0, word:space})
    }

    this.y.domain(this.displayData.map(function(d,i){
        return d.word}))

    this.x.domain([0, this.displayData[0].sum]);

    this.yAxis.scale(this.y)

    this.xAxis.scale(this.x)

    var that = this;
    
    this.svg.select(".y.axis")
        .call(this.yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")

    this.svg.select(".x.axis")
        .attr("transform", "translate(150,"+ (this.height+ 10)+")")
        .call(this.xAxis)

    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.rows = this.svg
                    .selectAll(".row")
                    .data(this.displayData)
    
    this.rows.enter().append("rect")
        .attr("class", "row")
        .attr("transform", "translate(150,0)")
    

    this.rows
        .attr("fill", "#CDEDF6") 
        .attr("height" , this.y.rangeBand())
        .attr("width" , function (d) {return that.x(d.sum)})
        .attr("y", function(d,i){ return that.y(d.word)})
        .attr("x", 3)

    this.rows.exit().remove()

}

topWordsVis.prototype.onBrushChange= function (selectionStart, selectionEnd){
    if (selectionStart && selectionEnd){
    var filter = function (d,i){
        return i>=(d3.round(selectionStart)-1882) && i<=(d3.round(selectionEnd)-1882)
    };}
    else{
        filter =null
    }

    this.wrangleData(filter);

    this.updateVis();


}

topWordsVis.prototype.filterAndAggregate = function(_filter){

    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }

    var that = this;

    var res = d3.range(this.data.length).map(function () {
        return {word:"", sum:0};
    });
    
    this.data.map(function(d,i){
        
        res[i] = {word: d["word"], sum: d3.sum(d["inform"].filter(filter).map(function(dd){return dd.count}))}
        })

    res.sort(function(a,b){if (a.sum > b.sum){ return -1} else if (a.sum < b.sum){ return 1} else {return 0}})
    
    return res.filter(function(d,i){return i<10});

}