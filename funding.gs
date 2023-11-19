function triggerBybitFundingRate() {
  // Bybit APIキーを指定
  var api_key = "";
  var secret_key = "";

  // LINE Notifyのアクセストークンを指定
  var line_notify_token = "";

  // Bybit APIのエンドポイントを指定
  var url = "https://api.bybit.com/v2/public/tickers";

  // リクエストパラメーターを指定
  var symbols = ["BTCUSD", "ETHUSD"];  // 取得するシンボルを指定
  var negative_symbols = []; // マイナスのfunding rateを持つシンボルを格納する配列を定義
  for (var i = 0; i < symbols.length; i++) {
    var params = {
      "symbol": symbols[i]
    };

    // リクエストヘッダーを作成
    var headers = {
      "api-key": api_key,
      "api-signature-method": "HmacSHA256",
      "api-timestamp": new Date().getTime().toString(),
    };

    // リクエストを送信してレスポンスを取得
    var response = UrlFetchApp.fetch(url + "?symbol=" + params.symbol, {
      "method": "GET",
      "headers": headers
    });

    // レスポンスをJSON形式に変換
    var data = JSON.parse(response.getContentText());

    // funding rateを取得
    var funding_rate = parseFloat(data.result[0].funding_rate);

    // funding rateがマイナスの場合、その銘柄を配列に格納
    if (funding_rate < 0) {
      negative_symbols.push(symbols[i]);
    }
  }

  // マイナスのfunding rateを持つ銘柄がある場合にLINEに通知
  if (negative_symbols.length > 0) {
    var message = negative_symbols.join(", ") + "のfunding rateがマイナスになりました。乖離が発生しました。";
    var options = {
      "method": "post",
      "headers": {
        "Authorization": "Bearer " + line_notify_token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      "payload": {
        "message": message,
      },
    };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
  }
}
