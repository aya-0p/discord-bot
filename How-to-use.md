<!-- 
botの使い方
ここへのページ(https://github.com/*username*/discord-bot/blob/main/How-to-use.md)をbotの説明文に貼ると便利
 -->
[利用規約](https://github.com/aya-0p/discord-bot/blob/main/利用規約等.md)への同意もお願いします。なお、基本の利用では問題ないはずです。  
[Acknowledgements-HTS voice](https://github.com/aya-0p/discord-bot/blob/main/Acknowledgements(HTS%20voice))  
[更新情報(Twitter)](https://twitter.com/ayas_bot)  
[そのほかの細かい情報](https://github.com/aya-0p/discord-bot/blob/main/other.md)
# aya's bot<!-- 作者名 -->
botの使い方です。  
基本の機能は全てここに乗っているはず...  
(作者による隠し機能を除く...?)  
## 機能一覧
- ボイスチャンネルで読み上げ  
- メッセージURLからメッセージを表示  
- 自動返信
## /help
このページへのリンクを表示
## /join
実行者が参加しているボイスチャンネルに参加、読み上げの開始
## /disconnect
ボイスチャンネルから退出
## /read [before] [after] [regex]
### before
読み替える前の語(入力しないと読み替えリストを表示)
### after
読み替えた後の語(入力しないと読み替え削除、"."で読まない)
### regex
正規表現を利用する
- True 使う
- False 使わない（デフォルト）
## /voice [id]
実行者の読み上げ音声を変更
### id
読み上げ者名(VOICEVOXに存在するもののみ選択可)
## /reply [search] [returnmsg]
自動返信
### search
反応する言葉(入力しないと反応リストを表示)
### returnmsg
応答する言葉(入力しないと反応削除)
## /settings
設定の変更  
詳細は実行後のテキストをご覧ください。
## /report [type] [body]
Ayaへの報告
### type
報告内容。「不具合」「要望」「その他」から選べます
### body
報告本文
## メッセージURLからメッセージを表示
`https://discord.com/channels/(number)/(number)/(number)` のようなメッセージURLからメッセージを表示する
