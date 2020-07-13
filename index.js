const rp= require("request-promise");
const otcsv = require("objects-to-csv");
const cheerio = require('cheerio');

const baseURL= "https://listado.mercadolibre.com.ar"
const searchURL= "/cartuchos-gtc-t-296#D[A:cartuchos gtc t 296]"

const getProducts= async() =>{
    const html= await rp(baseURL + searchURL)
    const productsMap= cheerio("a.item__info-title", html).map(async (i,e) =>{
        const link = e.attribs.href;
        const innerHtml = await rp(link);
        const price = cheerio('span.price-tag-fraction', innerHtml).text();
        const stock= cheerio('p.stock-information--available--title', innerHtml).text();
        const name = cheerio('h1.item-title__primary', innerHtml).text();
        const quantity= cheerio('span.dropdown-quantity-available', innerHtml).text();
        console.log(productsMap)
        
        return{
            price,
            stock: stock ? stock.replace('Hay stock disponible', '') : '',
            name: name ? name.replace(/(\n\t\t|\n\t\t\n\t|\n\t)/g, '') : '',
            quantity,
        }
    }).get();
    return Promise.all(productsMap);
    
}


getProducts()
  .then(result => {
    const transformed = new otcsv(result);
    return transformed.toDisk('./output.csv');
  })
  .then(() => console.log('SUCCESSFULLY COMPLETED THE WEB SCRAPING SAMPLE'));
