require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const getLifeProgress = require('./life-progress');
const { getTimeTracking } = require('ical-tagged-time');

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/life-progress', (req, res) => res.json({
  "life-progress": getLifeProgress(),
}));

app.get('/api/time-tracking', async (req, res) => {
  res.json(
    await getTimeTracking(process.env.GOOGLE_CALENDAR_URL)
  )
});

app.listen(port, () => console.log(`Listening on port ${port}`));
