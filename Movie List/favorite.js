const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL= BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIE_PER_PAGE = 8
//some element
const dataPanel = document.querySelector("#data-panel") //place for render movie card

//for seach movie, the form and the input
const searchMovieForm = document.querySelector("#search-movie-form")
const searchMovieInput = document.querySelector("#search-movie-input")
const paginator = document.querySelector("#paginator")
//存放INDEX_URL拿到的電影清單
let movies = JSON.parse(localStorage.getItem("myFavoriteMovie"))
let matchMovie = []
let pageNow = 1
//以下為執行程式碼

renderMovie(getMovieByPage(1, movies), dataPanel) //要執行的程式放這裡
renderPageNavigation(movies, paginator)

dataPanel.addEventListener("click", onPanelClicked)
//Submit event是接在form裡面,
searchMovieForm.addEventListener("submit", event=>onSeachFormSubmit(event, dataPanel))
//注意因爲是要在input輸入完後才取值，所以用keyup
searchMovieInput.addEventListener("keyup", event=>onSeachFormSubmit(event, dataPanel))
//當按下pagenagitor時會前進到該頁數
paginator.addEventListener("click", (event) => {
  console.log(matchMovie)
  onPaginatorClicked(event,movies, matchMovie, dataPanel)
})


//以下為function

//此function執行如果search form被送出時要做的事情
function onSeachFormSubmit(event, dataPanel) {
  if (event.type === "submit") {
    event.preventDefault()
  }
  const movieSearchKeyword = searchMovieInput.value.toLowerCase().trim()
  if (!movieSearchKeyword) {
    //如果要輸入空值，就會render出全部的電影
    renderMovie(getMovieByPage(1, movies), dataPanel) //要執行的程式放這裡
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




//return movie
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

//點擊Movie card上面的More時會彈出Modal
function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    const id = parseInt(event.target.dataset.id, 10)
    showMovieModal(id)
  } else if (event.target.matches(".btn-add-favorite")) {

    const id = parseInt(event.target.dataset.id, 10)
    deleteFavoriteMovie(id, movies)
  }
}


//點擊More時modal的內容會更換
function showMovieModal(id) {
  const movieTitle = document.querySelector("#movie-modal-title")
  const movieImage= document.querySelector("#movie-modal-image")
  const movieDate = document.querySelector("#movie-modal-date")
  const movieDiscription = document.querySelector("#movie-modal-discription")
  const url = INDEX_URL + id
  axios.get(url).then(response => {
    const results = response.data.results
    movieTitle.textContent = results.title
    movieImage.innerHTML = `<img src="${POSTER_URL + results.image}" alt="movie-poster" class="img-fluid"></img>`
    movieDate.innerHTML= `<em>Released Date: ${results.release_date}</em>`
    movieDiscription.textContent = results.description
  })
}

function deleteFavoriteMovie(id, movies) {
  //if 沒有movies or長度爲0 直接return
  if (!movies || !movies.length) return
  
  console.log(movies)

  const movieIndex = movies.findIndex(movie => movie.id === id)
  //如果沒有找到movie=>直接return
  if (movieIndex === -1) return

  //用splice更新movies
  movies.splice(movieIndex, 1)
  //更新localStorage
  localStorage.setItem("myFavoriteMovie", JSON.stringify(movies))
  
  //如果是在searchmode裡面 就需要更新 matchMovie
  matchMovie = filterMovie(movies, movieSearchKeyword)
  const moviesList = matchMovie.length ? matchMovie : movies 
  renderMovie(getMovieByPage(pageNow, moviesList), dataPanel) //要執行的程式放這裡
}

function renderMovie(data, dataPanel) {
  let rawHTML = ""
  data.forEach(movieItem => {
    //console.log(movieItem)
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
                data-bs-target="#movie-modal" data-id="${movieItem.id}">More</button>
              <button class="btn-add-favorite btn btn-danger" data-id="${movieItem.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}


function getMovieByPage(page, movies) {
  //需要回傳slice後的movie list
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  const endIndex = startIndex + MOVIE_PER_PAGE
  return movies.slice(startIndex, endIndex)

}

function renderPageNavigation(movieList, paginator) {
  //畫出pagenavigation的頁數
  //依照movieList/ MOVIE_PER_PGE的數量
  const totalPage = Math.ceil(movieList.length / MOVIE_PER_PAGE)
  console.log()
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
}

//paginator 的監聽器
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
  renderMovie(getMovieByPage(pageNow, moviesList), dataPanel)
}