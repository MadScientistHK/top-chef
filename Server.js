const express = require('express');
const laFourchette = require('./deal.js');

const app = express();
app.use(express.static('public'));

//restaurants is null at the begining, therefor the server can
let restaurants = null;

app.get('/', (request, response) =>
{
    response.sendFile("index.html");
    console.log("send index.html to " + JSON.stringify(request));
});

app.get('/api/restaurants', (request, response) =>
{
    if(restaurants != null)
    {
        response.json(restaurants);
        console.log("send the restaurants to " + request);
    }
    else
    {
        response.send("{error:\"the restaurants are not ready to be send !\"}");
        console.log("restaurants are not ready for " + request);
    }
});

//the server start listening when the restaurants have been processed
laFourchette.getResto("./work/restaurant.json").then(result => {

    restaurants = result;

    app.listen(3000, function()
    {
        console.log("restaurants have been process");
        console.log("listening on port 3000");
    });

});