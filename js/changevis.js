
ChangeVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.currentWord = [];

    // TODO: define all constants here
    this.margin = {top: 20, right: 20, bottom: 30, left: 0},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
    
}

ChangeVis.prototype.initVis = function(){

    this.x = d3.scale.linear()
      .domain([1882, 2014])
      .range([0, this.width])

    var that = this;

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .tickFormat(d3.format(""))
      .ticks(15)
      .orient("bottom");

    this.svg = this.parentElement.append("svg")
        .attr("class", "trial")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    /*this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width/2)-50)             
        .attr("y", 0 - (this.margin.top/3))
        .text("Percent Change over Time");*/

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis)

    this.svg.append("rect")
        .attr("class", "try")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("click", particle)

    function particle() {

        var m = d3.mouse(this);

        that.svg.selectAll("change")
            .data(that.displayData)
        .enter().append("circle")
            //.insert("circle", "rect")
            .attr("class", "change")
            .attr("cx", function(d, i) { 
                return that.x(i+1882)})
            .attr("cy", 150)
            .attr("r", 1e-6)
            .style("stroke", function(d, i){
                if (d < 0)
                    {return "#FFF"} 
                else 
                    {return "#00BFFF"}})
            .style("stroke-opacity", 1)
            .style("fill", "none")

        .transition()
            .duration(2000)
            .delay(function(d, i) { return i * 10; })
            .ease(Math.sqrt)
            .each(slide);

        function slide() {
          var circle = d3.select(this);
          (function repeat() {
            circle = circle.transition()
              .attr("r", function(d) { 
                if (d < 0)
                    {return -(d)+10} 
                else 
                    {return d+10}
              })
              .style("stroke-opacity", 1e-6)
              .style("fill", "none")
              .remove()
          })();
        }
        
        d3.event.preventDefault();
    }

}

ChangeVis.prototype.wrangleData= function(_filterFunction, start, end){
    var that =this;

    this.selectedData = this.data.filter(function(d){ return that.currentWord.indexOf(d.word) != -1});
    if (this.selectedData[0]) {
    this.displayData =this.selectedData[0]["inform"].map(function(d,i){
        if (i == 0){
            return d.count
        }
        else{
            return d.count - that.selectedData[0]["inform"][i-1]["count"]
        }
    })
    }

}

ChangeVis.prototype.updateVis = function(view){

}

ChangeVis.prototype.onSelectionChange= function (new_word){
    this.currentWord=[new_word];
    this.wrangleData();

    var div = document.getElementById('changeInfo');
    div.innerHTML = " for the Word: " + new_word;

}


