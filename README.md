AtCoder Marathon Rating History
=====

## 公開先

TODO


## 概要

AtCoder で行われたマラソンコンテストのレーティング推移をグラフに表示します．
AtCoder が公式にマラソンレートのグラフ表示機能を実装するまでのつなぎです．


## atcoder-marathon-rating-history-frontend

TypeScript + React 製のフロントエンドです．

### セットアップ

```sh
$ cd atcoder-marathon-rating-history-frontend
$ yarn
```

### ローカルサーバ起動

```sh
$ cd atcoder-marathon-rating-history-frontend
$ yarn start
```

### ビルド

atcoder-marathon-rating-history-frontend/build/ 以下に最適化込みでビルドしたものが吐かれます．

```sh
$ cd atcoder-marathon-rating-history-frontend
$ yarn build
```

## preprocessor

Python 製プログラムです．csv→json 変換を行います． 

### セットアップ

preprocessor/csv 以下に result_ahcXXX.csv の形のファイル名で公式 csv を格納します．

### 本処理

ahcXXX という形のコンテストを探し，情報を吐きます．

```sh
$ cd preprocessor
$ python main.py
```


## 連絡先

- Twitter: [si \(@iiljj\)](https://twitter.com/iiljj)
- GitHub: [iilj \(iilj\)](https://github.com/iilj)
