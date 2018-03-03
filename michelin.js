const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

const baseUrl = "https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/";
const nbrPages = 35;

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
async function getRestoLinksFrom(url)
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
async function getRestoFrom(url)
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

      return Resto(name, address, cp);
    }
    catch(e)
    {
      if(e.type === "request-timeout")
      {
        console.log("TIMEOUT for : " + url);
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

async function scrap()
{
  console.log("get the url");
  const promiseUrls = [];
  for(let i = 1; i<= nbrPages; i++)
  {
    const url = baseUrl + "page-" + i.toString();
    promiseUrls.push(getRestoLinksFrom(url));
  }
  const restoLinksArrays = await Promise.all(promiseUrls);
  const restoLinks = restoLinksArrays
    .filter(arr => arr != undefined && arr != [])
      .reduce((accumulator, currentArray) => accumulator.concat(currentArray), []);
  console.log("get the data")
  const promiseResto = restoLinks.map(link => getRestoFrom(link));
  const restoArray = await Promise.all(promiseResto);

  console.log("convert to json");

  //format the objects in JSON to write them in a file
  const jsonObj = restoArray.map(resto => JSON.stringify(resto, null, 4));
  const contentForFile = "[\n" + jsonObj.join(",\n") + "\n]";
  console.log("saving to file");
  fs.appendFileSync('./restaurant.json', '');
  fs.writeFileSync('./restaurant.json', contentForFile, "utf-8");
  console.log(restoArray.length.toString() + " restaurants found");
  console.log("-----Scrap complete-----");
}

scrap();