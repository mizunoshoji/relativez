// ネットワークグラフ練習
var width, height, simulation, svg

width = 960
height = 800

svg = d3.select('#desktop-app')
  .append('div')
  .attr('id', 'vis')
  .append('svg')
  .attr('width', width)
  .attr('height', '100vh')

// データソース読み込み
Promise.all([
  d3.csv('data/relativez_データソース - 文献表_開発用.csv'),
  d3.csv('data/relativez_データソース - 引用関係表_開発用.csv')
]).then(function(data) {
  nodes = data[0]
  links = data[1]

  // 物理シミュレーションのセッティング
  var simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink().links(links).id(function(n) { return n.node_id }).distance(200))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  // シミュレーションのステップごとに実行する
  function ticked() {
    link.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + 
          d.source.x + "," + 
          d.source.y + "A" + 
          dr + "," + dr + " 0 0,1 " + 
          d.target.x + "," + 
          d.target.y;
    })

    node
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')' })
  }
  
  // arrow-head
  svg.append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('refX', 17)
    .attr('refY', 5.8)
    .attr('markerWidth', 28)
    .attr('markerHeight', 28)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
    .style('fill', '#444')
  // mouse entered version
  // 引用線用
  d3.select('defs')
    .append('marker')
    .attr('id', 'arrow-mouse-entered-citation')
    .attr('refX', 18)
    .attr('refY', 5.8)
    .attr('markerWidth', 28)
    .attr('markerHeight', 28)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
    .style('fill', '#ff66cc')
  // 被引用線用
  d3.select('defs')
    .append('marker')
    .attr('id', 'arrow-mouse-entered-citedby')
    .attr('refX', 18)
    .attr('refY', 5.8)
    .attr('markerWidth', 28)
    .attr('markerHeight', 28)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
    .style('fill', '#ffcc00')

  // link
  var link = svg.selectAll('.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('stroke-width', 1.5)
    .style('stroke', '#444')
    .attr('stroke-opacity', 0.7)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#arrow)')
  
  // node
  var node = svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    )
    .on('mouseenter', mouseentered)
    .on('mouseleave', mouseleaved)

    node.append('circle')
      .attr('r','10')
      .attr('fill', '#666')
  
  node.append('text')
    .attr('dx', -30)
    .attr('dy', -16)
    .attr('font-size', 12)
    .attr('fill', '#CCC')
    .text(function(d) { return d.author + '(' + d.year + ')'})
  
  // 隣接ノードか調べるためのmap
  var linkedByIndex = {}
  links.forEach(function(d) {
    linkedByIndex[d.source.index + ',' + d.target.index] = 1
  })

  // 2つのnodeが隣接するか
  function neighboring(a, b) {
    return linkedByIndex[a.index + `,` + b.index] || linkedByIndex[b.index + `,` + a.index]
  }
  // 引用関係の隣接するnode
  function neighboringCitation(a, b) {
    return linkedByIndex[a.index + `,` + b.index]
  }
  // 被引用関係の隣接するnode
  function neighboringCitedBy(a, b) {
    return linkedByIndex[b.index + `,` + a.index]
  }
  
  // drag
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // mouse
  function mouseentered(event, d) {
    // eventはMouseEvent, dはmouseがenterしたnode object {node_id:"23", ... }, thisはDOM要素<g class="node">, lはlink object
    
    
    link.style('stroke', function(l) {
      if (d === l.source)
        // 引用関係
        return '#ff66cc'
      else if (d === l.target)
        // 被引用関係
        return '#ffcc00'
      else
        return '#444'
      })
    
    link.attr('marker-end', function(l) {
      if (d === l.source)
        return 'url(#arrow-mouse-entered-citation)'
      else if (d === l.target)
        return 'url(#arrow-mouse-entered-citedby)'
      else
        return 'url(#arrow)'
    })

    // node.select('circle')
    //   .attr('stroke', function(n) {
    //     if (neighboringCitation(d, n))
    //       return '#ff66cc'
    //     else if (neighboringCitedBy(d, n))
    //       return '#ffcc00'
    //     else
    //       return 'none'
    //   })
    //   .attr('stroke-width', function(n) {
    //     if (neighboring(d, n))
    //       return 4
    //     else
    //       return 0
    //   })
    node.select('circle')
      .attr('stroke', function(n) {
        if (neighboring(d, n)) {
          return '#FFF'
        }
      })
      .attr('stroke-width', function(n) {
        if (neighboring(d,n)) {
          return 2
        }
      })

    node.style('opacity', function(n) {
      return neighboring(d, n) ? 1 : 0.2
    })

    d3.select(this).select('circle')
    .attr('fill', '#222')
    .attr('stroke-width', 4)
    .attr('stroke', '#FFF')
    
    d3.select(this).style('opacity', 1)
  }

  function mouseleaved(d, i) {
    link.style('stroke', '#444').attr('marker-end', 'url(#arrow)')
    d3.select(this).select('circle')
      .attr('fill', '#666')
      .attr('stroke-width', 0)
    node.select('circle').attr('stroke', 'none').attr('stroke-width', 0)
    node.style('opacity', 1)
  }

}).catch(function(error) {
  console.log(error)
})


  

