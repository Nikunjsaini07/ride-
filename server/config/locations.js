// The fixed campus hub. Every ride is either FROM or TO this hub.
export const HUB = "Shobhit University, Gangoh";
export const HUB_COORDS = { lat: 29.7806, lng: 77.2589 };

// Predefined destinations students commonly travel to/from.
// "order" approximates how far along the main route a stop is, so rides heading
// the same direction can be matched even when destinations differ slightly.
// "lat"/"lng" are approximate coordinates used to draw the route on the map.
export const DESTINATIONS = [
  { name: "Gangoh Bus Stand", order: 1, lat: 29.7793, lng: 77.2622 },
  { name: "Gangoh Town", order: 1, lat: 29.7821, lng: 77.2654 },
  { name: "Rampur Maniharan", order: 2, lat: 29.8009, lng: 77.4006 },
  { name: "Titron", order: 2, lat: 29.7333, lng: 77.3 },
  { name: "Nakur", order: 3, lat: 29.9176, lng: 77.3057 },
  { name: "Nanauta", order: 3, lat: 29.7125, lng: 77.4225 },
  { name: "Thana Bhawan", order: 3, lat: 29.5847, lng: 77.4131 },
  { name: "Jalalabad", order: 3, lat: 29.6147, lng: 77.4385 },
  { name: "Deoband", order: 4, lat: 29.6939, lng: 77.6792 },
  { name: "Sarsawa", order: 4, lat: 29.9606, lng: 77.4047 },
  { name: "Shamli", order: 4, lat: 29.4503, lng: 77.3097 },
  { name: "Kairana", order: 4, lat: 29.3947, lng: 77.2031 },
  { name: "Saharanpur", order: 5, lat: 29.968, lng: 77.5452 },
  { name: "Behat", order: 6, lat: 30.1722, lng: 77.6128 },
  { name: "Muzaffarnagar", order: 6, lat: 29.4727, lng: 77.7085 },
  { name: "Roorkee", order: 7, lat: 29.8543, lng: 77.888 },
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
