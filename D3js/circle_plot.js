




// ---------------------------------- create the circle plot ----------------------------------------


function Create_chr_circle(){  
	// function to Create the SVG element , to Plot the chromosomes in a circle and the ticks on chromosome   
		
 svg = d3.select("#chart")  // Selects  the element with id="chart"
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .append("g")
    //.attr("transform", "translate(" + 400 + "," + 400  + ")");  //This transform moves the element by pixels in both the X and Y directions.
    .attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");  //This transform moves the element by pixels in both the X and Y directions.

// // Genome object for drawing Plot the chromosomes in a circle
 all_chrom = Genome();


allNodes = new Array(); //create array that will receive objects with information about SNP from .json 

data_weight_pvalue= new Array(); //create array that will receive the weight value from .json


svg.selectAll("path") //create the vizualization of the chromosomes in circles.
    .data(all_chrom.chromosomes()) // it'll return chromosomes[] with objects content information about each chromosomes
    .enter()                       //in each object has information such as angle 
    .append("path")
    .attr("class", "ring")
    .style("fill", function(d) { return color[d.index]; })
    .style("stroke", function(d) { return color[d.index]; })
    .attr("d", d3.svg.arc().innerRadius(chromRingInnerRadius).outerRadius(chromRingOuterRadius)); //read angles of each object in chromosomes[]


svg.selectAll("text")      // write the numbers in chromosomes 
    .data(all_chrom.chromosomes())
    .enter()
    .append("text")
    .attr("class", "ring")
    .attr("transform", function(d) {
	var angle = (d.startAngle+d.endAngle)/2;
	if (angle < Math.PI) {
	    return "rotate("+ degrees(angle) + ")"
		+ "translate(" + (chromRingInnerRadius+3) + ")";}
	else {
	    return "rotate("+ degrees(angle) + ")"
		+ "translate(" + (chromRingInnerRadius+3) + ")"
		+ "rotate(180)translate(-16)";}
    })
    .text(function(d) { return d.index+1 });


// ticks on chromosome       

var ticks = svg.append("g")
  .selectAll("g")
    .data(all_chrom.chromosomes())
  .enter().append("g")
  .selectAll("g")
  .data(groupTicks)
  .enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + chromRingOuterRadius + ",0)";
    });

ticks.append("line")
    .attr("x1", 1)
    .attr("y1", 0)
    .attr("x2", 5)
    .attr("y2", 0)
    .style("stroke", "#000");
    

ticks.append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("font-size","10")
    .attr("text-anchor", function(d) {
      return d.angle > Math.PI ? "end" : null;
    })
    .attr("transform", function(d) {
      return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
    })
    .text(function(d) { return d.label; });    
    

// when we click in vizualization it declaration below will reset the vizualization using the function reset		

//d3.select("#chart").selectAll('svg').on("click", reset());
//d3.select("#scale_bar").selectAll('svg').remove();

};




function Create_SNP_association(file_name){
//this function create all associations betewen the SNPs


// Plot nodes and links for the default dataset
d3.json(file_name, function(json) {
    links = json.links;// var links = json.links;
	   

    json.nodes.forEach(
	function(d) { allNodes.push(d) }   //allNodes[]
    );


    // Draw the marks for each snp   - small marks in chromosome 
  svg.selectAll("path.vertex")
	.data(allNodes)
	.enter().append("path")
	.attr("class", "vertex") //"vertex"
	.style("fill", function(d) { return color[d.chrom-1]; })
	.style("stroke", function(d) { return color[d.chrom-1]; })
	.attr("d", d3.svg.arc()
	      .innerRadius(chromRingInnerRadius-10)
	      .outerRadius(chromRingInnerRadius-3)          // getAngle() is a function of Genome   
	      .startAngle(function(node) { return all_chrom.getAngle(node.chrom, node.bp_position) - 0.001; })
	      .endAngle(function(node) { return all_chrom.getAngle(node.chrom, node.bp_position) + 0.001; }))
   
 
    // Draw the nodes for each snp   - small circles
 svg.selectAll("circle.vertex")
	.data(allNodes)
	.enter().append("circle")
	.attr("class", "vertex")//"vertex"
	.style("fill", function(d) { return graphColor(d.subgraph_id) })
	.style("stroke", function(d) { return graphColor(d.subgraph_id) })
	.attr("cx", chromRingInnerRadius-20)
	.attr("r", 3)
	.on("mouseover", fade(0))  //click mouseover mouseout
	//.on("mouseout", reset(1))  //see creat chart
	
	 .on("mousedown", function(g, i) { 
	 	//when mousedown this selected the subgraph_id and create the string_html to show in html the seleced data 
  		 	
  		 	sid= allNodes[i].subgraph_id;
  		 	
 			histogram_degree_SNPs(file_json,sid);	
 			
 			string_html="{\"directed\": false, \"graph\": [], \"nodes\": [";

			json_nodes_selected(file_json,sid);	
		
			json_links_selected(file_json,sid);
			 			
			}
	 ).attr("transform", function(d) { 
	    return "rotate(" + degrees(all_chrom.getAngle(d.chrom, d.bp_position)) + ")" });
 

    
    // Draw the edges  - the association between SNPs
 svg.selectAll("path.link")
	.data(links)
	.enter().append("path")
	.attr("class", "link")
	.style("stroke", function(d) { return graphColor(d.subgraph_id); })
	.style("stroke-width", 1)
	.style("opacity", 0.3)
	.style("fill", "none")
	.attr("d", link());

    
    
    // Write out the data in text
 d3.select("#snps").selectAll("p")
	.data(allNodes)
	.enter().append("p")
	.append("link").attr("href",function(d){
				
	return 'http://genome.ucsc.edu/cgi-bin/hgTracks?org=human&db=hg19&position='+
	'chr'+d.chrom+':'+d.label.substring(6).replace("k","000-")+d.bp_position  ;
				
			})
			.attr("target","_blank")
			.style("text-decoration",'none')
			.style("color", '#000')
	.text(function(d) { return showSnp(d); });
	
	
    
 d3.select("#pairs").selectAll("p")
	.data(links)
	.enter().append("p")
	.text(function(d) { return showInteract(d); });
	
	
});

};
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ create the circle plot ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^







// ------------------------   declaration of the functions to plot crhom. in circle  --------------------------------------


// Display the nodes and links for debugging
function showSnp(d)
{
    return "chr"+d.chrom+':'+d.bp_position + "    " + d.rs + " Subgraph:" + d.subgraph_id;

};

function showInteract(d)
{
    return "Source: " + d.source + " Target: " + d.target
	+ " Weight: " + d.weight + " Subgraph: " + d.subgraph_id;
};

//Transform radians to degrees
function degrees(radians) {
    return radians / Math.PI * 180 - 90;
};

 
function groupTicks(d) {
	// Returns an array with objects of tick angles and labels 
	
  var k = (d.endAngle - d.startAngle) / d.value;    // number of bases scaled to factor for K
  return d3.range(0, d.value, 0.041 ).map(function(v, i) {  //modification 0.05
    return {
      angle: v * k + d.startAngle,
      label: i % 2 ? null : Math.round((v/d.factor_k) / 1000000) + "Mb"  //number of bases 
    };
  });
};


// Link object for displaying interactions
function link() {
    var genome = Genome(),
    radius = chromRingInnerRadius-22;

    function link(d) {
	var startAngle = genome.getAngle(allNodes[d.source].chrom, allNodes[d.source].bp_position),
	endAngle = genome.getAngle(allNodes[d.target].chrom, allNodes[d.target].bp_position),
	offset = radius*(0.1*Math.min(allNodes[d.source].subgraph_id,9)-0.1);

	var startX = Math.sin(startAngle)*radius,
	startY = -Math.cos(startAngle)*radius,
	endX = Math.sin(endAngle)*radius,
	endY = -Math.cos(endAngle)*radius;

	var c1X = Math.sin(startAngle)*offset,
	c1Y = -Math.cos(startAngle)*offset,
	c2X = Math.sin(endAngle)*offset,
	c2Y = -Math.cos(endAngle)*offset;

	return "M" + startX + "," + startY
	    + "C" + c1X + "," + c1Y
	    + " " + c2X + "," + c2Y
	    + " " + endX + "," + endY
    }
    return link;
};


// Returns an event handler for fading
function fade(opacity) {
	var sid;
    return function(g, i) {
	svg.selectAll("g circle")  //select the circles
            .filter(function(d) {
            	            	 
		return d.subgraph_id != allNodes[i].subgraph_id ;
            })
	    .transition()
            .style("opacity", opacity);
            
            
    svg.selectAll("g circle")  //show degree as tooltip - title
            .filter(function(d) {
		return d.subgraph_id === allNodes[i].subgraph_id;
            })
	  .append("title")
      .text(function(d) { return "degree: " + two_dec(d.degree) });  
        
   svg.selectAll(".link") //select the association regarding to the circle selected
   			.filter(function(d) {
		return d.subgraph_id != allNodes[i].subgraph_id;
            }).remove();
       // .transition()
  		//	.style("opacity", opacity).remove();	
  
   d3.select("#snps").selectAll("p").remove(); //remove old text
   d3.select("#pairs").selectAll("p").remove(); //remove old text
  
    // Write out the data selected in text 
 d3.select("#snps").selectAll("p")  
	.data(allNodes)
	.enter().append("p")
	.filter(function(d) { 	return d.subgraph_id === allNodes[i].subgraph_id;   })
	.append("link").attr("href",function(d){	//link for UCSC genome browser for each snp (small circle) selected 			
	return 'http://genome.ucsc.edu/cgi-bin/hgTracks?org=human&db=hg19&position='+
	'chr'+d.chrom+':'+d.label.substring(6).replace("k","000-")+d.bp_position  ;				
			})
	.attr("target","_blank")	
	.style("text-decoration",'none')	
    .style("color", function(d) {  //highlights the SNP selected
					if (d.id != allNodes[i].id) {	
						return "black";
					} else {
						return graphColor(d.subgraph_id);
					}
				})      
	.text(function(d) { return showSnp(d); });
   
  

 d3.select("#pairs").selectAll("p")
	.data(links)
	.enter().append("p")
	.filter(function(d) {
		return d.subgraph_id === allNodes[i].subgraph_id;
            })
	.text(function(d) { 
		
	
		return showInteract(d); });
   

            
    };
};

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^   declaration of the functions to plot crhom. in circle  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^









// ---------------------------------------- brush weight  --------------------------------------------

  
function brush_weight(file_name){
//this function create the brush on weight value to vizualizate SNPs association in specific weight range 

d3.json(file_name, function(json) {
    links = json.links;// var links = json.links;

	json.links.forEach(
	function(d) { data_weight_pvalue.push(d.weight) }   //data_weight_pvalue[]
    );
      	
	//Width and height
			var w = 500;
			var h = 300;
			var padding = 30;
							
		var dataset = data_weight_pvalue;
       //var dataset = dat;
       
       
			//Create scale functions
			var xScale = d3.scale.linear()
								 .domain([d3.min(dataset, function(d) { return d; })-1, d3.max(dataset, function(d) { return d; })+1])
								 //.range([padding, w - padding * 2]);
								.range([padding, w - padding * 2]);
            								
								
			var yScale = d3.scale.linear()
								 .domain([0, 0])
								 .range([h - padding-250, padding-250]);


			//Define X axis
			var xAxis = d3.svg.axis()
							  .scale(xScale)
							  .orient("bottom")
							  .ticks(8);

			//Create SVG element
			var svg2 = d3.select("#brush_weight")
						.append("svg")
						.attr("class", "weightPvalue")
						.attr("width", w)
						.attr("height", 50);

			//Create circles
	var circle2= svg2.selectAll("circle")
			   .data(dataset)
			   .enter()
			   .append("circle")
			   .attr("cx", function(d) {
			   		return xScale(d);
			   })
			   .attr("cy", function(d) {
			   		return yScale(0);
			   })
			   .attr("r", 2);
					
			//Create X axis
			svg2.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (h - padding-250) + ")")
				.call(xAxis);
				
			svg2.append("g")
    		.attr("class", "brush")
    		.call(d3.svg.brush().x(xScale)
    		.on("brushstart", brushstart)
    		.on("brush", brushmove)
    		.on("brushend", brushend))
  			.selectAll("rect")
    		.attr("height", 40);	
	
			
function brushstart() { //selected de circles in x cordenate for diferent vizualization
  svg2.classed("selecting", true);
}

function brushmove() {
  var s = d3.event.target.extent(); //return 2 value that are the 1ª and 2ª position the brush on x coordenate
  circle2.classed("selected", function(d) { return s[0] <= d && d <= s[1]; }); //selected de circles in x cordenate for diferent vizualization
  
  d3.select("#two_weight_value").selectAll("h").remove(); //remove the old text
  d3.select("#two_weight_value").selectAll("h")           //create the new text
	.data([1])
	.enter().append("h")
	.text(two_dec(s[0])+" - "+two_dec(s[1]));
		
	svg.selectAll(".link").remove(); //remove the old association
	reset_association();			 //create the new association
	   
	svg.selectAll(".link") // this declaretion selected the association between specifics  weight values 
   			.filter(function(d) { return   d.weight  <=  s[0]	||  d.weight >=s[1];  }).remove();	
}

function brushend() { //selected de circles in x cordenate for diferent vizualization
  svg2.classed("selecting", !d3.event.target.empty());
}
	
	
	
function reset_association(){
	 //create the new association		
    // Draw the edges
 svg.selectAll("path.link")
	.data(links)
	.enter().append("path")
	.attr("class", "link")
	.style("stroke", function(d) { return graphColor(d.subgraph_id); })
	.style("stroke-width", 1)
	.style("opacity", 0.3)
	.style("fill", "none")
	.attr("d", link());
	
} 	
	
});

};
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ brush weight  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^







// ---------------------------------------- histogram edges X subgraph_id --------------------------------------------


function histogram_edges_subgraphId(file_name){
	//it will create the histogram edges X subgraphId in circle_plot
	
	
var margin = {top: 20, right: 20, bottom: 90, left: 40},
    width = 850 - margin.left - margin.right, //500
    height = 400 - margin.top - margin.bottom;//200


var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .5, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left") ;

var svg = d3.select("#hesid").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var data_subgraph_id1 = new Array();  
//this array will receive the subgraph_id of the json file, exemplo -> [1,3,2,4,1,1,3,4,4,4,2] .
//Next it will be sorted,  exemplo -> [1,1,1,2,2,3,3,4,4,4]

var data_subgraph_id2 = new Array();  
//this array will receive small array from data_subgraph_id1.
//the lenght the each sub-array represent the number the edges in a subgraph, 
//exemplo -> [[1,1,1],[2,2],[3,3],[4,4,4]], in this array the 1ª element is the subgraph 1 and has 3 edges.    
	
d3.json(file_name, function(json) {
   
 json.nodes.forEach( function(d) {  data_subgraph_id1.push(d.subgraph_id); } );  //-> [1,3,2,4,1,1,3,4,4,4,2]
 	
 data_subgraph_id1.sort(function(a, b){ //-> [1,1,1,2,2,3,3,4,4,4]
   return a > b? 1 : 0; 
});
 

create_data_subgraph_id2()

function create_data_subgraph_id2(){
	//this function will create the array data_subgraph_id2 from data_subgraph_id1,
	//exemplo: [1,1,1,2,2,3,3,4,4,4] -> [[1,1,1],[2,2],[3,3],[4,4,4]].
	
	var max=d3.max(data_subgraph_id1, function(d) { return d; });
	var min=d3.min(data_subgraph_id1, function(d) { return d; });
	var li, ary;

	while(min<max ){
		
		li=data_subgraph_id1.lastIndexOf(min);
		ary=data_subgraph_id1.splice(0,li+1);
		data_subgraph_id2.push(ary);
		min=d3.min(data_subgraph_id1, function(d) { return d; })
		
	}
	data_subgraph_id2.push(data_subgraph_id1);
	
}

var data_obj=[]; //array with obj. with the couple egds and subgraph_id

function creat_obj(subgraph_id,edgs ){
	//function to create the obj. with the couple egds and subgraph_id
	var obj={};
	obj.n_subgraph_id  = subgraph_id;
	obj.n_edgs  =edgs;
	return obj;
}

for (var i=0;i<data_subgraph_id2.length;i++ ){
 	// from data_subgraph_id2 we will create a array with obj. with the couple egds and subgraph_id
 	 
 	data_obj.push(creat_obj(data_subgraph_id2[i][0],data_subgraph_id2[i].length-1));
 }
  


  x.domain(data_obj.map(function(d) { return d.n_subgraph_id; }));
  y.domain([0, d3.max(data_obj, function(d) { return d.n_edgs; })]);


  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
      
      svg.append("text")
     // .attr("transform", "rotate(-90)")
      .attr("y", 330)
      .attr("x", 400)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Subgraph_id");

  		// now rotate text on x axis
        // first move the text left so no longer centered on the tick
        // then rotate up to get 90 degrees.
svg.selectAll(".x text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
             return "translate(" + this.getBBox().height*-1 + "," + this.getBBox().height*1 + ")rotate(-90)";
         });    


  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Nº Edges");
      

  svg.selectAll(".bar")
      .data(data_obj)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.n_subgraph_id); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.n_edgs); })
      .attr("height", function(d) { return height - y(d.n_edgs); });

 svg.selectAll(".bar")  //show degree as tooltip - title
       .data(data_obj)
	  .append("title")
      .text(function(d) { return d.n_edgs; });  
      
 svg.selectAll(".text_b")
			   .data(data_obj)
			   .enter()
			   .append("text") 
			   .attr("class", "text_b")
			   .text(function(d) { return d.n_edgs; })
			  // .attr("text-anchor", "middle")
			   .attr("x",function(d) { return x(d.n_subgraph_id); })
			   .attr("y",function(d) { return y(d.n_edgs+0.5); })
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", "black")
			   ;     


});

}
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ histogram edges X subgraph_id ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^






// -------------------------------- histogram degree X SNPs ----------------------------------------

function histogram_degree_SNPs(file_name,subgraph_id){
	//it will create the histogram degree X SNPs in circle_plot
var margin = {top: 20, right: 20, bottom: 120, left: 40},
    width = 850 - margin.left - margin.right, //500
    height = 400 - margin.top - margin.bottom;//200


var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .5, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    ;

var svg = d3.select("#hc").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var data = new Array();
var allNodes= new Array();
var data_weight_pvalue= new Array();
		
	
d3.json(file_name, function(json) {
   

 json.nodes.forEach( 	function(d) { 
 	
 	
 	if(d.subgraph_id===subgraph_id){
 	data.push(d); 
 	}
 	
 	}    );		
 

//d.label

  x.domain(data.map(function(d) { return "chr"+d.chrom+':'+d.bp_position; }));
  y.domain([0, d3.max(data, function(d) { return d.degree; })]);




  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
      
 svg.append("text")
     // .attr("transform", "rotate(-90)")
      .attr("y", 365)
      .attr("x", 400)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("SNPs");

		// now rotate text on x axis
        // first move the text left so no longer centered on the tick
        // then rotate up to get 90 degrees.
svg.selectAll(".x text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
             return "translate(" + this.getBBox().height*-1 + "," + this.getBBox().height*4 + ")rotate(-90)";
         });



  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Degree");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x("chr"+d.chrom+':'+d.bp_position); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.degree); })
      .attr("height", function(d) { return height - y(d.degree); });
      
   svg.selectAll(".bar")  //show degree as tooltip - title
       .data(data)
	  .append("title")
      .text(function(d) { return "chr"+d.chrom+':'+d.bp_position+" ; "+d.degree; });     
      

  d3.select("#cb").on("change", change);
/*
  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);
*/
  function change() {
  //  clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked 
        ? function(a, b) { return b.degree - a.degree; }
        : function(a, b) { return d3.ascending("chr"+a.chrom+':'+a.bp_position, "chr"+b.chrom+':'+b.bp_position); })
        .map(function(d) { return "chr"+d.chrom+':'+d.bp_position; }))
        .copy();

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0("chr"+d.chrom+':'+d.bp_position); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }
});

}

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ histogram degree X SNPs ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
