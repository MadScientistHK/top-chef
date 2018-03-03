const fetch = require('node-fetch');
const fs = require('fs');

//get the restaurants from a Json file
const getRestoFromJson = path =>
{
    const content = fs.readFileSync(path, 'utf-8');
    const arrayResto = JSON.parse(content);
    return arrayResto;
}

//get the json from LaFourchette's api
const getJsonFromApi = async apiUrl =>
{
    const response = await fetch(apiUrl, "utf-8");
    const content = response.json();
    return content;
}

//get the lafourchette id's restaurant
const getIdFrom = async resto =>
{
    const name = resto.name
    const apiUrl = "https://m.lafourchette.com/api/restaurant-prediction?name=" + name;
    let isTimeout = true;

    while(isTimeout)
    {
        try
        {
            const content = await getJsonFromApi(apiUrl);
			//check if the CP is the same
            const result = content.filter(r => resto.cp === r.address.postal_code && r.name.includes(resto.name));
            isTimeout = false;
            if (result.length > 0)
            {
                return result[0].id;
            }
            else
            {
                return null;
            }
        }
        catch(e)
        {
            if(e.errno !== "ETIMEDOUT")
            {
                isTimeout = false;
                return null;
            }
            else
            {
                console.log("retry for : " + name );
            }
        }
    }
}

//get the offers of a restaurant with his id
const getOffersFrom = async id =>
{
    if(id != null)
    {
        const apiUrl = "https://m.lafourchette.com/api/restaurant/"+ id +"/sale-type";
        const offers = await getJsonFromApi(apiUrl);
        const filteroffers = offers.filter(offer => offer.is_special_offer);
        return filteroffers;
    }
    else
    {
        return null;
    }
}

//function to create a restaurant with the lafourchette features given a michelin restaurant
const LaFourchetteResto = async MichelinResto =>
{
    const id = await getIdFrom(MichelinResto);
    const offers = await getOffersFrom(id);
    return Object.assign(MichelinResto,
    {
        id: id,
        offers: offers,
        urlFourchette: "https://www.lafourchette.com/restaurant/name/" + id
    });
}

const getLafourchetteData = async path =>
{
    console.log("reading data from " + path + " ...");
    const michelinRestoArr = getRestoFromJson(path);

    let lafourchetteRestoArr = [];

    console.log("launch queries");
    let index = 0;
    while (index < michelinRestoArr.length)
    {
        const promiseLafourchette = [];
        let nbrQueries = 50;
        if(michelinRestoArr.length - index + 1 < nbrQueries) nbrQueries = michelinRestoArr.length - index;
        for(let i = 0; i < nbrQueries; i++)
        {
            promiseLafourchette.push(LaFourchetteResto(michelinRestoArr[index]));
            index ++;
        }
        console.log("queries : " + index);
        //resolve queries
        const lafourchetteRestoArr10 = await Promise.all(promiseLafourchette);
        lafourchetteRestoArr = lafourchetteRestoArr.concat(lafourchetteRestoArr10);
    }
     

    console.log("filter to keep the revelant restaurants")
    const finalList = lafourchetteRestoArr.filter(r => r.offers != null).filter(r => r.offers.length != 0);

    console.log(michelinRestoArr.length + " restaurants have been process, " + finalList.length + " have been keep");
    console.clear();
    console.log("\n\n---------------\n");
    console.log("list of restaurants with deals :");
    finalList.map(r => console.log(r.name));
    console.log("------ Success ------");
	const jsonObj = finalList.map(r => JSON.stringify(r, null, 4));
	const contentForFile = "[\n" + jsonObj.join(",\n") + "\n]";
	console.log("saving to file");
	fs.appendFileSync('./work/deals.json', '');
	fs.writeFileSync('./work/deals.json', contentForFile, "utf-8");
    return finalList;
}

getLafourchetteData('./work/restaurant.json');