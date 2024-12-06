const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Article = require('./models/article');

const app = express();

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/scientific-journal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Настройка middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Маршруты
app.get('/', (req, res) => {
    res.render('index');
});

// API для получения всех статей
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find({}, 'title authors publicationDate');
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для поиска по названию
app.get('/api/articles/search', async (req, res) => {
    try {
        const searchQuery = req.query.title;
        const articles = await Article.find(
            { title: { $regex: searchQuery, $options: 'i' } },
            'title authors publicationDate'
        );
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для поиска по автору
app.get('/api/articles/author/:author', async (req, res) => {
    try {
        const articles = await Article.find(
            { authors: req.params.author },
            'title authors publicationDate'
        );
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для получения списка всех авторов
app.get('/api/authors', async (req, res) => {
    try {
        const authors = await Article.distinct('authors');
        res.json(authors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
