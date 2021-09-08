$(function() {
var clientWidth, clientHeight, svg, zoom, graphScale, adjustLayout,
    keepedGraphState = '';

var clientWidth = document.documentElement.clientWidth;
var clientHeight = document.documentElement.clientHeight;

// SVG graph group
var svg = d3.select('#vis').append('svg').append('g');

// arrow-head デフォルト
svg.append('defs').append('marker').attr('id', 'arrow').attr('refX', 16).attr('refY', 5.8).attr('markerWidth', 28).attr('markerHeight', 28).attr('orient', 'auto').append('path').attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2').style('fill', '#444');
// arrow-head 引用線用
d3.select('defs').append('marker').attr('id', 'arrow-citation').attr('refX', 16).attr('refY', 5.8).attr('markerWidth', 28).attr('markerHeight', 28).attr('orient', 'auto').append('path').attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2').style('fill', '#c44caa');
// arrow-head 被引用線用
d3.select('defs').append('marker').attr('id', 'arrow-cited-by').attr('refX', 16).attr('refY', 5.8).attr('markerWidth', 28).attr('markerHeight', 28).attr('orient', 'auto').append('path').attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2').style('fill', '#bfa925');

// 初期グラフ表示
Promise.all([
  d3.blob('data/initial_graph_nodes.csv'),
  d3.blob('data/initial_graph_links.csv')
]).then(function(blob) {
  const nodeObjUrl = URL.createObjectURL(blob[0]);
  const linksObjUrl = URL.createObjectURL(blob[1]);
  createGraph(nodeObjUrl, linksObjUrl);
  // todo: revoke ObjUrl
}).catch(function(error){
  console.log(error);
});

// Zoom & Pan
zoom = d3.zoom()
  .scaleExtent([0.1, 20])
  .on('zoom', handleZoom);

function initZoom() {
  if(keepedGraphState === '') {
    svg.attr('transform', 'translate(' + clientWidth * adjustLayout + ', ' + clientHeight * adjustLayout + ') scale(' + graphScale + ')');
  } else {
    svg.attr('transform', keepedGraphState);
  }

  d3.select('svg').call(zoom);
}

function handleZoom(e) {
    d3.select('svg g').attr('transform', e.transform);
    d3.select('svg g').attr('transform', e.transform + 'translate(' + clientWidth * adjustLayout + ', ' + clientHeight * adjustLayout + ') scale(' + graphScale + ')');
}

/* 
 * createGraph関数
 * @param 
 */
function createGraph(nodesObjUrl, linksObjUrl) {
  Promise.all([
    d3.csv(nodesObjUrl),
    d3.csv(linksObjUrl)
  ]).then(function(data) {
    URL.revokeObjectURL(nodesObjUrl);
    URL.revokeObjectURL(linksObjUrl);

    nodes = data[0];
    links = data[1];
    
    var nodeLength = nodes.length;

    // scale change
    if (nodeLength <= 100) {
      graphScale = '1';
      adjustLayout = 0;
    } else if (nodeLength <= 550) {
      graphScale = '.45';
      adjustLayout = 0.25;
    }

    initZoom();

    // simulation
    var simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink().links(links).id(function(n) { return n.node_id }).distance(200))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(clientWidth / 2, clientHeight / 2))
      .force('collige', d3.forceCollide().radius(60).strength(1).iterations(5))
      .velocityDecay(0.4)
      .alphaMin(0.2)
      .on('tick', ticked);
    
    // tick
    function ticked() {
      link.attr('d', function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return 'M' + 
          d.source.x + ',' + 
          d.source.y + 'A' + 
          dr + ',' + dr + ' 0 0,1 ' + 
          d.target.x + ',' + 
          d.target.y;
      });
      
      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    }

    // SVG link
    link = svg.selectAll('.link').data(links);

    link.exit().remove();

    linkEnter = link.enter()
      .append('path')
      .attr('class', 'link')
      .attr('stroke-width', 2)
      .style('stroke', '#444')
      .attr('stroke-opacity', 0.7)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)')

    link = linkEnter.merge(link);
    
    // SVG node
    node = svg.selectAll('.node').data(nodes);

    // move update selection nodes to the front
    $('.node').appendTo('#vis > svg > g');

    node.exit().remove();

    nodeEnter = node.enter().append('g')
      .attr('class', 'node');

    nodeEnter.append('circle')
      .attr('r','10')
      .attr('fill', '#666')
      .style('z-index', '2');
      
    nodeEnter.append('text')
    .attr('dx', -30)
    .attr('dy', -16)
    .attr('font-size', 12)
    .attr('fill', '#eaeaea')
    .text(function(d) { return d.author + '(' + d.year + ')'});

    node = nodeEnter.merge(node);

    node.select('text').text(function(d) { return d.author + '(' + d.year + ')'});
      
    node.select('circle')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
    
    node.on('click', nodeClick);

    node.call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
        );
        
    // define tooltip
    var tip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    
    // 隣接ノードか調べるためのmap
    var linkedByIndex = {};
    links.forEach(function(d) {
      linkedByIndex[d.source.index + ',' + d.target.index] = 1;
    })

    resetGreph();

    $('.modal, .filter').fadeOut(200);

    function resetGreph() {
      d3.select('#selected-node').attr('id', null);
      node.style('opacity', 1).select('circle').attr('stroke', 'none').attr('stroke-width', 0);
      node.select('circle').attr('fill', '#666');
      link.style('stroke', '#444').attr('marker-end', 'url(#arrow)');
      d3.select('.list-current-item li').html('');
      d3.select('.list-items-cited-by').html('');
      d3.select('.list-items-citation').html('');
    }

    // 2つのnodeが隣接するか
    function neighboring(a, b) {
      return linkedByIndex[a.index + `,` + b.index] || linkedByIndex[b.index + `,` + a.index];
    }
    // 引用関係の隣接するnode
    function neighboringCitation(a, b) {
      return linkedByIndex[a.index + `,` + b.index];
    }
    // 被引用関係の隣接するnode
    function neighboringCitedBy(a, b) {
      return linkedByIndex[b.index + `,` + a.index];
    }

    // イベント関数
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).velocityDecay(1).restart();
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
  
    function nodeClick(event, d) {
      if (this.id === 'selected-node') {
        resetGreph();
        return
      }
  
      // 選択ノード変更前のリセット処理
      d3.select('#selected-node').attr('id', null);
      node.select('circle').attr('fill', '#666');
      
      var propCitationCheckBox = $('#highlight-citation-link').prop('checked');
      var propCitedByChechBox = $('#hightlight-cited-by-link').prop('checked');
      
      // 関連リンクをハイライト
      link.style('stroke', function(l) {
        if (d === l.source && propCitationCheckBox)
          // 引用関係
          return '#c44caa';
        else if (d === l.target && propCitedByChechBox)
          // 被引用関係
          return '#bfa925';
        else
          return '#444';
      })
      
      link.attr('marker-end', function(l) {
        if (d === l.source && propCitationCheckBox)
          return 'url(#arrow-citation)';
        else if (d === l.target && propCitedByChechBox)
          return 'url(#arrow-cited-by)';
        else
          return 'url(#arrow)';
      })
  
      link.attr('data-linkType', function(l) {
        if (d === l.source)
          return 'citation';
        else if (d === l.target)
          return 'cited-by';
      })
  
      // 隣接ノードをハイライト
      node.select('circle')
        .attr('stroke', function(n) {
          if (neighboring(d, n)) {
            return '#eaeaea';
          }
        })
        .attr('stroke-width', function(n) {
          if (neighboring(d,n)) {
            return 2;
          }
        })
  
      node.style('opacity', function(n) {
        return neighboring(d, n) ? 1 : 0.4;
      })
  
      // 選択中ノードをハイライト
      d3.select(this).select('circle')
      .attr('fill', '#4169e1')
      .attr('stroke-width', 4)
      .attr('stroke', '#eaeaea');
      
      // 選択中ノードにid付与
      d3.select(this).style('opacity', 1)
        .attr('id', 'selected-node');
  
      // 現在の文献データを表示  
      showCurrentText(d);
      // 引用文献リスト表示
      showCitationText(d);
      // 被引用文献リスト表示
      showCitedByText(d);
    }
  
    function mouseover(event, d) {
      tip.style('opacity', 1)
        .html(d.title)
        .style('left', (event.pageX + 6) + 'px')
        .style('top', (event.pageY + 6) + 'px');
    }
  
    function mouseout(event, d) {
      tip.style('opacity', 0);
    }
  
    function showCurrentText(d) {
      var currentText;
      currentText = '<div class="text-title">タイトル : ' + d.title + '</div>';
      currentText += '<div>著者 : ' + d.author + '</div>';
      currentText += '<div>発行年 : ' + d.year + '</div>';
      currentText += '<div>原著 : ' + d.original_work + '</div>'; 
      currentText += '<div>翻訳者 : ' + d.translator + '</div>';
      currentText += '<div>掲載元 : ' + d.publication_detail + '</div>'; 
      currentText += '<div>発行所 : ' + d.publisher + '</div>';
      currentText += '<div>その他 : ' + d.others + '</div>';
  
      d3.select('.list-current-item li').html(currentText);
    }
  
    function showCitationText(d) {
      d3.select('.list-items-citation').html('');
  
      nodes.forEach(function(n) {
        if (neighboringCitation(d, n)) {
          var citationText;
          citationText = '<div class="text-title">タイトル : ' + n.title + '</div>';
          citationText += '<div>著者 : ' + n.author + '</div>';
          citationText += '<div>発行年 : ' + n.year + '</div>';
          citationText += '<div>原著 : ' + n.original_work + '</div>';
          citationText += '<div>翻訳者 : ' + n.translator + '</div>';
          citationText += '<div>掲載元 : ' + n.publication_detail + '</div>';
          citationText += '<div>発行所 : ' + n.publisher + '</div>';
          citationText += '<div>その他 : ' + n.others + '</div>';
  
          d3.select('.list-items-citation').append('li').html(citationText);
        }
      })
    }
  
    function showCitedByText(d) {
      d3.select('.list-items-cited-by').html('');
  
      nodes.forEach(function(n) {
        if (neighboringCitedBy(d, n)) {
          var citedByText;
          citedByText = '<div class="text-title">タイトル : ' + n.title + '</div>';
          citedByText += '<div>著者 : ' + n.author + '</div>';
          citedByText += '<div>発行年 : ' + n.year + '</div>';
          citedByText += '<div>原著 : ' + n.original_work + '</div>';
          citedByText += '<div>翻訳者 : ' + n.translator + '</div>';
          citedByText += '<div>掲載元 : ' + n.publication_detail + '</div>'; 
          citedByText += '<div>発行所 : ' + n.publisher + '</div>';
          citedByText += '<div>その他 : ' + n.others + '</div>';
  
          d3.select('.list-items-cited-by').append('li').html(citedByText);
        }
      })
    }

  // 選択解除ボタン
  $('.reset-selected-node').on('click', resetGreph);
  
  }).catch(function(error) {
    console.log(error);
  })
}

  // タブリスト
  $('.tabs a').on('click', function(){
    $(this).preventDefault();
  })

  $('.tabs-list li').on('click', function(){
    var tabid = $(this).attr('data-tab');
    $('.tabs-list li, tab').removeClass('active');
    $('.tab').hide();
    $(tabid).show();
    $(this).addClass('active');
  })

  $('input[name="highlight-citation-link"]').on('change', function() {
    var propCitationCheckBox = $('#highlight-citation-link').prop('checked');

    if (propCitationCheckBox)
      d3.selectAll('[data-linkType="citation"]')
        .style('stroke', '#c44caa')
        .attr('marker-end', 'url(#arrow-citation)');
    else
      d3.selectAll('[data-linkType="citation"]')
        .style('stroke', '#444')
        .attr('marker-end', 'url(#arrow)');
  });

  $('input[name="hightlight-cited-by-link"]').on('change', function() {
    var propCitedByChechBox = $('#hightlight-cited-by-link').prop('checked');

    if (propCitedByChechBox)
      d3.selectAll('[data-linkType="cited-by"]')
        .style('stroke', '#bfa925')
        .attr('marker-end', 'url(#arrow-cited-by)');
    else
      d3.selectAll('[data-linkType="cited-by"]')
        .style('stroke', '#444')
        .attr('marker-end', 'url(#arrow)');
  });

  // ファイル入力　モーダルウィンドウ
  $('.open-modal').on('click', function() {
    $('.filter, .modal').fadeIn(200);
  });

  $('.modal-close').on('click', function() {
    $('.modal, .filter').fadeOut(200);
  });

  $('#nodes-input .file-select-btn').on('click', function() {
    $('#nodes-input .file-selector').click();
  });

  $('#links-input .file-select-btn').on('click', function() {
    $('#links-input .file-selector').click();
  });

  // input csv file
  $('.file-selector').on('change', onChangeFileInput);
  $('#create-graph-btn').on('click', onClickCreateGraph);

  function onChangeFileInput() {
    let inputId = $(this).parent().attr('id');
    let files = this.files;
    let file = files[0];

    $('#' + inputId + ' .error-msg-box').empty();
    $('#' + inputId + ' .file-data').empty();

    if (files.length === 0) {
      let tableName = (inputId === 'nodes-input') ? '文献表': '引用関係表';
      errorMsg = tableName + 'ファイルを選択してください。';
      $('#' + inputId + ' .error-msg-box').text(errorMsg);
    } else {
      if (file.name.endsWith('.csv')) {
        $('#' + inputId + ' .file-data').html(function() {
          fileData = '<div>ファイル名 : ' + file.name + '</div>' + 
                     '<div>ファイルサイズ : ' + returnFileSize(file.size) + '</div>';
          return fileData
        });
      } else {
        errorMsg = '入力不可能なファイル形式です。カンマ区切り形式のファイル(.csv)を選択してください。';
        $('#' + inputId + ' .error-msg-box').text(errorMsg);
      }
    }
  }

  function returnFileSize(number) {
    if(number < 1024) {
      return number + 'bytes';
    } else if(number >= 1024 && number < 1048576) {
      return (number/1024).toFixed(1) + 'KB';
    } else if(number >= 1048576) {
      return (number/1048576).toFixed(1) + 'MB';
    }
  }
  
  function onClickCreateGraph() {
    var nodesFileInput = $('#nodes-input .file-selector').get(0);
    var linksFileInput = $('#links-input .file-selector').get(0);
    var nodesFile = nodesFileInput.files[0];
    var linksFile = linksFileInput.files[0];
    
    if (nodesFileInput.files.length === 0) {
      errorMsg = '文献表ファイルを選択してください。';
      $('#nodes-input .error-msg-box').text(errorMsg);
      return;
    } else if (linksFileInput.files.length === 0) {
      errorMsg = '引用関係表ファイルを選択してください。';
      $('#links-input .error-msg-box').text(errorMsg);
      return;
    }    
    
    const nodesPromise = nodesFile.text();
    const linksPromise = linksFile.text();
    
    Promise.all([nodesPromise,linksPromise]).then(function(fileText){
      
      const nodesText = fileText[0];
      const linksText = fileText[1];
      
      if (!nodesText.startsWith('node_id,title,author,year,translator,original_work,publisher,publication_detail,others')) {
        errorMsg = '文献表ファイルのCSVデータ構造に問題があります。正しいデータ構造の文献表ファイルを入力してください。';
        $('#nodes-input .error-msg-box').text(errorMsg);
        throw 'csv data format error.';
      } else if (!linksText.startsWith('source,source_title,target,target_title')) {
        errorMsg = '引用関係表ファイルのCSVデータ構造に問題があります。正しいデータ構造の引用関係表ファイルを入力してください。';
        $('#links-input .error-msg-box').text(errorMsg);
        throw 'csv data format error.';
      }
      
      var nodesObjUrl = URL.createObjectURL(nodesFile);
      var linksObjUrl = URL.createObjectURL(linksFile);

      createGraph(nodesObjUrl, linksObjUrl);
    
    }).catch(function(error) {
      console.log(error);
    })
  }
})
