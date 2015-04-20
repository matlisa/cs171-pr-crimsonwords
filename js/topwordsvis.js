topWordsVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.metaData = _metaData;
    this.displayData = [];
    this.tot_avg = 0

    this.margin = {top: 50, right: 50, bottom: 100, left: 200},
    this.width = 230,
    this.height = 600 - this.margin.top - this.margin.bottom;

    this.initVis();

}

topWordsVis.prototype.initVis = function(){

    var that = this; 

    this.color= d3.scale.category10()

    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
    this.svg.append("g")
        .append("text")
        .attr("class", "title")
        .text("Top 10 Words of Selected Time Period")
        .attr("x",75)
        .attr("y", 30)
    this.svg=this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");;

    this.wrangleData(null);

    this.y= d3.scale.ordinal()
      .rangeRoundBands([0, this.height],.1)

    this.x = d3.scale.linear()
      .range([0, this.width])



    this.yAxis = d3.svg.axis()
      .ticks(6)
      .orient("left");


    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(4)
      .orient("bottom");


    this.x_axes = this.svg.append("g")
        .attr("class", "x axis")

    this.svg.append("g")
        .attr("class", "y axis")

    this.updateVis();
}

topWordsVis.prototype.wrangleData= function(_filterFunction){

    this.displayData = this.filterAndAggregate(_filterFunction);

}

topWordsVis.prototype.updateVis = function(){

    this.y.domain(this.displayData.map(function(d,i){
        return d.word}))

    this.x
      .domain([0, this.displayData[0].sum]);

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
        .attr("transform", "translate(0,"+ this.height+")")
        .call(this.xAxis)


    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.rows = this.svg
                    .selectAll(".row")
                    .data(this.displayData)
    
    this.rows.enter().append("rect")
        .attr("class", "row")
        .attr("transform", "translate(20,0)")
    

    this.rows
      	.attr("fill", function(d,i){return that.color(d)}) 
      	.attr("height" , this.y.rangeBand())
        .attr("width" , function (d) {return that.x(d.sum)})
        .attr("y", function(d,i){ console.log(d.word, that.y(d.word));
            return that.y(d.word)})
        .attr("x", function(d,i) { return 0})

    this.rows.exit().remove()

}

topWordsVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    var filter = function (d,i){
        return i>=(d3.round(selectionStart)-1700) && i<=(d3.round(selectionEnd)-1700)
    };
var test = d3.range(315).map(function(d, i){return i})

    this.wrangleData(filter);

    this.updateVis();


}

topWordsVis.prototype.filterAndAggregate = function(_filter){

    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

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

