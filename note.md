#　メモ帳

## d3.jsの読み込み方
- ①CDNで読み込むd3。d3.v4.min.jsならいける。v5やv7だとうまくいかなかった。最新がv7だったからv7に変えてみたけど、自分の判断で変なことしない方がいい。詰まって時間使ったから。

- ②CDNではなくlibsの中に入れる。v4は最新ではないのでは？最新にしておく。v7をd3の公式からダウンロード。minがついた縮小版をjs/libs/の下に置く。

## jsonデータを読み込む
- v5から.json()の書き方が変わったらしい。この情報得るのに時間がかかる。。書き方変えたらいけた。
    
```
	d3.json('data/citation.json').then(function(data) {
	  d = data
	  console.log(d)
	}).catch(function(error){
	  console.log(error)
	})
```
- **非同期処理**とは？ここわからないと後がわからないよ。
- json()メソッドはd3のFetch APIである。json(input[,init])。inputで指定されたURLのjsonファイルを取得する。
- **Promiseオブジェクト** 非同期処理の成功/失敗と結果の値を返す。https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise
- then() Promiseの状態が満足(fulfilled)または拒否(rejected)の場合のハンドルを関連づける。成功した場合のコーヅバック、失敗した場合のコールバックを引数に取る。
- [fetch()](https://developer.mozilla.org/ja/docs/Web/API/WindowOrWorkerGlobalScope/fetch)。json()はjsのfetchのラッパーである。つまりjson()はその中でfetch()を実行する。構文は`const fetchResponsePromise = fetch(resource [, init])`
- jsonファイルを取得できたら`data`にjsonがobjectとして渡る。then()の中で成功の場合のコールバック関数を呼び出す。jsonファイル取得でエラーになったらcatch()の中でエラー処理を呼び出す。
- この辺細かい仕様、挙動をわからないとJSできるとはいえないだろうな。
- v4まではjson('URL', 'コールバック関数')でできていた。が仕組みが更新されている。

```
#実行
d3.json("data/citation.json")

#結果
Promise {<pending>}
[[Prototype]]: Promise
[[PromiseState]]: "fulfilled"
[[PromiseResult]]: Object
links: [{…}]
nodes: (2) [{…}, {…}]

#エラーの場合
d3.csv("data/relativez_デxータソース - 文献表_開発用.csv")
Promise {<pending>}
[[Prototype]]: Promise
[[PromiseState]]: "rejected"
[[PromiseResult]]: Error: 404 Not Found at Bu (http://localhost:8080/js/libs/d3.min.js:2:97474)
message: "404 Not Found"
stack: "Error: 404 Not Found\n    at Bu (http://localhost:8080/js/libs/d3.min.js:2:97474)"
[[Prototype]]: Object
constructor: ƒ Error()
message: ""
name: "Error"
toString: ƒ toString()


```
## Objectの要素へのアクセス

```
  console.log(data.nodes[0]["id"]);
  console.log(data.links[0]);
```

## csvファイルのデータの受け取り

## データオブジェクトをDOM要素にバインド
シンプルな例
```
d3.selectAll("p").data(["あ","い","う","え","お"]).enter().append("p").text(function(d) {return d;})
```
## 描画エリア、viewportの定義
svg要素を作成。svgは新しい座標系とViewboxを定義する。描画のエリアになる。
```
var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
```
## forceレイアウトの定義(古い、だめ)
これ、古いバージョンの関数だから動かなかった。
```
force = d3.layout.force()
  .gravity(.05)
  .distance(100)
  .charge(-100)
  .size([width, height]);

d3.csv("data/relativez_データソース - 文献表_開発用.csv").then(function(nodes) {
  d3.csv("data/relativez_データソース - 引用関係表_開発用.csv").then(function(links) {
    console.log(nodes);
    console.log(links);
    force
      .nodes(nodes)
      .links(links)
      .start();
```
d3.layout.force()で力学シミュレーションの設定を用意する。デフォルトでは.nodes(nodes)と.links(links)の値は空の配列である。あとで`force`を呼び出してい、nodesとlinksを配列として渡している。一般的にはnodesはsvgの円要素、linksはsvgの線要素にマッピングされる。gravity、distanceなどの細かい設定はいまは追わない。通常はすべての設定を書き終わったらstart()を実行する。

force-directed graphとは？って話は難しいので、d3が実装しているグラフ描画のための物理シミュレーションの仕組み、くらいに理解しておく。

.start()で物理シミュレーションを開始する。やがて停止してCPUが解放される。start()はグラフをレイアウトするたびに呼び出す必要がある。

## force 物理シミュレーションの設定
d3.forceSimulation()

新しめでシンプルな説明
https://www.d3indepth.com/force-layout/#setting-up-a-force-simulation


## linkとnodeのSVG要素の作成

node.call()。nodeのcall演算子。node.call(force.drag)でノードに振る舞いをバインドする。マウスやタッチでドラッグできるようになる。

<g>要素は子要素をグループ化する。設定が子要素に継承される。

<text>はグラフィックスとしてテキストを定義する。SVG内でテキストを出すなら<text>を使う。そうでないと表示されない。

dxやdyはその要素のx座標、y座標からのずれを表す値である。

force.on("tick", function() {})。type,lisnerの構文。。typeにはstartかtickかendのイベントが指定される。tickはシミュレーションの各反復ごとにディスパッチされる。イベントとして発送される。tickイベントはnodeやlinkの表示位置を更新するために使用する。tickはレイアウトシミュレーションの1ステップを意味する。

transform属性, translate(x座標の移動,y座標の移動)

## ネットワーク描画　超基本形から

参考にしているもの

http://bl.ocks.org/jose187/4733747

ただバージョンが古いので関数の使い方とか真似するだけだと動かなかったりするので注意。

- ノード間の距離が近すぎる → 反発させる。`d3.forceManyBody().strength(-700)`
- 文字列が重なると読めない
- ドラッグしたい
- 線を矢印にしたい
  - defs要素、marker要素、path要素、marker-end属性、を使う
- 起点文献を中心にしたい
- マウスオーバーで関連するノードとラインをハイライト表示したい。
- 起点文献を選択し直すとそれが中心になるようにレイアウトしたい。
- ダークモードのカラーデザインに変えたい
- まず引用関係をみれるグラフにする

- 以外にここひと工夫いるところ
 - 隣接ノード以外の透明度を上げて弱める
 - 隣接の引用と被引用ノードをハイライト表示。

  ```
  //隣接ノードか調べるためのmap
  var linkedByIndex = {}
  links.forEach(function(d) {
    linkedByIndex[d.source.index + ',' + d.target.index] = 1
  })

  //console.log(linkedByIndex)
  {0,21: 1, 0,24: 1, 0,13: 1, 0,17: 1, 1,11: 1, …}`
  ```
 

## イベント

- ドラッグ
- マウスオーバー


## tips
- favicon画像がないとconsoleにエラーが出てうざいので何か設定しておく。
- 変数のスコープに注意。ローカル変数をスコープの外で使おうとするな！変数定義が関数の内か外か。内はローカル、外はグローバル。varなしはグローバルになるが非推奨。
- ファイルを１つにまとめる考えも浮かんだが、nodes.csvとlinks.csvは別で扱われている例が目に付く。そうなるよね。
- svgのlineはstrokeに色指定しないと見えない。
- JSでは関数を作成するとクロージャが作成される。クロージャ=関数と関数が作成されたときの環境。環境=スコープ内部のすべての変数。レキシカルスコープ。関数がネストされているとき、変数スコープどうなるか？問題に関係ある。内部関数は外側の関数のスコープにある変数にもアクセスできる。
- `link.attr("x1", function(d) { return d.source.x})`d.source.xが参照しているのはデータソースの値ではなく、ノード用のデータ配列の位置の値。シミュレーション->ノード位置計算->ノード配列が情報持っている->d.source.xでx座標の位置を参照。というイメージ。
- ある属性を削除したい→atrr()で値をnullにすると消える
- `d3.event.pageX`はダメで`event.pageY`ならいけた
- tooltipの出し方、htmlなのかsvgなのか。svgなら背景どうつけるか、表示順序の解決、など細かく、難しくなる。いろいろやったが一番シンプルな例を真似するところに落ち着いた。pure jsはまだまだ操作できないな。

## コーディング規約
- セミコロン
自分としては、なしにする。最近のフレームワークではあまりない。セミコロンがないことで起きる問題にあたってからでいい。coffee scriptもなし。
- 自分としては、文字列はシングルクォートで。ダブルより視覚要素少ないから。

##　エラー　　　デバッグ
- d3.layout.force()は古いバージョンの関数みたい。これだと動かない。
	- simulationで書き換える。force、linkまわりを書き換えるとここは解消？

- node not found 
  - Primiseのerrorをテキストだけで出すから細かくわからない。

```
function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
```
consoleのログを読み取れていない。Error Messageは出ている。で、at の後ろに呼び出されて失敗した関数のスタックが出てる。ここ見ていけばいいと気づく。遅い。。

nodeのkeyの値とlinkのsourceとnodeの値を対応させなければならない。node not found : 1。これはlinkがnodeのindexを探したが、対応するnodeを見つけられなかったことになっている。sourceとtargetにデフォルトのnode.indexの値を使わないなら、linkがnode.indexではなくてnode.idを使うように書き換えないといかない。　このコードが正解だった。
```
.force('link', d3.forceLink().links(links).id(function(n) { return n.node_id }))
```
nodeオブジェクトのnode_idをつかってlinkをつくるように変更したらできた。数字にしているし、indexのつもりでいたが、indexは0ベースのカウントになっていて、自分で設定しているnode_idと別ものになっている。indexの値をsourceとtargetの値に設定していくのは直観的に分かりにくい。indexで紐付けないほうがいい。ログのエラーから明確に問題の行を特定、実行された関数スタックを追う、どの関数で、どのエラーが返されているか、これをすぐできないと。気づくに時間かかりすぎ。エラーを特定して、ググればヒントは出てくる。