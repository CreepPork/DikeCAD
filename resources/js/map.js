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

// 256 / 3 (the tiles don't divide evenly so the bounds don't fit precisely over the tile)
const bounds = [[0,0], [-256 / 3, 256 / 3]];

const tileLayerSettings = {
    maxZoom: 8,
    maxNativeZoom: 7,
    size: 256,
    bounds: bounds,
    noWrap: true,
    minNativeZoom: 0,
    minZoom: 3,
};

let atlas = leaflet.tileLayer('images/maps/atlas/{z}-{x}_{y}.png', tileLayerSettings);
let road = leaflet.tileLayer('images/maps/road/{z}-{x}_{y}.png', tileLayerSettings);
let satellite = leaflet.tileLayer('images/maps/satellite/{z}-{x}_{y}.png', tileLayerSettings);
let street = leaflet.tileLayer('images/maps/street/{z}-{x}_{y}.png', tileLayerSettings);
let uv = leaflet.tileLayer('images/maps/uv/{z}-{x}_{y}.png', tileLayerSettings);

const map = leaflet.map('map', {
    crs: leaflet.CRS.Simple,
    layers: [atlas, street]
}).setView(convertFromGameToLeafletCoordinates(0, -1500), 5);

const baseMaps = {
    'Atlas': atlas,
    'Road': road,
    'Satellite': satellite,
    'UV': uv
};

axios.get('/marker').then(response => {
    let markers = [];

    const data = response.data;

    for (let marker in data.markers) {
        let newMarker = leaflet.marker(
            convertFromGameToLeafletCoordinates(marker.X, marker.Y),
            {
                icon: new leaflet.Icon( {iconUrl: `images/icons/${marker.image}`} )
            }
        ).bindPopup(marker.title);

        Array.prototype.push(newMarker);
    }

    markers = leaflet.layerGroup(markers);

    const overlayMaps = {
        'Streets': street,
        'Markers': markers
    };

    map.addLayer(markers);

    leaflet.control.layers(baseMaps, overlayMaps).addTo(map);
}).catch(error => {
    console.error(error);
});

function connectViaSocket()
{
    return new Promise((resolve, reject) => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            resolve(socket);
        };

        socket.onerror = error => {
            reject(error);
        };
    });
}

let markers = [];
connectViaSocket().then(socket => {
    socket.onmessage = event => {
        const json = JSON.parse(event.data);

        console.log(json);

        if ($('#playerList').has(`#player_${json.ID}`))
        {
            $(`#player_${json.ID}`).remove();
        }

        markers.forEach(marker => {
            if (marker.title == json.ID)
            {
                marker.remove();
            }
        });

        if (json.Reason != null) return;

        if (json.ModelHash != 1581098148 && json.ModelHash != -1920001264) return;

        $('#playerList').append(`<li id="player_${json.ID}">${json.Name}</li>`);

        let icon;

        if (json.VehicleModelName != null)
        {
            if (json.IsEmergencyVehicle)
            {
                if (json.Code == 1)
                {
                    icon = new leaflet.Icon({iconUrl: 'images/icons/344.png' });
                }
                else
                {
                    if (json.Code == 2)
                    {
                        icon = new leaflet.Icon({ iconUrl: 'images/icons/345.png' });
                    }
                    else
                    {
                        icon = new leaflet.Icon({ iconUrl: 'images/icons/346.png' });
                    }
                }
            }
            else
            {
                icon = new leaflet.Icon({ iconUrl: 'images/icons/342.png' });
            }
        }
        else
        {
            icon = new leaflet.Icon({ iconUrl: 'images/icons/341.png' });
        }

        let marker = leaflet.marker(convertFromGameToLeafletCoordinates(json.Position.X, json.Position.Y), {icon: icon});
        marker.addTo(map);
        marker.title = json.ID;
        marker.bindPopup(json.Name);

        markers.push(marker);
    };
}).catch(error => {
    console.error(error);
});
