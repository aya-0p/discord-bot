# discord-bot
VOICEVOX利用の音声読み上げBot  
(使い方は[how-to-use.md](https://github.com/aya-0p/discord-bot/blob/main/How-to-use.md)を確認)

## 動作確認環境
Microsoft Windows 10 version 21H1, OS build 19043.1348  
VOICEVOX version 0.9.3  
node.js version 16.13.0  
npm version 8.1.0  
その他各モジュールはpackage.jsonの通り  

## 構築方法
ファイルをダウンロード  
[v1.0.3](https://github.com/aya-0p/discord-bot/releases/tag/v1.0.3)  
[botとtoken作成](https://discord.com/developers/)は済ませておく  
[VOICEVOX](https://voicevox.hiroshiba.jp)をインストールする  
`setup.bat`を実行(自動ですべてインストールされます)  
.envにそれぞれ記入  

## 実行方法
VOICEVOXのrun.exeを実行した上で以下を実行
```
node index.js
```  

## アップデート方法
`update.js`を実行

## ログについて
.logにログがあります。.env内のdebugをtrueにすることで見ることができるチャンネルのメッセージなども記録されます。  
なお、false(初期)だと記録されません。（読み上げ、コマンド操作など一部は残ります）
