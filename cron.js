import Scraper from './scraper';

const MOVIE_CONFIG = 'movie_config'
const MOVIE_PAGE = 'movie_page'

const _chunk = (arr, chunkSize) => {
  if (chunkSize <= 0) throw "Invalid chunk size";
  var R = [];
  for (var i=0,len=arr.length; i<len; i+=chunkSize)
    R.push(arr.slice(i,i+chunkSize));
  return R;
}

const _getMoviesPage = async (page = 1) => {
  let scraper, result
  const url = 'https://vidnext.net/movies?page=' + page
  scraper = await new Scraper().fetch(url)
  let dataSelectors = {
    parent_selector: '#main_bg > div:nth-child(5) > div > div.vc_row.wpb_row.vc_row-fluid.vc_custom_1404913114846 > div.vc_col-sm-12.wpb_column.column_container > div > div > ul > li',
    link_selector: 'a',
    title_selector: 'a > div.name',
    date_selector: 'a > div.meta > span.date',
    page
  }

  result = await scraper.getLinkMovies(dataSelectors)
  return result;
}

async function _getTableDataWithName(nameOfTable = '') {
  return {"currentPage":1,"movies":[{"link":"/videos/the-horrific-evil-monsters","title":"The Horrific Evil Monsters","date":"35 minutes ago","page":1},{"link":"/videos/uncle-vanya","title":"Uncle Vanya","date":"36 minutes ago","page":1},{"link":"/videos/the-space-between","title":"The Space Between","date":"36 minutes ago","page":1},{"link":"/videos/pasture","title":"Pasture","date":"7 hours ago","page":1},{"link":"/videos/woe","title":"Woe","date":"7 hours ago","page":1},{"link":"/videos/secrets-of-a-gold-digger-killer","title":"Secrets of a Gold Digger Killer","date":"10 hours ago","page":1},{"link":"/videos/barkers-mind-the-cats","title":"Barkers: Mind the Cats!","date":"10 hours ago","page":1},{"link":"/videos/emily-and-the-magical-journey","title":"Emily and the Magical Journey","date":"10 hours ago","page":1},{"link":"/videos/kung-fu-mulan","title":"Kung Fu Mulan","date":"10 hours ago","page":1},{"link":"/videos/the-scottish-play","title":"The Scottish Play","date":"15 hours ago","page":1},{"link":"/videos/making-something-great","title":"Making Something Great","date":"15 hours ago","page":1},{"link":"/videos/left-for-dead-the-ashley-reeves-story","title":"Left for Dead: The Ashley Reeves Story","date":"15 hours ago","page":1},{"link":"/videos/hamptons-legion","title":"Hampton's Legion","date":"15 hours ago","page":1},{"link":"/videos/buckskin","title":"Buckskin","date":"15 hours ago","page":1},{"link":"/videos/untitled-horror-movie","title":"Untitled Horror Movie","date":"1 day ago","page":1},{"link":"/videos/the-house-next-door-meet-the-blacks-2","title":"The House Next Door: Meet the Blacks 2","date":"1 day ago","page":1},{"link":"/videos/lethal-love-letter","title":"Lethal Love Letter","date":"1 day ago","page":1},{"link":"/videos/cannibal-troll","title":"Cannibal Troll","date":"2 days ago","page":1},{"link":"/videos/censor","title":"Censor","date":"2 days ago","page":1},{"link":"/videos/dinosaur-hotel","title":"Dinosaur Hotel","date":"2 days ago","page":1},{"link":"/videos/night-walk","title":"Night Walk","date":"2 days ago","page":1},{"link":"/videos/antoinette-dans-les-cevennes","title":"Antoinette dans les Cévennes","date":"2 days ago","page":1},{"link":"/videos/the-accidental-president","title":"The Accidental President","date":"2021-06-11 20:53:56","page":1},{"link":"/videos/akillas-escape","title":"Akilla's Escape","date":"2021-06-11 16:59:09","page":1},{"link":"/videos/wish-dragon","title":"Wish Dragon","date":"2021-06-11 16:58:56","page":1},{"link":"/videos/skater-girl","title":"Skater Girl","date":"2021-06-11 16:58:41","page":1},{"link":"/videos/hero-mode","title":"Hero Mode","date":"2021-06-11 02:01:53","page":1},{"link":"/videos/a-perfect-enemy","title":"A Perfect Enemy","date":"2021-06-11 01:58:01","page":1},{"link":"/videos/rogue-hostage","title":"Rogue Hostage","date":"2021-06-11 01:53:51","page":1},{"link":"/videos/instinct-2019","title":"Instinct (2019)","date":"2021-06-11 01:53:02","page":1}]}

  if (!nameOfTable) return {}
  let listMovieJson = await VIDNEXT_DB.get(nameOfTable)
  return listMovieJson ? JSON.parse(listMovieJson) : {}
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const cronMoviePageDetails = async () => {
  let moviesData = await _getTableDataWithName(MOVIE_CONFIG)
  let {currentPageDetail = 0} = moviesData;
  let newCurrentPageDetail = currentPageDetail + 1
  let pageMoviesData = await _getTableDataWithName(MOVIE_PAGE + '_' + newCurrentPageDetail)
  let {movies = []} = pageMoviesData
  let chunkMovies = _chunk(movies, 3)
  // console.log('chunkMovies', chunkMovies); return;
  try {
    await chunkMovies.forEach(async c_movies => {
      // let parallelCalls = c_movies.map(async movie => await fetch('https://vidnext.net' + movie.link))
      // let parallelResps = await Promise.all(parallelCalls);
      // console.log('parallelResps', parallelResps.length);
      await sleep(10)
      console.log('aa');
    });
  } catch (error) {
    console.log('error', error);
  }
  
  
};

const cronGetMoviesPage = async () => {
  let moviesData = await _getTableDataWithName(MOVIE_CONFIG)
  let {currentPage = 0} = moviesData;
  let newCurrentPage = currentPage + 1
  let result = await _getMoviesPage(newCurrentPage);
  if (!result) return;
  let pageMovies = {
    currentPage: newCurrentPage,
    movies: result
  };

  // Store config movies each crawl
  await VIDNEXT_DB.put(MOVIE_CONFIG, JSON.stringify({
    currentPage: newCurrentPage
  }))

  await VIDNEXT_DB.put(MOVIE_PAGE + '_' + newCurrentPage, JSON.stringify(pageMovies))
}

export { cronGetMoviesPage, cronMoviePageDetails }