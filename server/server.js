const express = require('express');
const bodyParser = require('body-parser');
const getLifeProgress = require('./life-progress');

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/life-progress.json', (req, res) => res.json({
  "life-progress": getLifeProgress(),
}));

app.listen(port, () => console.log(`Listening on port ${port}`));
