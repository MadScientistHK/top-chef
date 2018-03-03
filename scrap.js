const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

// parameters url
const fetchParameters = { method: 'GET',
headers: {},
follow: 20,
timeout: 10000,
compress: true,
size: 0,
body: null,
agent: null
}

//get links of each resaurants
async function getRestaurantLinksFrom(url)
{
  const resp = await fetch(url, fetchParameters);
  const html = await resp.text();
  const $ = await cheerio.load(html);
  const aTag = $("a.poi-card-link");
  //filter to get only link
  const filteraTag = aTag.filter(d => aTag[d].name == 'a');
  const links = [];
  for (let i = 0; i < filteraTag.length; i++)
  {
    links.push("https://restaurant.michelin.fr" + filteraTag[i].attribs.href)
  }
  return links;
}