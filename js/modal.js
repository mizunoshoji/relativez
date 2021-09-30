$(function() {
  'use strict';
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
      .append($('<p>').text('入力されたデータソースファイルに基づいてネットワークグラフを作成します。'))
      .append($('<p>')
        .text('下記のデータ作成用テンプレートをコピーまたはダウンロードしてからデータを作成してください。'+
              '(Googleスプレッドシートを使用してコピーを作成するのが簡単です。)'+
              'データ作成方法については、シート「データ作成マニュアル」を参照してください。'
        )
        .append($('<br>'))
        .append($('<a>')
          .attr({
            href: 'https://docs.google.com/spreadsheets/d/1AdNFTfCSotEPVilhd1EvE6poh1fSPZ5TjKZYU9LS318/edit?usp=sharing',
            target: '_blank',
            rel: 'noopener noreferrer'
          })
          .text('データ作成用テンプレート - relativez_data_template.v01 ')
        )
      )
      .append($('<p>').text(
          '作成した文献表と引用関係表を選択してください。ファイル形式はカンマ区切り形式(.csv)にしてください。'+
          'ファイルや個人情報がサーバーに送信、保存されることはありません。'
      ))
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
          id: 'twitter-link',
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

  // 免責事項
  $('.modal-contents')
    .append($('<div>')
      .attr({
        id: 'modal-contents-disclaimer',
        hidden: 'hidden',
      })
      .append($('<h1>').text('免責事項'))
      .append($('<p>').text('本アプリケーションは、ご利用者様に対して何も保証しません。本アプリケーションの関係者(他の利用者も含む)は、' +
      'ご利用者に対して一切責任を負いません。ご利用者様が、本アプリケーションを利用(閲覧、参加、外部での再利用など全てを含む)する場合は、自己' +
      '責任で行う必要があります。'))
      .append($('<ul>')
        .append($('<li>').text('本アプリケーションの利用の結果生じた損害について、一切責任を負いません。'))
        .append($('<li>').text('コンテンツとして提供する全ての文献情報、画像等について、内容の合法性・正確性・安全性等、あらゆる点にお' +
        'いて保証しません。本アプリケーションはこれらの情報をご利用者様が利用することによって生じたいかなる損害に対しても一切責任を負いません。'))
        .append($('<li>').text('利用者同士のトラブルには、一切介入致しません。'))
        .append($('<li>').text('ご利用者様の適用される法令に照らして、本アプリケーションの利用が合法であることを保証しません。'))
        .append($('<li>').text('リンクをしている外部サイトについては、何ら保証しません。'))
        .append($('<li>').text('本アプリケーションは、ご利用者様が本アプリケーションそのものおよびそのコンテンツを外部で2次利用した場合、' +
        'MITライセンスの定められた要件を充たす限りご利用者様に対して著作権侵害を主張することはありません。しかし、本アプリケーション以外の第三者から'+
        '著作権侵害を理由に訴えられないことを保証するものではありません。'))
        .append($('<li>').text('利用者の提供したデータソースは、本アプリケーション関係者の基準に従って掲載の可否を判断し、その掲載を断る可能性'+
        'がありますが、そのことによって生じた損害について一切責任を負いません。'))
        .append($('<li>').text('事前の予告無く、アプリケーションの提供を中止する可能性があります。'))
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
      .append($('<div>').attr('id', 'select-box-wrapper')
        .append($('<select>')
            .attr({
              id: 'data-selection',
              name: 'data-selection',
            })
            .append($('<option>').attr('value', 'initial_graph').text('日本美術の制度論系 (作成者：大原由)'))
            .append($('<option>').attr('value', 'sample_1').text('サンプル1'))
            .append($('<option>').attr('value', 'sample_2').text('サンプル2'))
        )
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

    $('#header-menu-disclaimer').on('click', function(){
      $('#modal-contents-disclaimer').show();
    });
});
    