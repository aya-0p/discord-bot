# discord-bot
VOICEVOX利用の音声読み上げBot  
(使い方は[how-to-use.md](https://github.com/aya-0p/discord-bot/blob/main/How-to-use.md)を確認)
## 注意事項
**Botは1つのサーバーだけで利用してください。**  
確実に動作しません！

## 動作確認環境
Microsoft Windows 10 version 21H1, OS build 19043.1348  
VOICEVOX version 0.9.3  
node.js version 16.13.0  
npm version 8.1.0  
その他各モジュールはpackage.jsonの通り  

## 構築方法
[botとtoken作成](https://discord.com/developers/)は済ませておく  
[VOICEVOX](https://voicevox.hiroshiba.jp)をインストールする  
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

## アップデート方法
commands,scripts,index.jsを差し替える(README.mdなど実行に関係ないものは更新する必要はない)  
その後、一応以下を実行
```
npm install
```

## ログについて
.logにログがあります。ここにbotが入っており、見ることができるチャンネルのメッセージなども記録されます。  
なお、すべてのメッセージログが不要な場合は.env内のdebugをfalseにしてください。（読み上げ、コマンド操作など一部は残ります）
