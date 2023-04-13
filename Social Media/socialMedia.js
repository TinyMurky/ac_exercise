const BASE_URL = "https://user-list.alphacamp.io"
const ALL_USER_URL = BASE_URL + "/api/v1/users/"

const allUser = []
let matchFriend = []
let  myFriend = JSON.parse(localStorage.getItem("myFriendDict")) || {}

const searchFriendForm = document.querySelector("#search-friend-form")
const searchFriendInput = document.querySelector("#search-friend-input")
const dataPanel = document.querySelector("#data-panel")
const pagination = document.querySelector(".pagination")
const friendModal = document.querySelector("#user-info-modal")
const CARD_PER_PAGE = 10
let now_is_page = 1


axios.get(ALL_USER_URL).then(response => {
  const users_array = response.data.results
  storeUserInfo(users_array, allUser)
  renderUserCard( getPaginatorPage(1,allUser), dataPanel)
  renderPaginator(allUser)
  console.log(response)
  console.log(allUser)
})
dataPanel.addEventListener("click",onClickUserIcon) 
dataPanel.addEventListener("dragstart",dragCardStart) 
dataPanel.addEventListener("dragend",dragCardEnd) 
dataPanel.addEventListener("dragover",dragCardOver) 
pagination.addEventListener("click",onClickPage) 

//Submit event是接在form裡面,
searchFriendForm.addEventListener("submit", event=>onSeachFormSubmit(event, dataPanel))
//注意因爲是要在input輸入完後才取值，所以用keyup
searchFriendInput.addEventListener("keyup", event=>onSeachFormSubmit(event, dataPanel))
//把從ALL_USER_URL獲得的資料都展開到allUser裏

//處理modal的功能，目前只有addFriend
friendModal.addEventListener("click", onClickModal)
function onClickModal(event) {
  if (event.target.matches(".add-friend-in-modal")) {
    addFriend(event.target.dataset.id, event.target)
  }
}


function addFriend(id, target=undefined) {
  // id need to be string
  myFriend = JSON.parse(localStorage.getItem("myFriendDict")) || {}
  //如果本來就有friend，那toggle喜歡狀態
  // 如果沒有 myFriend [id]就new 一個 ＝ true
  //myFreind[id]？同時check 存在與值
  myFriend[id] = myFriend[id] ? false : true
  localStorage.setItem("myFriendDict",JSON.stringify(myFriend))
  
  const targetCardLikeBot = document.querySelector(`#card-${id}`).querySelector(".card-like-button")
  targetCardLikeBot.textContent = myFriend[id] ? "♥" : "♡"
  if (target.matches(".add-friend-in-modal")) {
    target.textContent = myFriend[id] ? "♥" : "♡"
  }
}


function storeUserInfo (user_array, allUser) {
  allUser.push(...user_array)
}

function onSeachFormSubmit(event, dataPanel) {
  if (event.type === "submit") {
    event.preventDefault()
  }
  const friendNameForSearch = searchFriendInput.value.toLowerCase().trim()

  if (!friendNameForSearch) {
    
    //設成0來直接輕空裡面的東西
    matchFriend.length = 0
    renderUserCard(getPaginatorPage(1, allUser), dataPanel)
    renderPaginator(allUser)
  } else {
    matchFriend = findMyFriend(friendNameForSearch)
    console.log("Freind:", friendNameForSearch)
    console.log("MatchFriend:", matchFriend)
    renderUserCard( getPaginatorPage(1,matchFriend), dataPanel)
    renderPaginator(matchFriend)
  }
}

//找朋友function
function findMyFriend(searchKeyword) {
  const friendFound = allUser.filter((user) => {
    return user.name.toLowerCase().includes(searchKeyword)// || user.surname.toLowerCase().includes(searchKeyword)
  })
  return friendFound
}


//幫入取得各分頁要畫的畫面
function getPaginatorPage(page, allUser){
  const pageBegin = (page - 1) * CARD_PER_PAGE
  const pageEnd = pageBegin + CARD_PER_PAGE

  return allUser.slice(pageBegin, pageEnd)
}

//render Paginator
function renderPaginator(allUser) {
  const pageWeNeedToPrint = Math.ceil(allUser.length/ CARD_PER_PAGE)
  let pageItem = ""

  for (let i = 1; i <= pageWeNeedToPrint; i++) {
    pageItem += `
      <li class="page-item"><a class="friend-page-number page-link" data-page= "${i}">${i}</a></li>
    `
  }
  const rawHTML = `
      <li class="page-item">
        <a class="friend-page-to-left page-link" aria-label="Previous">
          &laquo;
        </a>
      </li>
      ${pageItem}
      <li class="page-item">
        <a class="friend-page-to-right page-link"" aria-label="Next">
          &raquo;
        </a>
      </li>
  `
  pagination.innerHTML = rawHTML
  pageNumberChangeColor(1)
}

// render each page
function onClickPage(event) {
  const targetList = matchFriend.length? matchFriend : allUser

  const target = event.target
  const maxPage =  Math.ceil(targetList.length / CARD_PER_PAGE)
  
  //If是點頁數的話
  if (target.matches(".friend-page-number")){
    now_is_page = parseInt(target.dataset.page, 10)
  } else if (target.matches(".friend-page-to-left")) {
    now_is_page = now_is_page >1 ? now_is_page- 1 :1
  } else if (target.matches(".friend-page-to-right")) {
    now_is_page = now_is_page < maxPage ? now_is_page + 1 : maxPage
  }
  renderUserCard(getPaginatorPage(now_is_page, targetList), dataPanel)
  pageNumberChangeColor(now_is_page)
} 
function pageNumberChangeColor(page) {
  const allFriendPage = document.querySelectorAll(".friend-page-number")
  for (let pageItem of allFriendPage) {
    const pageData = parseInt(pageItem.dataset.page,10)
    if (pageData === page) {
      pageItem.parentElement.classList.add("active")
    } else {
      pageItem.parentElement.classList.remove("active")
    }
  }
}


//把allUser中所有的資訊都畫出來
function renderUserCard(allUser, dataPanel) {
  let rawHtml = ""
  
  allUser.forEach(user => {
    const userName = user.name + " " + user.surname
    const likeState = myFriend[user.id] ? "♥" : "♡"
    rawHtml += `
      <div id="card-${user.id}" class="col-20 user-card-item draggable card rounded-3 p-0 m-2 border-0 d-flex align-items-center" draggable="true"  data-id="${user.id}">
        <img src="${user.avatar}"
          class="user-icon card-img-top m-0 border-0 border-secondary rounded-3" alt="avatar" data-bs-toggle="modal"
          data-bs-target="#user-info-modal" data-id="${user.id}" draggable="false" >
        <div class="user-name-body card-body m-0 p-0">
          <p class="user-name card-text" style="font-size: smaller;">${userName}</p>
        </div>

          <div class="card-like-button fs-4 p-0 m-0" data-id="${user.id}">${likeState}</div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHtml
}


function onClickUserIcon(event) {
  //如果點擊到圖片，就用id找出user資訊更新modal
  const target = event.target
  if (target.matches(".user-icon")) {
    const id = parseInt(event.target.dataset.id,10)
    console.log(id)
    showUserInfo(id)
  } else if (target.matches(".card-like-button")) {
    addFriend(target.dataset.id, target)
  }
}

function showUserInfo(id) {
  
  const userOnClick = allUser[id - 1]
  
  //Name and Date store
  const userName = userOnClick.name + " " + userOnClick.surname
  const userBirthday = new Date(userOnClick.birthday)
  const taiwanDate = userBirthday.toISOString().split('T')[0].split("-").join("/")

  //querySelector
  const userInfoList = document.querySelector("#modal-user-info-list")
  const userModalIcon = document.querySelector("#modal-user-icon")
  const userModalName = document.querySelector("#modal-user-name")
  const addBottomInModal = document.querySelector(".add-friend-in-modal")
  const rawListHTML = `
                <li id="modal-user-email" class="list-group-item">email: ${userOnClick.email}</li>
              <li id="modal-user-gender" class="list-group-item">gender: ${userOnClick.gender}</li>
              <li id="modal-user-age" class="list-group-item">age:  ${userOnClick.age}</li>
              <li id="modal-user-region" class="list-group-item">region: ${userOnClick.region}</li>
              <li id="modal-user-birthday" class="list-group-item">birthday: ${taiwanDate}</li>
  `
  const rawIconHtml = `
            <img src="${userOnClick.avatar}"
              class="modal-user-big-icon img-fluid" alt="avatar">
  `

  userModalName.textContent = userName
  userInfoList.innerHTML = rawListHTML
  userModalIcon.innerHTML = rawIconHtml
  addBottomInModal.setAttribute("data-id", userOnClick.id)
  addBottomInModal.textContent = myFriend[userOnClick.id] ? "♥" : "♡"
}

 
/*dragCard start*/

function dragCardEnd(event) {
  if (event.target.matches(".user-card-item")) {
    event.target.classList.remove("dragging")
  }
}

function dragCardStart(event) {
  if (event.target.matches(".user-card-item")) {
    event.target.classList.add("dragging")
  }
}
function dragCardOver(event) {
  const target = event.target 
  event.preventDefault()
  const afterElement = getDragAfterElement(dataPanel,event.clientX ,event.clientY)
  const draggable = document.querySelector('.dragging')
  if (afterElement == null) {
    //dataPanel.appendChild(draggable)
  } else if (draggable.nextElementSibling === afterElement) {
    insertAfter(draggable, afterElement)
  } else {
    dataPanel.insertBefore(draggable, afterElement)
    //insertAfter(draggable, afterElement)
  }

}
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}
function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('.draggable')]//:not(.dragging)

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offsetLeft= x - box.left
    const offsetRight= x - box.right
    const offsetTop = y - box.top
    const offsetBot= y - box.bottom
    console.log(child.id,{Left:offsetLeft,right:offsetRight,Top:offsetTop,Bot:offsetBot})
    if (
      offsetLeft > 0 &&
      offsetRight < 0 &&
      offsetTop > 0 &&
      offsetBot < 0
      //offsetX < 0 && offsetX > closest.offsetX &&
      //offsetY < 0 && offsetY > closest.offsetY
    ) {
      return {
        //offsetX: offsetX,
        //offsetY: offsetY,
        element: child
      }
    } else {
      return closest
    }
  }, {
    //offsetX: Number.NEGATIVE_INFINITY,
    //offsetY: Number.NEGATIVE_INFINITY,
  }).element
}

/*drag card end*/