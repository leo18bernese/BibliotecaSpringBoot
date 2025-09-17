const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const { resolve } = require('path');
const axios = require('axios');

async function generateSitemap() {
    const hostname = 'https://danicommerce.store';
    const sitemapStream = new SitemapStream({ hostname });
    const writeStream = createWriteStream(resolve('./public/sitemap.xml'));

    const staticLinks = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/ricerca', changefreq: 'monthly', priority: 0.8 },
        { url: '/cart', changefreq: 'monthly', priority: 0.5 },
        { url: '/checkout', changefreq: 'monthly', priority: 0.5 },
        { url: '/login', changefreq: 'monthly', priority: 0.3 },
        { url: '/register', changefreq: 'monthly', priority: 0.3 },
        { url: '/logout', changefreq: 'monthly', priority: 0.3 },
    ];

    sitemapStream.pipe(writeStream);

    staticLinks.forEach(link => sitemapStream.write(link));

    try {
        const response = await axios.get('/api/libri/google');
        const books = response.data;

        books.forEach(book => {
            sitemapStream.write({
                url: `/book/${book.libroId}`,
                changefreq: 'weekly',
                priority: 0.9,
            });
        });

    } catch (error) {
        console.error('Errore nel recupero dei libri dall\'API:', error.message);
    } finally {
        sitemapStream.end();
    }

    try {
        await streamToPromise(sitemapStream);
        console.log('Sitemap generata con successo!');
    } catch (error) {
        console.error('Errore nella creazione del file sitemap:', error.message);
    }
}

generateSitemap();