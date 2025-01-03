const axios = require('axios');
const cheerio = require('cheerio');

async function tikmate(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Procurar pelo vídeo na página
        const videoUrl = $('video').attr('src');

        if (!videoUrl) {
            throw new Error('Não foi possível encontrar o vídeo.');
        }

        return {
            success: true,
            video: {
                noWatermark: videoUrl
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { tikmate };