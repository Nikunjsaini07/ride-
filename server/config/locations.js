// The fixed campus hub. Every ride is either FROM or TO this hub.
export const HUB = "Shobhit University, Gangoh";
export const HUB_COORDS = { lat: 29.784863, lng: 77.281247 }; // exact — from Google Maps

// Predefined destinations students commonly travel to/from.
// All coordinates verified via OpenStreetMap Nominatim.
// Distances are approximate from Shobhit University, Gangoh.
// "order" approximates corridor position for "nearby stops" matching.
export const DESTINATIONS = [
  // ~0–5 km
  { name: "Gangoh Bus Stand",   order: 1, lat: 29.7806, lng: 77.2590 },
  { name: "Gangoh Town",        order: 1, lat: 29.7821, lng: 77.2560 },

  // ~9–20 km
  { name: "Nakur",              order: 2, lat: 29.8497, lng: 77.2980 },
  { name: "Titron",             order: 2, lat: 29.6679, lng: 77.3228 },
  { name: "Nanota",             order: 2, lat: 29.7157, lng: 77.4217 },

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
