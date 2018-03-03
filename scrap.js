const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

// parameters to fetch the url
const fetchParameters = { method: 'GET',
headers: {},
follow: 20,
timeout: 10000,
compress: true,
size: 0,
body: null,
agent: null
}
