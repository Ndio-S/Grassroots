// Initialize the map
var map = L.map("map").setView([53.5, -2.5], 6);

// Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
var markers = [];

// Function to load and display clubs on the map
function loadClubs() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function (results) {
            results.data.forEach((club) => {
                if (club.Latitude && club.Longitude) {
                    var lat = parseFloat(club.Latitude);
                    var lon = parseFloat(club.Longitude);
                    
                    var marker = L.marker([lat, lon])
                        .bindPopup(`<b>${club["Club Name"]}</b><br>${club["Stadium Name"] || "Unknown Stadium"}<br>
                            <a href="${club["Wikipedia Link"]}" target="_blank">More Info</a>`)
                        .addTo(map);

                    markers.push(marker);
                }
            });
        },
    });
}

// Load clubs when page is ready
document.addEventListener("DOMContentLoaded", loadClubs);
