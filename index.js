import html from './html.js'
import contentTypes from './content-types.js'
import Scraper from './scraper.js'
import { generateJSONResponse, generateErrorJSONResponse } from './json-response.js'
import { cronGetMoviesPage } from './cron.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const searchParams = new URL(request.url).searchParams

  let url = searchParams.get('url')
  if (url && !url.match(/^[a-zA-Z]+:\/\//)) url = 'http://' + url

  const selector = searchParams.get('selector')
  const attr = searchParams.get('attr')
  const spaced = searchParams.get('spaced') // Adds spaces between tags
  const pretty = searchParams.get('pretty')

  if (!url || !selector) {
    return handleSiteRequest(request)
  }

  return handleAPIRequest({ url, selector, attr, spaced, pretty })
}

async function handleSiteRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/' || url.pathname === '') {
    return new Response(html, {
      headers: { 'content-type': contentTypes.html }
    })
  }
  if (url.pathname === '/test') {
    let result = await cronGetMoviesPage();
    return generateJSONResponse({ result }, true)
  }

  return new Response('Not found', { status: 404 })
}

async function handleAPIRequest({ url, selector, attr, spaced, pretty }) {
  let scraper, result

  try {
    scraper = await new Scraper().fetch(url)
  } catch (error) {
    return generateErrorJSONResponse(error, pretty)
  }

  try {
    if (!attr) {
      result = await scraper.querySelector(selector).getText({ spaced })
    } else {
      result = await scraper.querySelector(selector).getAttribute(attr)
    }

  } catch (error) {
    return generateErrorJSONResponse(error, pretty)
  }

  return generateJSONResponse({ result }, pretty)
}

async function _getTableDataWithName(nameOfTable = '') {
  if (!nameOfTable) return {}
  let listMovieJson = await VIDNEXT_DB.get(nameOfTable)
  return listMovieJson ? JSON.parse(listMovieJson) : {}
}

// Cronjob
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled(event))
})

const MOVIE_CONFIG = 'movie_config'
const MOVIE_PAGE = 'movie_page'

async function handleScheduled(event) {
  try {
    let moviesData = await _getTableDataWithName(MOVIE_CONFIG)
    let {currentPage = 0} = moviesData;
    let newCurrentPage = currentPage + 1
    let result = await cronGetMoviesPage(newCurrentPage);
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
  } catch (error) {
    console.log('error', error)
  }
}