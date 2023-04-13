//以下存放api的url
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL= BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"

//此為一頁之中會輸出幾個movie
const MOVIE_PER_PAGE = 8

//dataPanel渲染movie卡片和list的地方
const dataPanel = document.querySelector("#data-panel") //place for render movie card

//搜尋欄位與搜尋按鈕
const searchMovieForm = document.querySelector("#search-movie-form")
const searchMovieInput = document.querySelector("#search-movie-input")

//畫面底下的頁數標記
const paginator = document.querySelector("#paginator")

//畫面右上角切換顯示風格的icon區塊
const cardListControlPanel = document.querySelector("#card-list-switch-panel")

//存放INDEX_URL拿到的電影清單
const movies = []
//存放搜尋完的結果
let matchMovie = []
//標記現在在第幾頁，用於pagination和頁面切換
let pageNow = 1
//紀錄現在是哪種顯示風格
let cardMode = true

//以下為執行程式碼
axios.get(INDEX_URL)
  .then(function (response) {
    // handle success
    const movie_array = response.data.results
    movies.push(...movie_array)
    renderMovie(getMovieByPage(1, movies), dataPanel) //要執行的程式放這裡
    renderPageNavigation(movies, paginator)
  })
  .catch(function (error) {
    // handle error
    console.log(error)
  })
  .finally(function () {
    // always executed
  })
dataPanel.addEventListener("click", onPanelClicked)
//Submit event是接在form裡面,
searchMovieForm.addEventListener("submit", event=>onSeachFormSubmit(event, dataPanel))
//注意因爲是要在input輸入完後才取值，所以用keyup
searchMovieInput.addEventListener("keyup", event=>onSeachFormSubmit(event, dataPanel))
//當按下pagenagitor時會前進到該頁數
paginator.addEventListener("click", (event) => {
  onPaginatorClicked(event,movies, matchMovie, dataPanel)
})
//按右上角按鈕讓畫面在card和list中切換
cardListControlPanel.addEventListener("click", switchCardListDisplay)
//執行程式碼到此結束



//以下為function

//此function 讓畫面在card和list中切換
function switchCardListDisplay(event) {
  if (event.target.matches("#display-card-movie")) {
    cardMode = true
    renderMovie(getMovieByPage(pageNow, movies), dataPanel) //要執行的程式放這裡
  } else if (event.target.matches("#display-list-movie")) {
    cardMode = false
    renderMovie(getMovieByPage(pageNow, movies), dataPanel) //要執行的程式放這裡
  }
}


/*以下處理search input和submit */
//此function執行如果search form被送出時要做的事情
function onSeachFormSubmit(event, dataPanel) {
  if (event.type === "submit") {
    //注意submit的時候會重整網頁，我們不要這個效果所以要關閉
    event.preventDefault()
  }
  const movieSearchKeyword = searchMovieInput.value.toLowerCase().trim()
  if (!movieSearchKeyword) {
    matchMovie = []
    //如果要輸入空值，就會render出全部的電影
    renderMovie(getMovieByPage(1, movies), dataPanel) //要執行的程式放這裡
    //空值的時候需要再render一次全部的movie
    renderPageNavigation(movies, paginator)
    return
  } else {
    matchMovie = filterMovie(movies, movieSearchKeyword)
    if (matchMovie.length === 0 && event.type === "submit") {

      //如果沒有找到任何的電影&&是從buttonsubmit的，回傳alert
      return window.alert(`您提供的關鍵字${movieSearchKeyword}找不到任何電影`)
    } else {

      renderMovie(getMovieByPage(1, matchMovie), dataPanel) //要執行的程式放這裡
      renderPageNavigation(matchMovie, paginator)
    }
  }
}




//此function比對key word與movie title, 回傳找到的值
function filterMovie(movies, movieSearchKeyword) {
  //array三大家: map, filter, reduce
  const movieFound = movies.filter((movie) =>
    movie.title.toLowerCase().includes(movieSearchKeyword))
  return movieFound
}
/*
array.filter裡面包的是一個function可以回傳true and false
可以用箭頭函數，箭頭前方放置array中的單一項目
箭頭後方放判斷式
如果判斷式後面只有一個return，不需要有大括號
function(movie) {
  return movie.includes(...)
}
or
movie => {
  return movie.includes(...)
}
or
movie => movie.includes(...)
*/
/*以上處理search input和submit */

/*以下處理modal顯示 */
//點擊Movie card上面的More時會彈出Modal
function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    const id = parseInt(event.target.dataset.id, 10)
    const moviePoster = event.target.dataset.pic
    showMovieModal(id, moviePoster)
  } else if (event.target.matches(".btn-add-favorite")) {

    const id = parseInt(event.target.dataset.id, 10)
    addFavoriteMovie(id)
  }
}


//點擊More時modal的內容會更換
function showMovieModal(id, moviePoster) {
  const movieTitle = document.querySelector("#movie-modal-title")
  const movieImage= document.querySelector("#movie-modal-image")
  const movieDate = document.querySelector("#movie-modal-date")
  const movieDiscription = document.querySelector("#movie-modal-discription")
  const url = INDEX_URL + id
  const movieDetail = movies.find(movie => movie.id === id)
  movieTitle.textContent = movieDetail.title
  movieImage.innerHTML = `<img src="${moviePoster}" alt="movie-poster" class="img-fluid"></img>`
  movieDate.innerHTML= `<em>Released Date: ${movieDetail.release_date}</em>`
  movieDiscription.textContent = movieDetail.description
  
}

/*以上處理modal顯示 */

//此function點擊愛心將movie加到我的最愛
function addFavoriteMovie(id) {
  // ||只會看一邊，所以如果getItem沒有get到
  //就會用[]
  const list = JSON.parse(localStorage.getItem("myFavoriteMovie")) || []
  const favoriteMovie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)){
    return window.alert("此電影已經在最愛清單裡面了")
  } else {
    list.push(favoriteMovie)
    localStorage.setItem("myFavoriteMovie", JSON.stringify(list))
  }
  

}

/*以下為render畫面的function */
function renderMovie(data, dataPanel) {
  let rawHTML = ""
  if (cardMode) {
    rawHTML = generateCards(data)
  } else {
    rawHTML = generateLists(data)
  }
  dataPanel.innerHTML = rawHTML
}

//產生所有的movie card
function generateCards(data) {
  let rawHTML = ""
  data.forEach(movieItem => {
    rawHTML += `
    
      <div class="col-sm-3">
        <!--一行12column，3代表橫向佔三行-->
        <!-- https://getbootstrap.com/docs/5.1/layout/columns/-->
        <div class="mb-2">
          <div class="card" style="width: 18rem;">
            <img
              src=${POSTER_URL + movieItem.image}
              class="card-img-top" alt="Movie Poster" <div class="card-body">
            <!--card body-->
            <div class="card-body">
              <h5 class="card-title">${movieItem.title}</h5>
            </div>
            <!--card footer-->
            <div class="card-footer text-muted">
              <button class="btn-show-movie btn btn-primary" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${movieItem.id}" data-pic="${POSTER_URL + movieItem.image}">More</button>
              <button class="btn-add-favorite btn btn-info" data-id="${movieItem.id}" >+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  return rawHTML
}

//產生所有的movie card
function generateLists(data) {
  let rawHTML =""

  rawHTML += '<ul class="list-group list-group-flush">'
  data.forEach(movieItem => {
    rawHTML += `
            <li class="d-flex justify-content-between align-items-center list-group-item">
              <span class="list-movie-name">${movieItem.title}</span>
              <div class="list-bottoms">
                <button class="btn-show-movie btn btn-primary" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${movieItem.id}">More</button>
                <button class="btn-add-favorite btn btn-info" data-id="${movieItem.id}">+</button>
              </div>
            </li>
    `
  })
  rawHTML += '</ul>'
  return rawHTML
}
function getMovieByPage(page, movies) {
  //需要回傳slice後的movie list
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  const endIndex = startIndex + MOVIE_PER_PAGE
  return movies.slice(startIndex, endIndex)

}

/*以上為render畫面的function */

/*以下為pagination區*/
function renderPageNavigation(movieList, paginator) {
  //畫出pagenavigation的頁數
  //依照movieList/ MOVIE_PER_PGE的數量
  const totalPage = Math.ceil(movieList.length / MOVIE_PER_PAGE)
  let pageHTML = ""
  
  for (let page = 1; page <= totalPage; page++){
    pageHTML += `
      <li class="page-item"><a class="movie-page-number page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  const rawHTML = `
     <li class="page-item"><a id="previous-page" class="page-link" href="#">Previous</a></li>
     ${pageHTML}
      <li class="page-item"><a id="next-page" class="page-link" href="#">Next</a></li>
  `
  paginator.innerHTML = rawHTML
  pageNumberChangeColor(pageNow)
}

//paginator 的監聽器，讓點即時可以更新到相應的頁面
function onPaginatorClicked(event, movies, matchMovie, dataPanel) {
  const moviesList = matchMovie.length ? matchMovie : movies 

  const totalPage = Math.ceil(moviesList.length / MOVIE_PER_PAGE)
  if (event.target.matches(".movie-page-number")) {
    pageNow = parseInt(event.target.dataset.page, 10)
  } else if (event.target.matches("#previous-page")) {
    pageNow = pageNow > 1? pageNow -1 :1
  } else if (event.target.matches("#next-page")) {
    pageNow = pageNow < totalPage? pageNow +1 :totalPage
  }
  pageNumberChangeColor(pageNow)
  renderMovie(getMovieByPage(pageNow, moviesList), dataPanel)
}

//讓pagination顯示目前的頁面
function pageNumberChangeColor(page) {

  const allMoviePage = document.querySelectorAll(".movie-page-number")
  for (let page of allMoviePage) {
    console.log(page)
    const pageID = parseInt(page.dataset.page, 10)
    if (pageID === pageNow) {
      page.parentElement.classList.add("active")
    } else {

      page.parentElement.classList.remove("active")
    }
  }
}
/*以上為pagination區*/