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

    this.force = d3.layout.force()
        .size([this.width, this.height])
        .charge(-100)

    var drag = this.force.drag()
        .on("dragstart", dragstart);

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

        that.node.attr("cx", function(d, i) {  return d.x; })
                .attr("cy", function(d, i) { return d.y; });
      })


    function dragstart(d) {
        
        d3.select(this).classed("fixed", d.fixed = true);

    }

}

AboutVis.prototype.package_imports = function(nodes) {
    
    var map = {},
        links = [];

    nodes.forEach(function(d) {
      map[d.number] = d;
    });


    for (i = 0; i < 7; i++) {
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
    }

    return links;
}
