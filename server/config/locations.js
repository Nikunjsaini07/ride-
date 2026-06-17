// The fixed campus hub. Every ride is either FROM or TO this hub.
export const HUB = "Shobhit University, Gangoh";
export const HUB_COORDS = { lat: 29.784863, lng: 77.281247 }; // exact — from Google Maps

// Predefined destinations students commonly travel to/from.
// All coordinates verified via OpenStreetMap Nominatim / Census records.
// Distances are approximate from Shobhit University, Gangoh.
// "order" approximates corridor position for "nearby stops" matching.
export const DESTINATIONS = [
  // ~0–5 km (Very Close Stops & Localities)
  { name: "Gangoh Bus Stand",   order: 1, lat: 29.7806, lng: 77.2590 },
  { name: "Gangoh Town",        order: 1, lat: 29.7821, lng: 77.2560 },
  { name: "Khanpur Guzar",      order: 1, lat: 29.7900, lng: 77.2400 },
  { name: "Halvana",            order: 1, lat: 29.7400, lng: 77.2500 },
  { name: "Budha Khera",        order: 1, lat: 29.7600, lng: 77.2200 },
  { name: "Titri",              order: 1, lat: 29.8000, lng: 77.2300 },

  // ~5–10 km (Close Villages)
  { name: "Lakhnauti",          order: 1, lat: 29.7760, lng: 77.1981 },
  { name: "Mahengi",            order: 1, lat: 29.7422, lng: 77.3259 },
  { name: "Kamhera",            order: 1, lat: 29.8264, lng: 77.2689 },
  { name: "Khalidpur",          order: 1, lat: 29.7322, lng: 77.1950 },
  { name: "Dudhla",             order: 1, lat: 29.7295, lng: 77.2362 },
  { name: "Sanga Thera",        order: 1, lat: 29.7592, lng: 77.3135 },
  { name: "Barsi",              order: 1, lat: 29.7700, lng: 77.2900 },
  { name: "Dhayki",             order: 1, lat: 29.7800, lng: 77.2700 },

  // ~10–20 km (Nearby Towns & Villages)
  { name: "Nakur",              order: 2, lat: 29.8497, lng: 77.2980 },
  { name: "Titron",             order: 2, lat: 29.6679, lng: 77.3228 },
  { name: "Nanota",             order: 2, lat: 29.7157, lng: 77.4217 },
  { name: "Ambehta",            order: 2, lat: 29.8731, lng: 77.3411 },
  { name: "Tikraul",            order: 2, lat: 29.7117, lng: 77.3667 },
  { name: "Khandlana",          order: 2, lat: 29.8250, lng: 77.2950 },
  { name: "Kunda Kalan",        order: 2, lat: 29.7028, lng: 77.1672 },
  { name: "Bhabsa",             order: 2, lat: 29.8000, lng: 77.3000 },
  { name: "Sher Mau",           order: 2, lat: 29.8600, lng: 77.2700 },
  { name: "Chaupura",           order: 2, lat: 29.8100, lng: 77.2800 },
  { name: "Manpur",             order: 2, lat: 29.7300, lng: 77.3100 },

  // ~20–30 km
  { name: "Rampur Maniharan",   order: 3, lat: 29.7524, lng: 77.4654 },
  { name: "Jhinjhana",          order: 3, lat: 29.5199, lng: 77.2232 },
  { name: "Sarsawa",            order: 3, lat: 30.0175, lng: 77.4040 },
  { name: "Nanauta",            order: 3, lat: 29.7130, lng: 77.4176 },

  // ~30–50 km
  { name: "Thana Bhawan",       order: 4, lat: 29.5869, lng: 77.4169 },
  { name: "Shamli",             order: 4, lat: 29.4812, lng: 77.2901 },
  { name: "Deoband",            order: 4, lat: 29.7227, lng: 77.6712 },
  { name: "Kairana",            order: 4, lat: 29.3944, lng: 77.2053 },
  { name: "Saharanpur",         order: 5, lat: 29.9857, lng: 77.5041 },
  { name: "Behat",              order: 5, lat: 30.2126, lng: 77.7097 },
];

export const DESTINATION_NAMES = DESTINATIONS.map((d) => d.name);

export const getDestinationOrder = (name) => {
  const d = DESTINATIONS.find((x) => x.name === name);
  return d ? d.order : null;
};

export const getDestinationCoords = (name) => {
  const d = DESTINATIONS.find((x) => x.name === name);
  return d ? { lat: d.lat, lng: d.lng } : null;
};
