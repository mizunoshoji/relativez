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
      .append($('<h1>').text('relativezについて'))
      .append($('<h2>').text('見出し2'))
      .append($('<p>').text(
        'コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。' +
        'コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。'
        )
      )
      .append($('<h2>').text('見出し2'))
      .append($('<p>').text(
        'コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。' +
        'コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。コンテンツです。'
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
        .append($('<option>').attr('value', 'initial_graph').text('日本の美術'))
        .append($('<option>').attr('value', 'sample_1').text('サンプル1'))
        .append($('<option>').attr('value', 'sample_2').text('サンプル2'))
        .append($('<option>').attr('value', 'sample_3').text('サンプル3'))
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
    