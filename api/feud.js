// api/feud.js
const axios = require('axios');

module.exports = async (req, res) => {
    // Настраиваем CORS, чтобы фронтенд мог общаться с функцией
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Нужен параметр q' });
    }

    try {
        const googleUrl = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}&hl=ru`;
        const response = await axios.get(googleUrl);
        const suggestions = response.data[1]; 

        const answers = suggestions.slice(0, 10).map((text, index) => {
            return {
                text: text.replace(/<[^>]*>?/gm, ''), // Чистим HTML
                points: 10000 - (index * 1000)
            };
        });

        res.status(200).json({
            prefix: q,
            answers: answers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка Google API' });
    }
};
