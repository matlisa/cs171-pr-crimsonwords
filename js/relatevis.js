RelateVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.originalData = [];

    this.track_alpha =0;
    this.written = 0;
    this.word_selected = "";
    this.weight = 0;
    this.sum = 0;

    this.margin = {top: 0, bottom: 10, left: 20, right: 20};
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.initVis();
}

RelateVis.prototype.initVis = function(){

    var that = this;

    this.xscale = d3.scale.linear().range([10, this.width]);
    this.yscale = d3.scale.linear().range([0, this.height]);
    this.exscale = d3.scale.linear().range([5, this.height/25]);
    this.linkscale = d3.scale.linear().range([5, this.height/1.5]);

    // Creates sources <svg> element and inner g (for margins)
    this.svg = this.parentElement.append("svg")
                .attr("width", this.width+this.margin.left+this.margin.right)
                .attr("height", this.height+this.margin.top+this.margin.bottom)
              .append("g")
                .attr("transform", "translate("+this.margin.left+","+this.margin.top+")");

    this.x_axis = d3.svg.axis()
                       .scale(this.xscale)
                       .orient("bottom")

    var start_year = d3.select('#slider-time').property("value")/5;

    this.force = d3.layout.force()
        .size([this.width, this.height])
        .charge(-300)
        .gravity(0.7)

    var length = 0;

    this.r = Math.min(this.height, this.width)/1.3;

    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .style("opacity", 0)
    
    this.trial_links = this.package_imports(this.data, start_year);

    this.all_data = {"nodes":this.data, "links":this.trial_links};

    this.link = this.svg.selectAll(".link")
        .data(this.all_data.links);

    this.link
      .enter().append("line")
      .attr("class", "link")   

    this.link
      .exit()
      .remove();

    this.node = this.svg.selectAll(".node")
      .data(this.data);

    this.node
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5.5)
      .call(this.force.drag)
      .on("click", function(d) {
        d3.select('#force').property("checked", "checked");
        if (d.word != "") {
          var year = d3.select('#slider-time').property("value")/5;
          that.trial_links = that.package_imports(that.data, year);
          that.word_selected = d.word;
          var new_links = that.filter_links(that.trial_links, d.word);
          var new_data = {"nodes":that.data, "links":new_links};
          that.force_change(new_data, year);
        }
      })
      .on("mouseover", this.tip.show)        
      .on("mouseout", this.tip.hide)
    
    this.node
      .exit()
      .remove();

    this.message = this.svg.selectAll(".lab")
      .data(this.data)

    this.message
      .enter().append("text")
      .attr("class", "lab")
      .attr("text-anchor", "middle")
      .attr("x", this.width/2)
      .attr("y", this.height/2)

    this.force
      .nodes(this.all_data.nodes)
      .links(this.all_data.links)

    this.force_layout_all();

    this.svg.call(this.tip);

    this.tip
      .html(function(d) {
        return "<strong>" + d.word + "</strong>";
    })

    d3.select("input[value=\"not_weighted\"]").on("change", function(){
      var year = d3.select('#slider-time').property("value")/5;
      if (that.word_selected) {
        that.trial_links = that.package_imports(that.data, year);
        var new_links = that.filter_links(that.trial_links, that.word_selected);
        var new_data = {"nodes":that.data, "links":new_links};
        that.force_change(new_data, year);
      }
    })
    d3.select("input[value=\"weighted\"]").on("change", function(){
      var year = d3.select('#slider-time').property("value")/5;
      if (that.word_selected) {
        that.trial_links = that.package_imports(that.data, year);
        var new_links = that.filter_links(that.trial_links, that.word_selected);
        var new_data = {"nodes":that.data, "links":new_links};
        that.force_change(new_data, year);
      }
    })

    d3.selectAll('#slider-time').on("input",function(){
      var year = d3.select('#slider-time').property("value")/5;
      if (d3.select("input[value=\"on\"]").node().checked) {
          if (that.word_selected) {
            that.trial_links = that.package_imports(that.data, year);
            var new_links = that.filter_links(that.trial_links, that.word_selected);
            var new_data = {"nodes":that.data, "links":new_links};
            that.force_change(new_data, year);
          }
      }
    });

    d3.select("input[value=\"on\"]").on("change", function() {
      var year = d3.select('#slider-time').property("value")/5;
        if (that.word_selected) {
          that.trial_links = that.package_imports(that.data, year);
          var new_links = that.filter_links(that.trial_links, that.word_selected);
          var new_data = {"nodes":that.data, "links":new_links};
          that.force_change(new_data, year);
        }
        else {
          that.reset(that.data, that.all_data, that.trial_links);
        }
    })
    d3.select("input[value=\"reset\"]").on("change", function() {
      if (that.track_alpha < 0.01 ) {
        that.reset(that.data, that.all_data, that.trial_links);
      }
      else {
        d3.select("#force").property("checked", true);
      }
    })
}

RelateVis.prototype.get_index = function(data, word, year) {
    
    for (var i = 0; i <data.years[year].top_partners.length; i++) {
        if(data.years[year].top_partners[i].word == word) {
          index = i;
          break;
        }
        else index = -1;
    }
    return index;
}

RelateVis.prototype.filter_links = function(data, word) {
    var filtered = data.filter(function(d, i) {
        return (d.target.word == word);
      }) 
    return filtered;
}

RelateVis.prototype.find_range = function(data, word) {

  var that = this;
  var max_length = 0;
  var min_length = 0;
  var max_count = 0;
  var min_count = 0;
  var weight = [];
  var length= [];
  var count = [];
  var index = [];
  var sum = 0;

  for (var year = 0; year < 2; year ++ ) {
    for (var i = 0; i < data.length; i ++) {
      index[i] = that.get_index(data[i].source, word, year);

      if (index[i] != -1){
        that.sum = (data[i].source.years[year].top_partners[index[i]].total_connections) + that.sum;
      }
    }
    for (var i = 0; i < data.length; i ++) {

      if (index[i] != -1 ){
        count[i] = data[i].source.years[year].top_partners[index[i]].total_connections;
        weight[i] = count[i]/that.sum;
        
        length[i] = 1/Math.sqrt(Math.sqrt(weight[i]));
        
        if (i == 0) {
          min_count = count[0];
          min_length = length[0];
        }

        if (min_length > length[i]) {
          min_length = length[i];
        }
        if (max_length < length[i]) {
          max_length = length[i];
        }

        if (min_count > count[i]) {
          min_count = count[i];
        }
        if (max_count < count[i]) {
          max_count = count[i];
        }
      }
    }
  }
  return [min_length, max_length, that.sum, min_count, max_count]
}


RelateVis.prototype.find_length = function(data, word, year) {
    var that = this;
    var max_length = 0;
    var min_length = 0;
    var sum = 0;
    var weight = [];
    var length= [];
    var index = [];
    var range = this.find_range(data, word);
    sum = range[2];
    min_length = range[0];
    max_length = range[1];
        
    for (var i = 0; i < data.length; i ++) {
      index[i] = that.get_index(data[i].source, word, year);
      if (index[i] != -1 ){

        weight[i] = (data[i].source.years[year].top_partners[index[i]].total_connections)/sum;
       
        length[i] = (1/Math.sqrt(Math.sqrt(weight[i])));
        
      }
    }
    return [min_length, max_length, length];
}

RelateVis.prototype.package_imports = function(nodes, year) {
    
    var map = {},
        connect = [];

    nodes.forEach(function(d) {
      map[d.word] = d;
    });

    nodes.forEach(function(d) {
      if (d != "") {

        if (d.years[year].top_partners) { d.years[year].top_partners.forEach(function(dd) {

          if (map[dd.word] && map[d.word]) {
          connect.push({source: map[d.word], target: map[dd.word]}); }
          })
        }
      }
    });

    return connect;
}

RelateVis.prototype.force_layout_all= function() {
    var that = this;
    this.message
      .style("visibility", "hidden")
    if (this.track_alpha < 0.05) { that.force.start();}
    this.force.on("tick", this.tick_all)
}

RelateVis.prototype.tick_all = function(e) {
    this.track_alpha = e.alpha;

    d3.selectAll(".node")
      .attr("cx", function(d) {return d.x;})
      .attr("cy", function(d) {return d.y;})

}

RelateVis.prototype.force_change = function(data, year){
    var that = this
    this.force
      .linkDistance(function(d,i){ 
        if (d3.select("input[value=\"not_weighted\"]").node().checked) {
          that.linkscale.domain([0, 1]);
          return that.linkscale(1);
        }
        else if (d3.select("input[value=\"weighted\"]").node().checked) {

          that.length = that.find_length(data.links, d.target.word, year);
          console.log("range", that.length[0]/1.1, that.length[1])
          that.linkscale.domain([that.length[0]/1.1, that.length[1]]);
          if (that.length[2][i]) {
            return that.linkscale(that.length[2][i]);}
          else return 0;
        }

      })

    this.svg.call(this.tip);

    this.link = this.svg.selectAll(".link")
        .data(data.links);

    this.link
      .enter().append("line")
      .attr("class", "link")

    this.link
      .exit()
      .remove();

    this.node = this.svg.selectAll(".node")
      .data(data.nodes);

    this.node
      .enter().append("circle")
      .attr("class", "node")
      .style("fill", function(d) { return "black"; })

    this.node
      .call(this.force.drag)
      .transition().duration(2000)
      .attr("r", function(d) {
        var year = d3.select('#slider-time').property("value")/5;
        if (data.links.length != 0) {
          
          var index = that.get_index(d, data.links[0].target.word, year);

          if (index == -1) {
            if (d.word == data.links[0].target.word) {
              return 10;
            }
            else { return 0;}
          }
          else {  

            var range = that.find_range(data.links, data.links[0].target.word);
            var min = range[3]
            var max = range[4]
            
            that.exscale.domain([min/2, max]);
            return that.exscale(d.years[year].top_partners[index].total_connections);

          }
        }
      })
      .style("stroke",  "yellow")
      .style("fill", function(d) {
        if (d.word == that.word_selected) {
          return "yellow";} 
      })
   
    this.tip 
      .html(function(d) {
        var year = d3.select('#slider-time').property("value")/5;
        var index = that.get_index(d, data.links[0].target.word, year);

        if (d.word != data.links[0].target.word) {
          return "<strong>" + d.word + "</strong> <span style='color:#8F8F8F'>" 
          + (d.years[year].top_partners[index].total_connections) + "</span>";}
        else {return "<strong>" + d.word+ "</strong>";}
      })

    this.node
      .on("mouseover", this.tip.show)        
      .on("mouseout", this.tip.hide)


    this.node
      .exit()
      .remove();

    if (data.links.length == 0 && this.written == 0) { 

      this.track_alpha = 0;

      var year = parseInt(d3.select('#slider-time').property("value")) + 2000;
      this.message
        .style("visibility", "visible")
        .text("You must select more than one word to see associations")
    }
    else {
      this.message
        .style("visibility", "hidden")

      var length = that.find_length(data.links, data.links[0].target.word, year);
    }
      this.force
        .nodes(data.nodes)
        .links(data.links)

      this.force.start();

      this.force.on("tick", function(e) {
        that.track_alpha = e.alpha;

        that.node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
        that.link.attr("x1", function(d, i) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; })
      })
    
}

RelateVis.prototype.reset = function(data) {

      var empty = [];
      var that = this;
      
      var year = d3.select('#slider-time').property("value")/5;
      this.trial_links = this.package_imports(data, year);
      this.all_data = {"nodes":data, "links":this.trial_links};

      this.link = this.svg.selectAll(".link")
          .data(empty);

      this.link
        .enter().append("line")
        .attr("class", "link")  

      this.link
        .exit()
        .remove();

      this.node = this.svg.selectAll(".node")
        .data(this.all_data.nodes);

      this.node
        .enter().append("circle")

      this.node
        .attr("class", "node")
        .attr("r", 5.5)
        .call(this.force.drag)
        .on("click", function(d) {
          d3.select('#force').property("checked", "checked");
          if (d.name != "") {
            var year = d3.select('#slider-time').property("value")/5;
            that.trial_links = that.package_imports(data, year);
            that.word_selected = d.word;
            var new_links = that.filter_links(that.trial_links, d.word);
            var new_data = {"nodes":data, "links":new_links};
            that.force_change(new_data, year);
          }
          
        })
        .style("fill", function(d) {
          if (d.word == that.word_selected) {
            return "black";} 
        })
        .style("stroke", "none")
        .on("mouseover", this.tip.show)        
        .on("mouseout", this.tip.hide)
      
      this.svg.call(this.tip);

      this.tip
        .html(function(d) {
          return "<strong>" + d.word + "</strong>";
      })

      this.node
        .exit()
        .remove();

      this.word_selected = "";

      this.force
        .nodes(this.all_data.nodes)
        .links(empty)

      this.force_layout_all();
}
