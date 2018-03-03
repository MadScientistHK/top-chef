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

//get info of a restaurant and convert in an object
async function getResaurantFrom(url)
{
  const Resto = (name, addresse, cp) => {
    return {
      "name": name,
      "addresse": addresse,
      "cp": cp,
    }
  }
  let isTimeout = true;
  
  while(isTimeout)
  {
    try
    {
      const getDataFrom = selecteur => $(selecteur)[0].children[0].data;
      const resp = await fetch(url, fetchParameters);
      const html = await resp.text();
      const $ = await cheerio.load(html);

      let name = undefined;
      let address = undefined;
      let cp = undefined;
      let error = 0;

      try
      {
        name = getDataFrom("h1");
      }
      catch (e)
      {
        name = null;
        console.log("ERROR: cannot get name from " + url);
      }

      try
      {
        address = getDataFrom("div.thoroughfare");
      }
      catch (e)
      {
        address = null;
        console.log("ERROR: cannot get addresse from " + url);
      }

      try
      {
        cp = getDataFrom("span.postal-code");
      }
      catch (e)
      {
        cp = null;
        console.log("ERROR: cannot get cp from " + url);
      }
      isTimeout = false;

      return Restaurant(name, address, cp);
    }
    catch(e)
    {
      if(e.type === "request-timeout")
      {
        console.log("TIMEOUT at url : " + url);
      }
      else
      {
        console.log(e.text);
        console.log("this error is not a timeout\nThe querry will not be run a second time");
        isTimeout = false;
      }
    }
  }
  
}