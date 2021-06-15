import Scraper from './scraper';

const cronGetMoviesPage = async (page = 1) => {
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

export { cronGetMoviesPage }