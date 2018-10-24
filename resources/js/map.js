const leaflet = require('leaflet');

function convertFromGameToLeafletCoordinates(gameX, gameY) {
    let leafletX = (gameX + 5691.258167) / 144.430576;
    let leafletY = (gameY - 8380.45926) / 144.6450136;
    
    return [leafletY, leafletX];
}

function convertFromLeafletToGameCoordinates(leafletY, leafletX) {
    let gameX = 144.430576 * leafletX - 5691.258167;
    let gameY = 144.6450136 * leafletY + 8380.45926;
    
    return [gameX, gameY];
}

const map = leaflet.map('map', {
    crs: leaflet.CRS.Simple
}).setView(convertFromGameToLeafletCoordinates(0,0), 5);

// 256 / 3 ( the tiles don't divide evenly so the bounds don't fit precisely over the tile)
const bounds = [[0,0], [-85.333333333333333333333333333333, 85.333333333333333333333333333333]];

leaflet.tileLayer('images/maps/atlas/{z}-{x}_{y}.png', {
    maxZoom: 7,
    maxNativeZoom: 7,
    size: 256,
    bounds: bounds,
    noWrap: true,
    minNativeZoom: 0,
    minZoom: -20
}).addTo(map);

map.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat; // y
    var lng = coord.lng; // x
    console.log("You clicked the map at x: " + lng + " and y: " + lat);
});

// leaflet.rectangle(bounds, {color: "#f00", weight: 0.5}).addTo(map);

let socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  console.log('Connection established');
};

let markers = [];
socket.onmessage = event => {
    if (event.data == "Connection established.") return;
    let json = JSON.parse(event.data);

    markers.forEach(marker => {
        if (marker.title == json.Name)
        {
            marker.remove();
        }
    });
    
    let icon = new leaflet.Icon({iconUrl: 'images/icons/police.png'});
    
    let marker = leaflet.marker(convertFromGameToLeafletCoordinates(json.Position.X, json.Position.Y), {icon: icon});
    marker.addTo(map);
    marker.title = json.Name;
    marker.bindPopup(json.Name);
    
    markers.push(marker);
}
