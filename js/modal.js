$(function() {
  $('.open-modal').on('click', function() {
    $('.filter, .modal').fadeIn(200);
    $('.modal-contents').children().hide();
  });

  $('.modal-close').on('click', function() {
    $('.modal, .filter').fadeOut(200);
  });

  // データソース入力
  $('.modal-contents')
    .append($('<div>')
      .attr({
        id: 'modal-contents-file-input',
        hidden: 'hidden',
      })
      .append($('<h1>').text('データソースファイル入力'))
      .append($('<p>').text('入力されたデータソースファイルに基づいてネットワークグラフを作成します。文献表と引用関係表を選択してください。ファイル形式はカンマ区切り形式(.csv)にしてください。'))
      .append($('<p>').addClass('sub-text').text('ファイルや個人情報がサーバーに送信、保存されることはありません。'))
      .append($('<div>').addClass('file-input-box').attr('id', 'nodes-input')
      .append($('<input>').attr({
        type: 'file',
        id: 'nodes-input-file',
        class: 'file-selector',
        accept: '.csv',
      }))
      .append($('<button>').addClass('file-select-btn')
      .append($('<img>').attr('src', '/assets/Icon-attach-file.svg'))
      .append($('<span>').text('文献表ファイル選択'))
      )
      .append($('<p>').addClass('file-data'))
      .append($('<p>').addClass('error-msg-box'))
      )
      .append($('<div>').addClass('file-input-box').attr('id', 'links-input')
      .append($('<input>').attr({
        type: 'file',
        id: 'links-input-file',
        class: 'file-selector',
        accept: '.csv',
      }))
      .append($('<button>').addClass('file-select-btn')
      .append($('<img>').attr('src', '/assets/Icon-attach-file.svg'))
      .append($('<span>').text('引用関係表ファイル選択'))
      )
      .append($('<p>').addClass('file-data'))
      .append($('<p>').addClass('error-msg-box'))
      )
      .append($('<button>').addClass('button-component').attr('id', 'create-graph-btn').text('ネットワークグラフ作成'))
    );

  // About
  $('.modal-contents')
    .append($('<div>')
      .attr({
        id: 'modal-contents-about',
        hidden: 'hidden',
      })
      .append($('<h1>').text('About'))
      .append($('<p>').text('relativezは、文献の引用ネットワークを可視化するWebアプリケーションです。'))
      .append($('<p>').text('目的は下記の3点を達成することです。'))
      .append($('<ul>')
        .append($('<li>').text('文献同士の関係を視覚化することで文脈が把握しやすくなること'))
        .append($('<li>').text('情報量が増えたときに全体をイメージしやすくすること'))
        .append($('<li>').text('研究に必要な文献情報を整理できること'))
      )
      .append($('<p>')
        .text('relativezが想像する理想的なシーンは、複数の独立したアーティストが集まる場所において、個々人の持つ問題意識について、'+
              'お互いがお互いにその複雑さを理解しつつ共通点を見出せる環境です。このWebアプリケーションが会話や勉強会など様々な場面で'+
              '制作の一助になることを願っています。'))
      .append($('<h1>').text('relativezプロジェクトへの参加方法'))
      .append($('<h2>').text('データ提供者として参加する'))
      .append($('<p>')
        .text(
          'データソースを作成して提供していただくと、relativezにアクセスした他のユーザーが閲覧可能なネットワークグラフとして表示します。'+
          '「データソース選択」から提供していただいたデータが選択可能になります。'
        )
      )
      .append($('<p>')
        .text('relativezにデータを提供していただける方はTwitterのDMでご連絡ください。')
        .append($('<br>'))
        .append($('<a>').attr({
          href: 'https://twitter.com/relativez_2021',
          target: '_blank',
          rel: 'noopener noreferrer'
        })
        .text('Twitter @relativez_2021'))
      )
      
      .append($('<h2>').text('開発者として参加する'))
      .append($('<p>')
        .text(
          'このWebアプリはMITライセンスを適用しており、自由に複製・配布・修正されることを無制限に許可したオープンソースプロジェクトです。'+
          'ご興味のある方はGitHubでぜひご参加願います。'
        )
      )
    );
  // データソース選択
  $('.modal-contents')
    .append($('<div>')
      .attr({
        id: 'modal-contents-file-select',
        hidden: 'hidden',
      })
      .append($('<h1>').text('データソース選択'))
      .append($('<p>').text(
        '選択されたデータソースに基づくネットワークグラフを表示します。relativezは以下のデータソースを提供しています。'
        )
      )
      .append($('<label>').attr('for', 'data-selection').text('データソースを選択してくだい。'))
      .append($('<select>')
        .attr({
          id: 'data-selection',
          name: 'data-selection',
        })
        .append($('<option>').attr('value', 'initial_graph').text('日本美術の制度論系 (データ作成者：大原由)'))
        .append($('<option>').attr('value', 'sample_1').text('サンプル1'))
        .append($('<option>').attr('value', 'sample_2').text('サンプル2'))
      )
      .append($('<button>').addClass('button-component').attr('id', 'show-selected-graph-btn').text('ネットワークグラフ表示'))
    );

    $('#data-select-btn').on('click', function(){
      $('#modal-contents-file-select').show();
    });

    $('#data-input-btn').on('click', function(){
      $('#modal-contents-file-input').show();
    });

    $('#header-menu-about').on('click', function(){
      $('#modal-contents-about').show();
    });
});
    