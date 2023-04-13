//有限狀態機
const GAME_STATE = {
  FirstCardAwaits:"FirstCardAwaits",
  SecondCardAwaits:"SecondCardAwaits",
  CardsMatchFailed:"CardsMatchFailed",
  CardsMatch: "CardsMatch",
  GameFinished: "GameFinished"
}

class viewObject {
  constructor() {
    this.panel = document.querySelector("#cards-display-panel")
    this.symbols = [
      'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
      'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
      'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
      'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
    ]
    this.cardArray = undefined
    this.scoreDisplay = document.querySelector(".score")
    this.triedDisplay= document.querySelector(".tried")
    this.endingScreen = document.querySelector(".ending")
    this.restartButtom = document.querySelector(".restart")
  }

  displayCards(indexes) {
    this.cardArray = indexes
    const allCards = this.cardArray.map(item => this.getCardElement(item)).join("")
    this.panel.innerHTML = allCards
  }
  flipCards(...cards) {//把一個個分開的arg組回成array
    //如果是背面，點一下變成正面
    cards.map(card => {

      if (card.classList.contains("back")) {
        card.classList.remove("back")
        //card.innerHTML = this.getCardContent(parseInt(card.dataset.index,10))
        return
      }
      //如果是正面，點一下變成背面
      //刪光所有的東西
      card.classList.add("back")
      //card.innerHTML = null
    })
    return
  }
  getCardElement(index) {
    const cardOutput = `
    <div class="card back" data-index=${index}>
    ${this.getCardBack()}
    ${this.getCardContent(index)}
    </div>
    `
    return cardOutput
  }
  getCardBack() {
    const backHTML = `
      <div class="card-back">
      </div>
    `
    return backHTML
  }
  getCardContent(index) {

    /*
    0-12：黑桃 1-13
    13-25：愛心 1-13
    26-38：方塊 1-13
    39-51：梅花 1-13
    */
    const number = this.transformNumber(index % 13 + 1)
    const symbol = this.symbols[Math.floor(index / 13)]
    const cardContent= `
    <div class="card-front">
        <div class="card-info">
          <p class="card-number">
          ${number}
          </p>
          <img class="card-side-icon" 
              src="${symbol}"
              alt="card-icon">
        </div>
        <img class="card-main-icon" 
            src="${symbol}"
            alt="card-icon">
        <div class="card-info">
          <p class="card-number">
          ${number}
          </p>
          <img class="card-side-icon"
              src="${symbol}"
              alt="card-icon">
        </div>
    </div>
    `
    return cardContent
  }
  transformNumber(number) {
    switch (number) {
    case 1:
      return "A"
    case 11:
      return "J"
    case 12:
      return "Q"
    case 13: 
      return "K"
    default:
      return number
    }
  }
  pairCards(...cards) { //把一個個分開的arg組回成array
    cards.map(card => {
      card.classList.add("paired")
    })
    return
  }
  //以下兩個是負責更改得分畫面與嘗試次數
  renderScore(score) {
    this.scoreDisplay.textContent = `Score: ${score}`
  }
  renderTriedTimes(tried) {
    this.triedDisplay.textContent = `You've tried: ${tried} times`
  }
  //appendWrongAnimation產生配對錯誤時的畫面反應
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong")
      card.addEventListener("animationend", event => {
        event.target.classList.remove("wrong")
      }, {once:true})
    })
    
  }

  showEndingScreen(score, triedTime) {
    this.endingScreen.classList.remove("display-none")
    const completeScore = this.endingScreen.querySelector(".complete-score")
    const completeTried = this.endingScreen.querySelector(".complete-tried")
    completeScore.textContent = `Score: ${score}`
    completeTried.textContent = `You've tried: ${triedTime} times`
  }
  hideEndingScreen() {
    this.endingScreen.classList.add("display-none")
  }
}
class modelObject {
  //用來處理資料的地方
  constructor() {
    this.revealCards = []
    this.score = 0
    this.triedTimes = 0
  }
  pushRevealCard(card) {
    this.revealCards.push(card)
    return
  }
  emptyRevealCard() {
    this.revealCards.length = 0
    return
  }

  isRevealCardsMatch() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13 
  }

  increaseScore() {
    this.score += 10
    return this.score
  }
  increaseTriedTime() {
    this.triedTimes +=1
    return this.triedTimes
  }
  isComplete() {
    return this.score >=260 
  }
  resetGame() {
    this.revealCards.length = 0
    this.score = 0
    this.triedTimes = 0
  }
}

class controllerObject {
  //只有他可以放在global中被碰到
  constructor() {
    this.model = new modelObject()
    this.view = new viewObject()
    this.currentState = GAME_STATE.FirstCardAwaits
  }

  generateCards() {
    this.view.displayCards(utility.getRandomNumberArray(52))
  }
  restart(event) {
    if (event.target.contains("restart")) {
      this.view.hideEndingScreen()
      this.model.resetGame()
      this.generateCards()
      this.view.renderScore(0)
      this.view.renderTriedTimes(0)
      this.currentState = GAME_STATE.FirstCardAwaits
    }
  }
  dispachCardAction(card) {
    //這裡主要控制5種不同狀態下的回應方式
    //使用card click來驅動
    if (!card.classList.contains("back")) {
      //如果卡片是打開的就不應該再蓋回去
      return
    }

    switch (this.currentState) {
    case GAME_STATE.FirstCardAwaits:
      this.view.flipCards(card)
      this.model.pushRevealCard(card)
      this.currentState = GAME_STATE.SecondCardAwaits//切換等第二張牌
      break

    case GAME_STATE.SecondCardAwaits:
      this.view.renderTriedTimes(this.model.increaseTriedTime()) //翻兩張牌嘗試次數要加1
        
      this.view.flipCards(card)
      this.model.pushRevealCard(card)
      if (this.model.isRevealCardsMatch()) {
        //把match的變成灰色
        this.currentState = GAME_STATE.CardsMatch
        this.view.renderScore(this.model.increaseScore())
        this.view.pairCards(...this.model.revealCards)
        this.model.emptyRevealCard()

        //以下處理如果贏的話要怎麼辦
        if (this.model.isComplete()) {
          this.currentState = GAME_STATE.GameFinished//贏的話改成gamefinised然後出現畫面
          this.view.showEndingScreen(this.model.score, this.model.triedTimes)//show贏得畫面
          this.view.restartButtom.addEventListener("click",event => this.restart(event),{once:true})
          
        } else {
          this.currentState = GAME_STATE.FirstCardAwaits//做完動作以後要立刻切換為原本的狀態，以後如果要做動畫也比較方便
        }
      } else {
        //如果沒有match就要蓋回去
        this.currentState = GAME_STATE.CardsMatchFailed
        //產生配對錯誤動畫
        this.view.appendWrongAnimation(...this.model.revealCards)
        //保留一秒鐘，讓玩家記得卡片
        setTimeout(() => { this.resetCards() }, 700)
        //set timeout傳入的function不要加括號,但是在class中使用setTimeout，setTimeout是瀏覽器物件this會指向windows
        //所以還是需要用一個外層function把this.resetCards()包起來，this才會指向class
      }
      break
    }
    console.log("this.currentState",this.currentState)
    console.log("Reveal Cards: ", this.model.revealCards.map(card=>card.dataset.index))
  }
  resetCards() {
    console.log(this)
    this.view.flipCards(...this.model.revealCards)//傳進去的值要是一個一個拆開的，進去後在組回array
    this.model.emptyRevealCard()
    this.currentState = GAME_STATE.FirstCardAwaits
  }
}

class utility{
  //一些小工具放在utility
  static getRandomNumberArray(count) {
    //此function的功能是打亂一個array
    //概念與洗牌一樣
    const number = Array.from(Array(count).keys())
    //從牌的最後尾抽一張牌，和它前面一張或是自己交換，一直到第二張
    for (let index = number.length - 1; index > 0; index--){
      //以下的random包含index自己也會出現
      const randomIndex = Math.floor(Math.random() * (index + 1))
      //下面的分號是給上面這句的尾巴，避免瀏覽器讀成Math.floor()[]=>一定要加
      //概念和python互換一樣
      ;[number[randomIndex], number[index]] = [number[index], number[randomIndex]]
    }
    return number
  }
}
const controller = new controllerObject()
controller.generateCards()
/*selectAll拿到的是node list不是array，不能用map去做*/
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", event => {
    controller.dispachCardAction(event.target)
  })
})