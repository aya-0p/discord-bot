# discord-bot
botは1つのサーバーでのみ稼働させることを前提としています。  

## 動作確認環境
Microsoft Windows 10 version 21H1, OS build 19043.1348  
VOICEVOX version 0.9.3  
ffmpeg version 4.2.3  
node.js version 16.13.0  
npm version 8.1.0  
その他各モジュールはpackage.jsonの通り  

## 構築方法
botのtoken作成は済ませておく  
VOICEVOX,ffmpegをインストールする  
以下を実行
```
npm install
node setup.js
```
.envにそれぞれ記入  

## 実行方法
VOICEVOXのrun.exeを実行した上で以下を実行
```
node index.js
```  

## ログについて
.logにログがあります。ここにbotが入っており、見ることができるチャンネルのメッセージなども記録されます。  
なお、すべてのメッセージログが不要な場合は.env内のdebugをfalseにしてください。（読み上げ、コマンド操作など一部は残ります）