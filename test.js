const cheerioReq = require("cheerio-req");
var result = "";
for(i = 1 ; i < 36;i++){

cheerioReq("https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-"+i, (err, $) => {
    
	var tab;
	tab = $(".poi_card-display-title").text();
	//console.log(tab);
	result = toString(tab)
});

}
console.log("test");
console.log(result);

