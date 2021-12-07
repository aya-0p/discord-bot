<!-- 
botの使い方
ここへのページ(https://github.com/*username*/discord-bot/blob/main/How-to-use.md)をbotの説明文に貼ると便利
 -->
# aya's bot<!-- 作者名 -->
botの使い方です。  
基本の機能は全てここに乗っているはず...  
(作者による隠し機能を除く...?)  
## 機能一覧
ボイスチャンネルで読み上げ  
メッセージURLからメッセージを表示  
自動返信
## /join
実行者が参加しているボイスチャンネルに参加
## /disconnect
ボイスチャンネルから退出
## /addword [before] [after] [regex]
ボイスチャンネルで読み上げる際のメッセージの読み替え
### before
読み替える前の語
### after
読み替えた後の語
### regex
省略可  
正規表現を利用する
## /ch_default_voice [id], /ch_my_voice [id]
デフォルトの、実行者の読み上げ音声を変更
### id
読み上げ者名(VOICEVOXに存在するもののみ選択可)
## 自動返信
現在は設定なし
## メッセージURLからメッセージを表示
`https://discord.com/channels/(number)/(number)/(number)` のようなメッセージURLからメッセージを表示する
