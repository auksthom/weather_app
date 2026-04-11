# Opa Shred Weather Widget

Simple embeddable weather app for a Wix page. It shows weather for preset UK cities and bike parks, including:

- Temperature
- Wind speed
- Rain now
- Humidity (moisture in air)
- Moisture conditions (trail grip estimate)
- Whether it was raining recently (last 3 hours)

## Data source

Uses [Open-Meteo](https://open-meteo.com/) public forecast API.

## Use in Wix

1. Upload `index.html`, `styles.css`, and `app.js` to your hosting.
2. In Wix Editor, add **Embed Code** / **Embed a Widget**.
3. Paste the hosted `index.html` URL.

## Custom locations

Edit the `places` array in `app.js` and set:

- `name`
- `type` (e.g., Bike Park / City)
- `lat`
- `lon`
