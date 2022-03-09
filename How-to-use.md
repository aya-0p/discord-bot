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
## /ay help
このページへのリンクを表示
## /ay join
実行者が参加しているボイスチャンネルに参加、読み上げの開始
## /ay disconnect
ボイスチャンネルから退出
## /ay read [before] [after] [regex]
### before
読み替える前の語(入力しないと読み替えリストを表示)
### after
読み替えた後の語(入力しないと読み替え削除、"."で読まない)
### regex
正規表現を利用する
- True 使う
- False 使わない（デフォルト）
## /ay voice [id]
実行者の読み上げ音声を変更
### id
読み上げ者名(VOICEVOXに存在するもののみ選択可)
## /ay reply [search] [returnmsg]
自動返信
### search
反応する言葉(入力しないと反応リストを表示)
### returnmsg
応答する言葉(入力しないと反応削除)
## /ay setting [type] [bool]
設定の変更
### type
- 「自動的にボイスチャンネルに接続する」 誰かがボイスチャンネルに接続すると、Botも一緒に参加します。なお、読み上げはこの設定コマンドを実行した場所を読みます
- 「メンションのメッセージを読まない」 @あや など、メンションが入ったメッセージを読みません
- 「Botからのメッセージを受け取らない」 不定期で送られるアップデート、再起動などの通知を受け取りません
### bool
- True: 有効
- False: 無効（デフォルト）
## /ay report [type] [body]
Ayaへの報告
### type
報告内容。「不具合」「要望」「その他」から選べます
### body
報告本文
## メッセージURLからメッセージを表示
`https://discord.com/channels/(number)/(number)/(number)` のようなメッセージURLからメッセージを表示する
