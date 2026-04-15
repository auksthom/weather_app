import datetime as dt

import requests
import streamlit as st

st.set_page_config(page_title="Opa Shred Weather", page_icon="🚵", layout="centered")

PLACES = [
    {"name": "Swinley Forest", "type": "Bike Park", "lat": 51.3944, "lon": -0.7637},
    {"name": "BikePark Wales", "type": "Bike Park", "lat": 51.7489, "lon": -3.3757},
    {"name": "Dyfi Bike Park", "type": "Bike Park", "lat": 52.5758, "lon": -3.9382},
    {"name": "Foel Gasnach", "type": "Bike Park", "lat": 52.9017, "lon": -3.9459},
    {"name": "London", "type": "City", "lat": 51.5072, "lon": -0.1276},
    {"name": "Manchester", "type": "City", "lat": 53.4808, "lon": -2.2426},
    {"name": "Bristol", "type": "City", "lat": 51.4545, "lon": -2.5879},
]


def classify_moisture(humidity: float, rain_now: float, rain_prev_3h: float) -> str:
    wet_score = humidity + rain_now * 25 + rain_prev_3h * 8
    if wet_score >= 105:
        return "Very wet / muddy"
    if wet_score >= 80:
        return "Damp and slippery"
    if wet_score >= 55:
        return "Mixed grip"
    return "Dry / good grip"


def rain_prev_3h(current_time: str, hourly_time: list[str], hourly_rain: list[float]) -> float:
    current_dt = dt.datetime.fromisoformat(current_time)
    total = 0.0
    for time_point, rain_mm in zip(hourly_time, hourly_rain):
        sample_dt = dt.datetime.fromisoformat(time_point)
        diff_hours = (current_dt - sample_dt).total_seconds() / 3600
        if 1 <= diff_hours <= 3:
            total += rain_mm or 0
    return total


def fetch_weather(lat: float, lon: float) -> dict:
    response = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "forecast_days": 1,
            "current": "temperature_2m,wind_speed_10m,relative_humidity_2m,rain",
            "hourly": "rain",
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


st.title("Opa Shred Ride Weather")
st.caption(
    "Live weather for key locations and bike parks: wind, rain, temperature, "
    "humidity, moisture conditions, and whether it rained recently."
)

place_labels = [f"{p['name']} ({p['type']})" for p in PLACES]
choice = st.selectbox("Location or bike park", options=place_labels)
selected = PLACES[place_labels.index(choice)]

if st.button("Refresh", use_container_width=True) or "loaded" not in st.session_state:
    st.session_state["loaded"] = True
    with st.spinner(f"Loading weather for {selected['name']}..."):
        data = fetch_weather(selected["lat"], selected["lon"])
        st.session_state["weather_data"] = data
        st.session_state["selected"] = selected

if "weather_data" in st.session_state:
    current = st.session_state["weather_data"]["current"]
    hourly = st.session_state["weather_data"]["hourly"]
    selected = st.session_state["selected"]

    prev3h = rain_prev_3h(current["time"], hourly["time"], hourly["rain"])
    moisture = classify_moisture(current["relative_humidity_2m"], current["rain"], prev3h)

    st.subheader(f"{selected['name']} • {selected['type']}")
    st.caption(f"Updated: {dt.datetime.fromisoformat(current['time']).strftime('%Y-%m-%d %H:%M')}")

    col1, col2 = st.columns(2)
    with col1:
        st.metric("Temperature", f"{current['temperature_2m']:.1f} °C")
        st.metric("Rain now", f"{current['rain']:.1f} mm")
        st.metric("Moisture conditions", moisture)
    with col2:
        st.metric("Wind", f"{current['wind_speed_10m']:.1f} km/h")
        st.metric("Humidity", f"{current['relative_humidity_2m']:.0f}%")
        if prev3h > 0.2:
            st.metric("Was it raining before?", f"Yes ({prev3h:.1f} mm in 3h)")
        else:
            st.metric("Was it raining before?", "No significant rain in last 3h")
