# Opa Shred Weather (Minimal Streamlit)

Minimal Streamlit weather app for embedding in Wix.

## Features

- Preset UK locations and bike parks
- Temperature
- Wind speed
- Rain now
- Humidity (moisture in air)
- Moisture conditions (trail grip estimate)
- Whether it was raining recently (last 3 hours)

## Run locally

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Deploy + embed in Wix

1. Deploy this app to Streamlit Community Cloud (public app).
2. Copy the public app URL, for example:
   `https://your-app-name.streamlit.app/?embed=true`
3. In Wix editor, add **Embed Site** (HTML iframe).
4. Paste the Streamlit URL in the iframe settings.

## Custom locations

Edit `PLACES` in `streamlit_app.py` and set:

- `name`
- `type` (Bike Park / City)
- `lat`
- `lon`