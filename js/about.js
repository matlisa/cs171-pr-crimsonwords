AboutVis = function(_parentElement, _data, _metaData, _words, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.words = [];
    this.eventHandler = _eventHandler;
    this.metaData = _metaData;
    this.displayData = [];
    this.track_alpha =0;
    
    this.margin = {top: 50, right: 20, bottom: 0, left: 20},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

/*
    this.margin = {top: 40, bottom: 10, left: 20, right: 20};
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;*/

    this.initVis();
}


AboutVis.prototype.initVis = function(){

    var that = this; 

    function dblclick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
    }


    this.color= d3.scale.category10()

    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
              .attr("transform", "translate("+this.margin.left+","+this.margin.top+")");


    /*var text = this.svg.selectAll(".introduction")
        .data([0])
    text.enter().append("text")
        .attr("class", "introduction")
        .style("text-anchor", "middle")
        .attr("x", this.width/2)
        .attr("y", this.height)
        .text("WORDS")
        .style("fill", "white")
        .style("font-family", "Montserrat, Helvetica,Arial,sans-serif")
        .style("font-size", "900%")*/

    this.force = d3.layout.force()
        .size([this.width, this.height])
        //.linkStrength(0.2)
        .charge(-100)
        //.linkDistance(35)
        //.chargeDistance(100)
        //.friction(0.5)
        //.gravity(0.7)

    var drag = this.force.drag()
        .on("dragstart", dragstart);

    /*this.y= d3.scale.ordinal()
      .rangeRoundBands([0, this.height],.1)

    this.x = d3.scale.linear()
      .range([0, this.width])*/

    /*var background = this.svg.selectAll(".ground")
      .data([1.6, 2.5])
    
    background
      .enter().append("circle")
      .attr("class", "ground")
      .attr("r", function(d, i) { return 500/d; })
      .attr("cx", this.width/2)
      .attr("cy", this.height/2)
      .style("fill", function(d) {
        if (d == 2.2) { return "#fff";}
        else {return "#fff"} })
      .style("opacity", 0.7)*/



    this.words = this.data.map(function(d) {
        return d.word;
    });
    this.words = this.words.map(function(d, i) {
        var group;
        if (d == "Caabot" || d == "Cuurrier") {
            group = 1;
        }
        else {group = i;}
        return {word:d, group: group}
    })
    
    var data_links = this.package_imports(this.words);

    var word1 = "Crimson";
    var word2 = "Words"

    var total_nodes = 7*7;
    var alphabet = d3.range(0, total_nodes).map(function(d,i) {
        //var index = [14, 15, 16, 17, 18, 19, 20, 35, 36, 37, 38, 39, 40, 41]
        //return {number: index[i]}
        return {number: i}
    })


    var alphabet_links = this.package_imports(alphabet);

    var all_data = {"nodes":alphabet, "links":alphabet_links};


    this.link = this.svg.selectAll(".link2")
        .data(all_data.links)

    this.link
        .enter().append("line")

    this.link
        .attr("class", "link2")
        .attr("stroke", function(d) {
            var need_target = [1, 2, 5, 6, 9, 10, 11, 12, 16, 19, 22, 24, 25, 29, 30, 34, 36, 37, 38, 39, 40, 41, 43, 46];
            var need_source = [0, 1, 5, 6, 7, 9, 14, 21, 24, 27, 28, 29, 36, 37, 38, 39, 40, 41, 42, 45, 48];

            //var need_target = [16, 19, 36, 37, 38, 39, 40, 41];
            //var need_source = [14, 36, 37, 38, 39, 40, 41];

            if (need_target.indexOf(d.target.number) > -1
            && need_source.indexOf(d.source.number) > -1 ) {
            return "white"}
            else return "none"
        })
        .attr("stroke-width", 2.5)

    this.link
        .exit()
        .remove();   

    this.node = this.svg.selectAll(".node")
        .data(all_data.nodes)

    this.node  
        .enter().append("circle")

    this.node
        .attr("class", "node")
        .attr("fill", function(d) {
            var need_target = [1, 2, 5, 6, 9, 10, 11, 12, 16, 19, 22, 24, 25, 29, 30, 34, 36, 37, 38, 39, 40, 41, 43, 46];
            var need_source = [0, 1, 5, 6, 7, 9, 14,21, 24, 27, 28, 29, 36, 37, 38, 39, 40, 41, 42, 45, 48];

            //var need_target = [16, 19, 36, 37, 38, 39, 40, 41];
            //var need_source = [14, 36, 37, 38, 39, 40, 41];
var test = [1, 2]
test = test.map(function(d) {return d+7})

            if (need_target.indexOf(d.number) > -1
            || need_source.indexOf(d.number) > -1 ) {
                return "white"
            }
            else return "none";
        })
        .attr("r", 6)
        .on("dblclick", dblclick)
        .call(drag);
    this.node
      .exit()
      .remove();

    this.force
      .nodes(all_data.nodes)
      .links(all_data.links)
      .start()

    this.force
      .on("tick", function(e) {
        var k = .1 * e.alpha;
        var foci = [{x: 50, y: 150}, {x: 150, y: 150}, {x: 200, y: 150}, {x: 250, y: 150},
        {x: 300, y: 150}, {x: 350, y: 150}, {x: 400, y: 150}];


        that.link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        /*
        node.forEach(function(o, i) {
        if (i < 7) {
            o.y += (foci[0].y - o.y) ; 
            o.x += (foci[0].x - o.x) ;
        }
        else if (7 <= i < 14) {
            o.y += (foci[1].y - o.y) ; 
            o.x += (foci[1].x - o.x) ;
        }
        else if (14 <= i < 21) {
            o.y += (foci[2].y - o.y) ; 
            o.x += (foci[2].x - o.x) ;
        }
        else if (21 <= i < 28) {
            o.y += (foci[3].y - o.y) ; 
            o.x += (foci[3].x - o.x) ;
        }
        else if (28 <= i < 35) {
            o.y += (foci[4].y - o.y) ; 
            o.x += (foci[4].x - o.x) ;
        }
        else if (35 <= i < 42) {
            o.y += (foci[5].y - o.y) ; 
            o.x += (foci[5].x - o.x) ;
        }
        else {
            o.y += (foci[6].y - o.y) ; 
            o.x += (foci[6].x - o.x) ;
        }
        });*/
        that.node.attr("cx", function(d, i) {  
                    /*if (i == 0) {
                        
                        d.x = that.width/2 -300;
                    }
                    else if (i == 7) {
                        d.x = that.width/2 -200;
                    }
                    else if (i == 14) {
                        d.x = that.width/2 -100;
                    }
                    else if (i == 21) {
                        d.x = that.width/2;
                    }
                    else if (i == 28) {
                        d.x = that.width/2 + 100;
                    }
                    else if (i == 35) {
                        d.x = that.width/2 + 200;
                    }
                    else if (i == 42) {
                        d.x = that.width/2 + 300;
                    }*/

                    return d.x; })

            .attr("cy", function(d, i) { 
            //if (i == 0 || i == 7 || i == 14 || i == 21 || i == 28 || i == 35 || i == 42){

                /*if (d.y > that.height/2 - 50 && d.y < that.height/2 + 50) {
                    d.y = d.y + Math.floor(Math.random() * 20) - 10;
                }*/
/*
                if (d.y > 300 || d.y < 200) {
                    if (d.y > 350 || d.y < 150) {
                        d.y = d.y - Math.random() * 20;
                    }
                    else {
                        d.y = d.y + Math.random();
                    }   
                }
*/
            //}
            return d.y; });
      })


    /*
    var text2 = this.svg.selectAll(".work2")
        .data([0])
    text2.enter().append("text")
        .attr("class", "work2")
        .style("text-anchor", "middle")
        .attr("x", this.width/2)
        .attr("y", this.height/3.3)
        .text("CRIMSON")
        .style("fill", "none")
        .style("stroke", "white")
        .style("font-family", "Montserrat, Helvetica,Arial,sans-serif")
        .style("font-size", "500%")*/

/*
    if (this.track_alpha < 0.05) { that.force.start();}
    that.force.on("tick", tick_all)*/
    

    /*function tick_all(e) {
        that.track_alpha = e.alpha;
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
          .attr("cx", function(d) {return d.x;})
          .attr("cy", function(d) {return d.y;})
    }*/
    //this.updateVis();

    function dragstart(d) {
        
        d3.select(this).classed("fixed", d.fixed = true);

    }

}
/*

AboutVis.prototype.wrangleData= function(_filterFunction){

    this.displayData = this.filterAndAggregate(_filterFunction);

}
*/
AboutVis.prototype.package_imports = function(nodes) {
    
    var map = {},
        links = [];

    nodes.forEach(function(d) {
      map[d.number] = d;
    });


    nodes.forEach(function(d, i) {
    
      /*if (d != "") {
        if (map[d.group+1] && map[d.group-1]&&map[d.group+2]) {

          links.push({source: map[d.group-1], target: map[d.group+2]});
          links.push({source: map[d.group-1], target: map[d.group+1]});
          //links.push({source: map[d.group], target: map[d.group+1]}); 
        }
        
      }*/

    });


    for (i = 0; i < 7; i++) {
        //if (i == 2 || i == 5) {
        links.push({source: map[0+7*i], target: map[1+7*i]});
        links.push({source: map[0+7*i], target: map[2+7*i]});
        links.push({source: map[0+7*i], target: map[3+7*i]});
        links.push({source: map[0+7*i], target: map[4+7*i]});
        links.push({source: map[0+7*i], target: map[5+7*i]});
        links.push({source: map[0+7*i], target: map[6+7*i]});

        links.push({source: map[1+7*i], target: map[2+7*i]});
        links.push({source: map[2+7*i], target: map[3+7*i]});
        links.push({source: map[3+7*i], target: map[4+7*i]});
        links.push({source: map[4+7*i], target: map[5+7*i]});
        links.push({source: map[5+7*i], target: map[6+7*i]});
        links.push({source: map[6+7*i], target: map[1+7*i]});
        //}
    }






    return links;
}


/*
AboutVis.prototype.updateVis = function(){
    
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
        .attr("transform", "translate(60,"+ (this.height+ 10)+")")
        .call(this.xAxis)

    this.svg.select(".y.axis")
        .call(this.yAxis)

    this.rows = this.svg
                    .selectAll(".row")
                    .data(this.displayData)
    
    this.rows.enter().append("rect")
        .attr("class", "row")
        .attr("transform", "translate(60,0)")
    

    this.rows
      	.attr("fill", "#CDEDF6") 
      	.attr("height" , this.y.rangeBand())
        .attr("width" , function (d) {return that.x(d.sum)-3})
        .attr("y", function(d,i){ return that.y(d.word)})
        .attr("x", 3)

    this.rows.exit().remove()

}

AboutVis.prototype.onBrushChange= function (selectionStart, selectionEnd){

    var filter = function (d,i){
        return i>=(d3.round(selectionStart)-1700) && i<=(d3.round(selectionEnd)-1700)
    };
var test = d3.range(315).map(function(d, i){return i})

    this.wrangleData(filter);

    this.updateVis();


}

AboutVis.prototype.filterAndAggregate = function(_filter){

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

}*/
