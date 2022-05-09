let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0; 

let hidden;
let deck;

let doubleAflag;

// 点数計算
const storage = localStorage;
let winstore;
let losestore;
let tiestore;
if (!storage.getItem('win')){
  winstore = 0;
} else {
  winstore = Number(storage.getItem('win'));
}
if (!storage.getItem('lose')){
  losestore = 0;
} else {
  losestore = Number(storage.getItem('lose'));
}
if (!storage.getItem('tie')){
  tiestore = 0;
} else {
  tiestore = Number(storage.getItem('tie'));
}
console.log(storage);
document.getElementById("win").textContent = `${winstore}`;
document.getElementById("lose").textContent = `${losestore}`;
document.getElementById("tie").textContent = `${tiestore}`;

let canHit = true; //allows the player (you) to draw while yourSum <= 21

window.onload = function() {
    buildDeck();
    shuffleDeck();
    startGame();
}

// 次のゲームを始める
document.getElementById("nextgame").onclick = function(){
  window.location.reload();
}

//トランプデッキの作成
function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }
    }
}

//トランプデッキのシャッフル
function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
        //deckのi枚目(iは0-51回)とdeckのj枚目(jはランダム枚目)を入れ替えてシャッフル
    }
}

function startGame() {
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    // dealerのカード設定
    // 最初に計算させるパターン(デフォルト)
    // while (dealerSum < 17) {
    //   let cardImg = document.createElement("img");
    //   let card = deck.pop();
    //   cardImg.src = "./cards/" + card + ".png";
    //   dealerSum += getValue(card);
    //   dealerAceCount += checkAce(card);
    //   document.getElementById("dealer-cards").append(cardImg);
    // }

    // dealerのカードを1枚だけ表示させる
    {
      let cardImg = document.createElement("img");
      let card = deck.pop();
      cardImg.src = "./cards/" + card + ".png";
      dealerSum += getValue(card);
      dealerAceCount += checkAce(card);
      document.getElementById("dealer-cards").append(cardImg);
    }
    
    // playerのカード設定
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);

}

// ヒットする
function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) { //A, J, 8 -> 1 + 10 + 8
        canHit = false;
    }
}

// ステイする(ゲーム終了)
function stay() {
  yourSum = reduceAce(yourSum, yourAceCount);
  
  canHit = false;
  document.getElementById("hidden").src = "./cards/" + hidden + ".png";
  
  //ディーラーが両方Aの時の処理(両方Aの時だけ22と読んで処理が走らなくなってしまうので、dealerSumが17以下になるように一旦修正する)
  if (dealerSum == 22 && dealerAceCount == 2){
    dealerSum -= 10;
    dealerAceCount -= 1;
    doubleAflag = true;
  }
  

  // ゲーム終了時にディーラー側にカードを引かせる
  while (dealerSum < 17) {
    //両方AAの時だけの例外修正処理をもとに戻す
    if (doubleAflag) {
      dealerSum += 10;
      dealerAceCount += 1;
      doubleAflag = false;
    }
    // カードを引く
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);
    //22より大きくてAが手札に含まれる場合は、11を1に読み替える処理を行う
    while (dealerSum > 21 && dealerAceCount > 0) {
      dealerSum -= 10;
      dealerAceCount -= 1;
    }
  }

  //勝敗判定する
    let message = "";
    if (yourSum > 21) {
        message = "You Lose!";
        losestore++;
    }
    else if (dealerSum > 21) {
        message = "You Win!";
        winstore++;
    }
    //both you and dealer <= 21
    else if (yourSum == dealerSum) {
        message = "Tie!";
        tiestore++;
    }
    else if (yourSum > dealerSum) {
        message = "You Win!";
        winstore++;
    }
    else if (yourSum < dealerSum) {
        message = "You Lose!";
        losestore++;
    }

    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    
    // 勝敗の記録
    document.getElementById("win").textContent = `${winstore}`;
    storage.setItem('win', winstore); // ストレージに記録
    document.getElementById("lose").textContent = `${losestore}`;
    storage.setItem('lose', losestore); // ストレージに記録
    document.getElementById("tie").textContent = `${tiestore}`;
    storage.setItem('tie', tiestore); // ストレージに記録
    console.log(storage);
    console.log(winstore);
    console.log(losestore);
    console.log(tiestore);

    //時間差で結果を表示
    setTimeout(
      function showResult() {
        document.getElementById("results").innerText = message;
      },1000
    )
}

//カードの値を取得する
function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

// エースを確認
function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

// エースの特殊処理
function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}