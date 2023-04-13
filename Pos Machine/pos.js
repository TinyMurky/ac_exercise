// ======= default data =======
const menu = document.querySelector("#menu")
const cart = document.querySelector("#cart")
const totalAmount = document.querySelector("#total-amount")
const submitButton = document.querySelector("#submit-button")
const cancelSubmitButton = document.querySelector("#cancel-submit")
const confirmSubmitButton = document.querySelector("#submit-confirm")
const submitDisplay = document.querySelector("#submit-display")

const API_URL = "https://ac-w3-dom-pos.firebaseio.com/products.json"
// 菜單資料
let productData/* = [
  {
    id: "product-1",
    imgUrl:
      "https://images.unsplash.com/photo-1558024920-b41e1887dc32?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
    name: "馬卡龍",
    price: 91
  },
  {
    id: "product-2",
    imgUrl:
      "https://images.unsplash.com/photo-1560691023-ca1f295a5173?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
    name: "草莓",
    price: 60
  },
  {
    id: "product-3",
    imgUrl:
      "https://images.unsplash.com/photo-1568271675068-f76a83a1e2d6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
    name: "奶茶",
    price: 100
  },
  {
    id: "product-4",
    imgUrl:
      "https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
    name: "冰咖啡",
    price: 180
  }
]*/
// ======= 請從這裡開始 =======
let stuffInCart = {id:1, total:0,}


function getMenuFromApi(API_URL, productData) {
  axios.get(API_URL).then(response => {
    const data = response.data
    productData= [...data]
    //get 到之後繪製card
    //要做的事情要放在then裏面
    //axio裏的東西4非同步
    //所有的code執行完後才會執行axio裏的東西
    //如果appendCard寫在外面，productData會是空的
    appendCard(menu, productData)

  }).catch(error => {
    console.log(error)
  })
}

function appendCard(menu, productData) {
  for (const product of productData) {
    menu.innerHTML += createCard(product)
  }
  
  console.log(productData)
  //創造的時候就append在menu最後面再加上event listener
  for (const child of menu.children) {
    child.addEventListener("click", event => sendItemToCart(event, productData, child))
  }
}


function createCard(product) {
  
  const card = `
      <div id="${product.id}" class="col-3" data-name="${product.name}" data-price="${product.price}">
        <div class="card">
          <img
            src="${product.imgUrl}"
            class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <a  class="btn btn-primary">加入購物車</a>
          </div>
        </div>
      </div>
  `
  return card
}
//api https://ac-w3-dom-pos.firebaseio.com/products.json
function sendItemToCart(event, productData, whereAmI) {
  if (event.target.nodeName === "A") {
    //productData.find(product => product.id === this.dataset.id)
    //find可以放入一個function,if function return true,回傳第一個找到的item本身
    console.log(whereAmI)
    const productID = whereAmI.id
    //const productName = this.dataset.name
    //const productPrice = parseInt(this.dataset.price, 10)
    const productNow = productData.find(item=> item.id === productID)
    const productName = productNow.name
    const productPrice = parseInt(productNow.price, 10)
    //stuffInCart在global
    if (productName in stuffInCart) {
      //如果紀錄用的object stuffInCart找的到產品，那就修改產品數量與金額
      modifyCartItem(cart,productName,productPrice)
    } else {
      //如果紀錄用的object stuffInCart找不到產品，那就新增產品數量與金額
      createCartItem(cart,productName,productPrice)
    }
    //更改總金額
    changeAndDisplayTotalPrice(productPrice)
  }
}

function createCartItem(cart, productName, productPrice) {
  //當購物車裏面沒有該產品時使用此function創造<li>項目

  //做一個紀錄再stuffInCart這個object裡以後可以使用
  stuffInCart[productName] = {
    price: productPrice,
    amount: 1
  }
  //生成新的購物車樣品<li>
  const cartItem = document.createElement("li")
  cartItem.className = `list-group-item`
  
  //資料用data的方法存放在<li>之後比較好更改
  cartItem.setAttribute("data-name", productName)
  cartItem.setAttribute("data-amount", "1")
  cartItem.setAttribute("data-price", productPrice)
 
  //設定<li>中的文字
  cartItem.innerHTML = `
    ${productName}x1 小計：${productPrice}
    `
  
  //<li>append到購物車
  cart.appendChild(cartItem)
  
}
function modifyCartItem(cart, productName, productPrice) {
  //如果購物車裏面已經有該產品，用此function來修改變多

  //更改stuffInCart這個object裡的資料
  stuffInCart[productName].price += productPrice
  stuffInCart[productName].amount += 1

  //如果購物車裏面已經有樣品了才會發動
  const cartItem = cart.querySelector(`[data-name="${productName}"]`)
  if (cartItem) {
    const data = cartItem.dataset

    //修改<li>裡的dataset數值
    data.amount = parseInt(data.amount,10) + 1
    data.price = parseInt(data.price, 10) + productPrice

    //設定<li>中的文字
    cartItem.innerHTML = `
    ${productName}x${data.amount} 小計：${data.price}
    `
  }
}

function changeAndDisplayTotalPrice(productPrice) {
  //用來更改總金額
  stuffInCart.total += productPrice
  totalAmount.textContent = stuffInCart.total.toString()
}

function readyToSubmit(event) {
  const submitHeader = submitDisplay.querySelector(".modal-title")
  const submitBody = submitDisplay.querySelector(".modal-body")

  submitHeader.textContent = `訂單編號：${stuffInCart.id}`
  //直接把整個購物車複製過來
  submitBody.innerHTML += "<h5>感謝購買</h5>"
  const cloneCart = cart.cloneNode(true)
  cloneCart.setAttribute("id", "clone-cart")
  submitBody.appendChild(cloneCart)
  console.log(submitHeader)

  const cloneTotal = totalAmount.parentElement.cloneNode(true)
  submitBody.appendChild(cloneTotal)
}
function closeModal(event) {
  //當model取消或確認送出時會清空model裡顯示的資料，才不會一直重疊
  if (event.target === submitDisplay || event.target === cancelSubmitButton || event.target === confirmSubmitButton) {

    const submitHeader = submitDisplay.querySelector(".modal-title")
    const submitBody = submitDisplay.querySelector(".modal-body")
    submitHeader.textContent = ""
    submitBody.innerHTML = ""
  }
}

function submit(event) {
  //按下確認送出後，如果總金額不是0，把stuffInCart淨空，id +1，購物車淨空
  if (stuffInCart.total !== 0) {
    const orderId = stuffInCart.id + 1
    stuffInCart = { id: orderId, total: 0 }
    cart.innerHTML = ""
    totalAmount.textContent = "--"
  } else {
    window.alert("Empty Cart!")
  }
}
getMenuFromApi(API_URL, productData)
//appendCard(menu,productData)
submitButton.addEventListener("click", readyToSubmit)
cancelSubmitButton.addEventListener("click", closeModal)
confirmSubmitButton.addEventListener("click", submit)
confirmSubmitButton.addEventListener("click", closeModal)
window.addEventListener("click", closeModal)