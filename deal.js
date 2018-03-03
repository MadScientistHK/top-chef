const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

const baseUrl = "https://www.lafourchette.com/restaurant+paris#sort=QUALITY_DESC&PROMOTION_allcheckbox=on&filters%5BPROMOTION%5D%5B50_PERCENT%5D=on&filters%5BPROMOTION%5D%5B40_PERCENT%5D=on&filters%5BPROMOTION%5D%5B30_PERCENT%5D=on&filters%5BPROMOTION%5D%5B20_PERCENT%5D=on&filters%5BPROMOTION%5D%5B25_PERCENT%5D=on&filters%5BPROMOTION%5D%5BPRESTIGE_MENU%5D=on&filters%5BPROMOTION%5D%5BOTHER%5D=on";
const nbrPages = 79;

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
  const aTag = $("div.resultItem-information");
  //filter to get only link
  const filteraTag = aTag.filter(d => aTag[d].name == 'a');
  const links = [];
  for (let i = 0; i < filteraTag.length; i++)
  {
    links.push("https://www.lafourchette.com" + filteraTag[i].attribs.href)
  }
  return links;
}

//get info of a restaurant and convert in an object
async function getRestoFrom(url)
{
  const Resto = (name, addresse) => {
    return {
      "name": name,
      "addresse": addresse,
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
      let error = 0;

      try
      {
        name = getDataFrom("h3");
      }
      catch (e)
      {
        name = null;
        console.log("ERROR: cannot get name from " + url);
      }

      try
      {
        address = getDataFrom("div.resultItem-address");
      }
      catch (e)
      {
        address = null;
        console.log("ERROR: cannot get addresse from " + url);
      }
      isTimeout = false;

      return Resto(name, address);
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
    const url = baseUrl + "&page=" + i.toString();
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
  fs.appendFileSync('./work/deal.json', '');
  fs.writeFileSync('./work/deal.json', contentForFile, "utf-8");
  console.log(restoArray.length.toString() + " restaurants found");
  console.log("--\tScrap complete\t--");
}

scrap();