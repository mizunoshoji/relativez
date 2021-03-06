/* eslint-env jquery */
'use strict'
window.$ = window.jQuery = require('jquery')
// eslint-disable-next-line no-unused-vars
const modal = require('./modal.js')
// eslint-disable-next-line no-unused-vars
const responsive = require('./responsive.js')

$(function () {
  let metaDataSelection
  d3.json('data/data_selection.json')
    .then(function (data) {
      metaDataSelection = data
      createDataOptions(metaDataSelection)
    })
    .catch(function (error) {
      console.log(error)
    })

  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight

  let graphScale
  let adjustLayout

  const COLOR = {
    NODE_INIT: '#666',
    LINK_INIT: '#444',
    CITATION: '#c44caa',
    CITEDBY: '#bfa925',
    WHITE: '#eaeaea',
    BLUE: '#4169e1',
    RED: '#ff4500'
  }

  const zoom = d3.zoom().scaleExtent([0.1, 20]).on('zoom', handleZoom)
  const svg = d3.select('#vis').append('svg').append('g')

  createArrow(svg)

  Promise.all([
    d3.blob('data/art_expression_and_appreciation_.v01 - 文献表.csv'),
    d3.blob('data/art_expression_and_appreciation_.v01 - 引用関係表.csv')
  ])
    .then(function (blob) {
      const nodeObjUrl = URL.createObjectURL(blob[0])
      const linksObjUrl = URL.createObjectURL(blob[1])
      createGraph(nodeObjUrl, linksObjUrl)
    })
    .catch(function (error) {
      console.log(error)
    })

  $('#header-menu-donate').on('click', function () {
    $('#donate-link')[0].click()
  })

  $('#side-bar-switcher-hide').on('click', function () {
    $('.list-column').css({
      left: '-320px',
      transition: 'left 0.3s'
    })
    $('#side-bar-switcher-hide').hide()
    $('#side-bar-switcher-show').show()
  })

  $('#side-bar-switcher-show').on('click', function () {
    $('.list-column').css({
      left: '16px',
      transition: 'left 0.3s'
    })
    $('#side-bar-switcher-show').hide()
    $('#side-bar-switcher-hide').show()
  })

  $('#tabs-list-cited-by').on('click', function () {
    $('.tabs-list li, tab').removeClass('active')
    $('.tab').hide()
    $('#tab-cited-by').show()
    $(this).addClass('active')
  })

  $('#tabs-list-citation').on('click', function () {
    $('.tabs-list li, tab').removeClass('active')
    $('.tab').hide()
    $('#tab-citation').show()
    $(this).addClass('active')
  })

  // 引用線・被引用線のハイライト表示切り替え
  $('input[name="highlight-citation-link"]').on('change', function () {
    const propCitationCheckBox = $('#highlight-citation-link').prop('checked')
    if (propCitationCheckBox) {
      d3.selectAll('[data-linkType="citation"]')
        .style('stroke', COLOR.CITATION)
        .attr('marker-end', 'url(#arrow-citation)')
    } else {
      d3.selectAll('[data-linkType="citation"]').style('stroke', COLOR.LINK_INIT).attr('marker-end', 'url(#arrow)')
    }
  })
  $('input[name="hightlight-cited-by-link"]').on('change', function () {
    const propCitedByChechBox = $('#hightlight-cited-by-link').prop('checked')
    if (propCitedByChechBox) {
      d3.selectAll('[data-linkType="cited-by"]')
        .style('stroke', COLOR.CITEDBY)
        .attr('marker-end', 'url(#arrow-cited-by)')
    } else {
      d3.selectAll('[data-linkType="cited-by"]').style('stroke', COLOR.LINK_INIT).attr('marker-end', 'url(#arrow)')
    }
  })

  $('#nodes-input .file-select-btn').on('click', function () {
    $('#nodes-input .file-selector').trigger('click')
  })
  $('#links-input .file-select-btn').on('click', function () {
    $('#links-input .file-selector').trigger('click')
  })

  $('#show-selected-graph-btn').on('click', showSelectedGraph)
  $('.file-selector').on('change', onChangeFileInput)
  $('#create-graph-btn').on('click', onClickCreateGraph)

  /**
   * 選択されたデータソースからグラフを作成する。
   * @global
   * */
  function showSelectedGraph() {
    const keyName = $('#data-selection').val()
    Promise.all([d3.blob(metaDataSelection[keyName].nodes_path), d3.blob(metaDataSelection[keyName].links_path)])
      .then(function (blob) {
        const nodeObjUrl = URL.createObjectURL(blob[0])
        const linksObjUrl = URL.createObjectURL(blob[1])
        createGraph(nodeObjUrl, linksObjUrl)
        if (document.documentElement.clientWidth <= 980) {
          $('#mobile-menu-close-btn').trigger('click')
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  /**
   * インプットされたファイルの名前とサイズを表示する。
   * @global
   */
  function onChangeFileInput() {
    const inputId = $(this).parent().attr('id')
    const files = this.files
    const file = files[0]

    $('.modal')
      .find('#' + inputId)
      .children('.error-msg-box')
      .empty()
    $('.modal')
      .find('#' + inputId)
      .children('.file-data')
      .empty()

    if (file.name.endsWith('.csv')) {
      $('.modal')
        .find('#' + inputId)
        .children('.file-data')
        .append($('<div></div>').text(`ファイル名 : ${file.name}`))
        .append($('<div></div>').text(`ファイルサイズ : ${returnFileSize(file.size)}`))
    } else {
      const errorMsg = '入力不可能なファイル形式です。カンマ区切り形式のファイル(.csv)を選択してください。'
      $('.modal')
        .find('#' + inputId)
        .children('.error-msg-box')
        .text(errorMsg)
    }
  }

  /**
   * byte単位で表されたデータ容量をKB、MB単位に変換する。
   * @param {Number} number byte単位のファイルサイズ
   * @return {String} KBまたはMB単位に変換されたファイルサイズ
   * @global
   */
  function returnFileSize(number) {
    if (number < 1024) {
      return `${number} bytes`
    } else if (number >= 1024 && number < 1048576) {
      return `${(number / 1024).toFixed(1)} KB`
    } else if (number >= 1048576) {
      return `${(number / 1048576).toFixed(1)} MB`
    }
  }

  /**
   * 入力されたファイルを検証してグラフを作成する。
   * @throws {Error} csv data format error.
   * @global
   */
  function onClickCreateGraph() {
    const nodesFileInput = $('#nodes-input .file-selector').get(0)
    const linksFileInput = $('#links-input .file-selector').get(0)
    const nodesFile = nodesFileInput.files[0]
    const linksFile = linksFileInput.files[0]

    if (nodesFileInput.files.length === 0) {
      const errorMsg = '文献表ファイルを選択してください。'
      $('#nodes-input .error-msg-box').text(errorMsg)
      return
    } else if (linksFileInput.files.length === 0) {
      const errorMsg = '引用関係表ファイルを選択してください。'
      $('#links-input .error-msg-box').text(errorMsg)
      return
    }

    if (nodesFile.size >= 1048576) {
      const errorMsg = 'ファイルサイズは1MB未満にしてください。'
      $('#nodes-input .error-msg-box').text(errorMsg)
      return
    } else if (linksFile.size >= 1048576) {
      const errorMsg = 'ファイルサイズは1MB未満にしてください。'
      $('#links-input .error-msg-box').text(errorMsg)
      return
    }

    const nodesPromise = nodesFile.text()
    const linksPromise = linksFile.text()

    Promise.all([nodesPromise, linksPromise])
      .then(function (fileText) {
        const nodesText = fileText[0]
        const linksText = fileText[1]

        if (
          !nodesText.startsWith(
            'node_id,title,author,year,translator,original_work,publisher,publication_detail,link_text_1,link_url_1,link_text_2,link_url_2,link_text_3,link_url_3,others'
          )
        ) {
          const errorMsg =
            '文献表ファイルのCSVデータ構造に問題があります。正しいデータ構造の文献表ファイルを入力してください。'
          $('#nodes-input .error-msg-box').text(errorMsg)
          throw new Error('csv data format error.')
        } else if (!linksText.startsWith('source,source_title,target,target_title')) {
          const errorMsg =
            '引用関係表ファイルのCSVデータ構造に問題があります。正しいデータ構造の引用関係表ファイルを入力してください。'
          $('#links-input .error-msg-box').text(errorMsg)
          throw new Error('csv data format error.')
        }

        const nodesObjUrl = URL.createObjectURL(nodesFile)
        const linksObjUrl = URL.createObjectURL(linksFile)

        createGraph(nodesObjUrl, linksObjUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  /**
   * ネットワークグラフを作成するメイン処理。
   * @param {String} nodesObjUrl nodesデータのBlobを参照するオブジェクトURL
   * @param {String} linksObjUrl linksデータのBlobを参照するオブジェクトURL
   * @global
   */
  function createGraph(nodesObjUrl, linksObjUrl) {
    Promise.all([d3.csv(nodesObjUrl), d3.csv(linksObjUrl)])
      .then(function (data) {
        URL.revokeObjectURL(nodesObjUrl)
        URL.revokeObjectURL(linksObjUrl)

        let nodes = data[0]
        const links = data[1]

        validateData(nodes, links)

        nodes = addCharToYear(nodes)

        // グラフのスケールと表示位置の調整用
        if (nodes.length <= 100) {
          graphScale = '1'
          adjustLayout = 0
        } else if (nodes.length <= 550) {
          graphScale = '.5'
          adjustLayout = 0.25
        }

        d3.select('svg').call(zoom.transform, d3.zoomIdentity)
        initZoom()

        const simulation = d3
          .forceSimulation(nodes)
          .force(
            'link',
            d3
              .forceLink()
              .links(links)
              .id(function (n) {
                return n.node_id
              })
              .distance(200)
          )
          .force('charge', d3.forceManyBody().strength(-30))
          .force('center', d3.forceCenter(clientWidth * 0.5, clientHeight * 0.5))
          .force('collige', d3.forceCollide().radius(80).strength(1).iterations(4))
          .velocityDecay(0.3)
          .alphaMin(0.15)
          .on('tick', ticked)

        let link = svg.selectAll('.link').data(links)
        let node = svg.selectAll('.node').data(nodes)

        link.exit().remove()
        const linkEnter = link
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('stroke-width', 2)
          .style('stroke', COLOR.LINK_INIT)
          .attr('stroke-opacity', 0.7)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#arrow)')
        link = linkEnter.merge(link)

        // move update selection nodes to the front
        $('.node').appendTo('#vis > svg > g')

        node.exit().remove()
        const nodeEnter = node
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('id', function (d) {
            return 'node-id-' + d.node_id
          })
        nodeEnter.append('circle').attr('r', '10').attr('fill', COLOR.NODE_INIT).style('z-index', '2')
        nodeEnter
          .append('text')
          .attr('dx', -30)
          .attr('dy', -16)
          .attr('font-size', 12)
          .attr('fill', COLOR.WHITE)
          .text(function (d) {
            const year = d.year_added_char ? d.year_added_char : d.year
            return d.author + '(' + year + ')'
          })
        node = nodeEnter.merge(node)
        node.select('text').text(function (d) {
          const year = d.year_added_char ? d.year_added_char : d.year
          return d.author + '(' + year + ')'
        })
        node.select('circle').on('mouseover', mouseover).on('mouseout', mouseout)
        node.on('click', onClickNode)
        node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

        const tip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

        // 隣接ノードか調べるためのmap
        const linkedByIndex = {}
        links.forEach(function (d) {
          linkedByIndex[d.source.index + ',' + d.target.index] = 1
        })

        resetGraphStyle(node, link)

        $('.modal, .filter').fadeOut(200)

        $('#reset-selected-node').on('click', resetGraphStyle.bind(null, node, link))

        function ticked() {
          link.attr('d', function (d) {
            const dx = d.target.x - d.source.x
            const dy = d.target.y - d.source.y
            const dr = Math.sqrt(dx * dx + dy * dy)
            return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y
          })

          node.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')'
          })
        }

        function mouseover(event, d) {
          tip
            .style('opacity', 1)
            .text(d.title)
            .style('left', event.pageX + 6 + 'px')
            .style('top', event.pageY + 6 + 'px')
        }

        function mouseout(event, d) {
          tip.style('opacity', 0)
        }

        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).velocityDecay(1).restart()
          d.fx = d.x
          d.fy = d.y
        }

        function dragged(event, d) {
          d.fx = event.x
          d.fy = event.y
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }

        function onClickNode(event, d) {
          if (this.id === 'selected-node') {
            resetGraphStyle(node, link)
            return
          }

          // リストと連動されたハイライト表示のために選択されたノードにnodeidを与え直す
          const currentNodeId = $('#list-items-current .text-title').data('nodeid')
          $('#selected-node').attr('id', 'node-id-' + currentNodeId)

          node.select('circle').attr('fill', COLOR.NODE_INIT)

          const propCitationCheckBox = $('#highlight-citation-link').prop('checked')
          const propCitedByChechBox = $('#hightlight-cited-by-link').prop('checked')

          // 関連リンク線をハイライト
          link.style('stroke', function (l) {
            if (d === l.source && propCitationCheckBox) {
              return COLOR.CITATION
            } else if (d === l.target && propCitedByChechBox) {
              return COLOR.CITEDBY
            } else {
              return COLOR.LINK_INIT
            }
          })
          link.attr('marker-end', function (l) {
            if (d === l.source && propCitationCheckBox) {
              return 'url(#arrow-citation)'
            } else if (d === l.target && propCitedByChechBox) {
              return 'url(#arrow-cited-by)'
            } else {
              return 'url(#arrow)'
            }
          })
          link.attr('data-linkType', function (l) {
            if (d === l.source) {
              return 'citation'
            } else if (d === l.target) {
              return 'cited-by'
            }
          })

          // 隣接ノードをハイライト
          node
            .select('circle')
            .attr('stroke', function (n) {
              if (neighboring(d, n)) {
                return COLOR.WHITE
              }
            })
            .attr('stroke-width', function (n) {
              if (neighboring(d, n)) {
                return 2
              }
            })
          node.style('opacity', function (n) {
            return neighboring(d, n) ? 1 : 0.4
          })

          // 選択中ノードをハイライト
          d3.select(this).select('circle').attr('fill', COLOR.BLUE).attr('stroke-width', 4).attr('stroke', COLOR.WHITE)

          d3.select(this).style('opacity', 1).attr('id', 'selected-node')

          $('.list-items').empty()

          showCurrentText(d)
          showCitationText(d)
          showCitedByText(d)

          // 文献リストとグラフノードの連動したハイライト表示用
          $('.text-title').on('mouseenter', function () {
            $(this).css({
              color: '#ff4500'
            })
            const focusedNodeId = $(this).data('nodeid')
            $(`#node-id-${focusedNodeId} circle`).attr({
              fill: '#ff4500',
              r: '16'
            })
          })

          $('.text-title').on('mouseleave', function () {
            $(this).css({
              color: COLOR.WHITE
            })
            const focusedNodeId = $(this).data('nodeid')
            $(`#node-id-${focusedNodeId} circle`).attr({
              fill: COLOR.NODE_INIT,
              r: '10'
            })
          })
        }

        function showCurrentText(d) {
          const textListItem = createListItems(d)
          $('#list-items-current').append(textListItem)
        }

        function showCitationText(d) {
          nodes.forEach(function (n) {
            if (neighboringCitation(d, n)) {
              const textListItem = createListItems(n)
              $('#tab-citation').append(textListItem)
            }
          })
        }

        function showCitedByText(d) {
          nodes.forEach(function (n) {
            if (neighboringCitedBy(d, n)) {
              const textListItem = createListItems(n)
              $('#tab-cited-by').append(textListItem)
            }
          })
        }

        /**
         * 2つのnodeが隣接するか調べる
         */
        function neighboring(a, b) {
          return linkedByIndex[a.index + ',' + b.index] || linkedByIndex[b.index + ',' + a.index]
        }
        /**
         * 2つの隣接するnodeが引用関係にあるか調べる
         */
        function neighboringCitation(a, b) {
          return linkedByIndex[a.index + ',' + b.index]
        }
        /**
         * 2つの隣接するnodeが被引用関係にあるか調べる
         */
        function neighboringCitedBy(a, b) {
          return linkedByIndex[b.index + ',' + a.index]
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  /**
   * データセットの検証をする。
   * @param {Object} nodes
   * @param {Object} links
   * @throws {Error} validation error.
   * @global
   */
  function validateData(nodes, links) {
    const nodesErrorMessages = []
    const linksErrorMessages = []
    const rules = {
      node_id: {
        regexp: /[0-9]/,
        error: 'node_idは数値で入力してください。'
      },
      title: {
        regexp: /^.{0,500}$/,
        error: 'title(文献名)は500文字以内で入力してください。'
      },
      author: {
        regexp: /^.{0,200}$/,
        error: 'author(著者)は200文字以内で入力してください。'
      },
      year: {
        regexp: /^.{0,4}$/,
        error: 'year(発行年)は4文字以内で入力してください。'
      },
      translator: {
        regexp: /^.{0,200}$/,
        error: 'translator(翻訳者)は200文字以内で入力してください。'
      },
      original_work: {
        regexp: /^.{0,500}$/,
        error: 'original_work(原著)は500文字以内で入力してください。'
      },
      publisher: {
        regexp: /^.{0,200}$/,
        error: 'publisher(発行所)は200文字以内で入力してください。'
      },
      publication_detail: {
        regexp: /^.{0,500}$/,
        error: 'publication_detail(掲載元)は500文字以内で入力してください。'
      },
      link_text_1: {
        regexp: /^.{0,140}$/,
        error: 'link_text_1(オンラインリンク文字列1)は140文字以内で入力してください。'
      },
      link_text_2: {
        regexp: /^.{0,140}$/,
        error: 'link_text_2(オンラインリンク文字列2)は140文字以内で入力してください。'
      },
      link_text_3: {
        regexp: /^.{0,140}$/,
        error: 'link_text_3(オンラインリンク文字列3)は140文字以内で入力してください。'
      },
      others: {
        regexp: /^.{0,140}$/,
        error: 'others(その他)は140文字以内で入力してください。'
      },
      source: {
        regexp: /[0-9]/,
        error: 'sourceは数値で入力してください。'
      },
      target: {
        regexp: /[0-9]/,
        error: 'targetは数値で入力してください。'
      }
    }

    $('.error-msg-box').empty()

    if (nodes.length > 550) {
      nodesErrorMessages.push(`文献数が多すぎます。現在の文献数は ${nodes.length} です。文献数は550件以下にしてください。'
      `)
    }

    for (let i = 0; i < nodes.length; i++) {
      if (!rules.node_id.regexp.test(nodes[i].node_id)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.node_id.error}`)
      }
      if (!rules.title.regexp.test(nodes[i].title)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.title.error}`)
      }
      if (!rules.author.regexp.test(nodes[i].author)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.author.error}`)
      }
      if (!rules.year.regexp.test(nodes[i].year)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.year.error}`)
      }
      if (!rules.translator.regexp.test(nodes[i].translator)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.translator.error}`)
      }
      if (!rules.original_work.regexp.test(nodes[i].original_work)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.original_work.error}`)
      }
      if (!rules.publisher.regexp.test(nodes[i].publisher)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.publisher.error}`)
      }
      if (!rules.publication_detail.regexp.test(nodes[i].publication_detail)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.publication_detail.error}`)
      }
      if (!rules.link_text_1.regexp.test(nodes[i].link_text_1)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.link_text_1.error}`)
      }
      if (!rules.link_text_2.regexp.test(nodes[i].link_text_2)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.link_text_2.error}`)
      }
      if (!rules.link_text_3.regexp.test(nodes[i].link_text_3)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.link_text_3.error}`)
      }
      if (!rules.others.regexp.test(nodes[i].others)) {
        nodesErrorMessages.push(`${i + 1} 行目のデータ : ${rules.others.error}`)
      }
    }

    for (let i = 0; i < links.length; i++) {
      if (!rules.source.regexp.test(links[i].source)) {
        linksErrorMessages.push(`${i + 1} 行目のデータ：' ${rules.source.error}`)
      }
      if (!rules.target.regexp.test(links[i].target)) {
        linksErrorMessages.push(`${i + 1} 行目のデータ：' ${rules.target.error}`)
      }
    }

    if (nodesErrorMessages.length || linksErrorMessages.length) {
      nodesErrorMessages.forEach(function (e) {
        $('#nodes-input .error-msg-box').append($('<p></p>').text(e))
      })
      linksErrorMessages.forEach(function (e) {
        $('#links-input .error-msg-box').append($('<p></p>').text(e))
      })
      throw new Error('validation error.')
    }
  }

  /**
   * 著者と発行年が同一の文献があれば発行年にアルファベットを付与したデータを追加する。
   * @param {Object} nodes 文献データ
   * @return {Object} year_added_charを追加した文献データ。
   * @example
   * author: "山田太郎", year: "1990", year_added_char: "1990 a"
   * author: "山田太郎", year: "1990", year_added_char: "1990 b"
   * @global
   */
  function addCharToYear(nodes) {
    const sameAuthorYearNodesSets = []
    let sameAuthorYearNodes = []
    let isCheckedNode = false
    const ALPHABETCHAR = []

    for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
      ALPHABETCHAR.push(String.fromCharCode(i))
    }

    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i].node_id
      const currentAuthor = nodes[i].author
      const currentYear = nodes[i].year
      sameAuthorYearNodes = []

      for (let j = 0; j < sameAuthorYearNodesSets.length; j++) {
        if (sameAuthorYearNodesSets[j].includes(nodeId)) {
          isCheckedNode = true
        } else {
          isCheckedNode = false
        }
      }

      if (isCheckedNode) {
        continue
      } else {
        nodes.forEach(function (node) {
          if (node.author === currentAuthor && node.year === currentYear) {
            sameAuthorYearNodes.push(node.node_id)
          }
        })

        if (sameAuthorYearNodes.length > 1) {
          sameAuthorYearNodesSets.push(sameAuthorYearNodes)
        }
      }
    }

    for (let i = 0; i < sameAuthorYearNodesSets.length; i++) {
      for (let j = 0; j < sameAuthorYearNodesSets[i].length && j < 26; j++) {
        const nodeAddChar = nodes.find((node) => node.node_id === sameAuthorYearNodesSets[i][j])
        nodeAddChar.year_added_char = nodeAddChar.year + ' ' + ALPHABETCHAR[j]
      }
    }

    return nodes
  }

  function handleZoom(e) {
    d3.select('svg g').attr('transform', e.transform)
    d3.select('svg g').attr(
      'transform',
      `${e.transform} translate(${clientWidth * adjustLayout}, ${clientHeight * adjustLayout}) scale(${graphScale})`
    )
  }

  function initZoom() {
    svg.attr(
      'transform',
      `translate(${clientWidth * adjustLayout}, ${clientHeight * adjustLayout}) scale(${graphScale})`
    )
    d3.select('svg').call(zoom)
  }

  function createArrow(svg) {
    // arrow-head デフォルト
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('refX', 16)
      .attr('refY', 5.8)
      .attr('markerWidth', 28)
      .attr('markerHeight', 28)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
      .style('fill', COLOR.LINK_INIT)
    // arrow-head 引用線用
    d3.select('defs')
      .append('marker')
      .attr('id', 'arrow-citation')
      .attr('refX', 16)
      .attr('refY', 5.8)
      .attr('markerWidth', 28)
      .attr('markerHeight', 28)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
      .style('fill', COLOR.CITATION)
    // arrow-head 被引用線用
    d3.select('defs')
      .append('marker')
      .attr('id', 'arrow-cited-by')
      .attr('refX', 16)
      .attr('refY', 5.8)
      .attr('markerWidth', 28)
      .attr('markerHeight', 28)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M2,2 L10,6 L2, 10 L6,6 L2,2')
      .style('fill', COLOR.CITEDBY)
  }

  function resetGraphStyle(node, link) {
    $('#selected-node').attr('id', null)
    node.style('opacity', 1).select('circle').attr('stroke', 'none').attr('stroke-width', 0)
    node.select('circle').attr('fill', COLOR.NODE_INIT)
    link.style('stroke', COLOR.LINK_INIT).attr('marker-end', 'url(#arrow)')
    $('#list-items-current').empty()
    $('#tab-cited-by').empty()
    $('#tab-citation').empty()
  }

  /**
   * 文献リストアイテムを作成するテンプレート。
   * @param {Object} node 文献データ
   * @return textListItem 文献リストアイテム
   * @global
   */
  function createListItems(node) {
    const textListItem = $('<li></li>')
      .append($('<div></div>').addClass('text-title').attr('data-nodeid', node.node_id).text(node.title))
      .append($('<div></div>').text(`著者 : ${node.author}`))
      .append($('<div></div>').text(`発行年 : ${node.year}`))

    if (node.original_work) {
      textListItem.append($('<div></div>').text(`原著 : ${node.original_work}`))
    }
    if (node.translator) {
      textListItem.append($('<div></div>').text(`翻訳者 : ${node.translator}`))
    }
    if (node.publication_detail) {
      textListItem.append($('<div></div>').text(`掲載元 : ${node.publication_detail}`))
    }
    if (node.publisher) {
      textListItem.append($('<div></div>').text(`発行所 : ${node.publisher}`))
    }
    if (node.link_url_1 || node.link_url_2 || node.link_url_3) {
      textListItem.append($('<div>オンラインリンク : </div>').append($('<ul></ul>')))
      if (node.link_url_1.match(/^https?:\/\//)) {
        if (node.link_text_1 && node.link_url_1) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_1,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_text_1)
            )
          )
        } else if (node.link_url_1) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_1,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_url_1)
            )
          )
        }
      }
      if (node.link_url_2.match(/^https?:\/\//)) {
        if (node.link_text_2 && node.link_url_2) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_2,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_text_2)
            )
          )
        } else if (node.link_url_2) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_2,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_url_2)
            )
          )
        }
      }
      if (node.link_url_3.match(/^https?:\/\//)) {
        if (node.link_text_3 && node.link_url_3) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_3,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_text_3)
            )
          )
        } else if (node.link_url_3) {
          textListItem.find('ul').append(
            $('<li></li>').append(
              $('<a></a>')
                .attr({
                  href: node.link_url_3,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
                .text(node.link_url_3)
            )
          )
        }
      }
    }
    if (node.others) {
      textListItem.append($('<div></div>').text(`その他 : ${node.others}`))
    }

    return textListItem
  }

  /**
   * 選択可能なデータソースのオプションを作成するテンプレート。
   * @param {Object} metaDataSelection 提供しているデータソースのメタデータ
   * @global
   */
  function createDataOptions(metaDataSelection) {
    $('#data-selection')
      .append(
        $('<option>')
          .attr('value', 'initial_graph')
          .text(`${metaDataSelection.initial_graph.option_text} (作成者：${metaDataSelection.initial_graph.provider})`)
      )
      .append(
        $('<option>')
          .attr('value', 'art_expression_and_appreciation')
          .text(
            `${metaDataSelection.art_expression_and_appreciation.option_text} (作成者：${metaDataSelection.art_expression_and_appreciation.provider})`
          )
      )
  }
})
