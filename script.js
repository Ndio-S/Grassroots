// Initialize the map
var map = L.map('map').setView([53.5, -2.5], 6); // Center UK

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// GitHub CSV URL
var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";

var markers = []; // Store markers for filtering

// Function to load and parse CSV
function loadCSV(url) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(club => {
                if (club.Latitude && club.Longitude && !isNaN(club.Latitude) && !isNaN(club.Longitude)) {
                    var lat = parseFloat(club.Latitude);
                    var lon = parseFloat(club.Longitude);
                    
                    if (lat !== 0 && lon !== 0) {  // Avoid invalid locations
                        var marker = L.marker([lat, lon]).addTo(map)
                            .bindPopup(`<b>${club["Club Name"]}</b><br>${club["Stadium Name"] || "Unknown Stadium"}<br><a href="${club["Wikipedia Link"]}" target="_blank">More Info</a>`);
                        
                        marker.league = club["League"] || "Unknown"; // Store league info
                        markers.push(marker);
                    }
                }
            });

            // Attach event listener for checkboxes
            document.querySelectorAll(".league-filter").forEach(checkbox => {
                checkbox.addEventListener("change", filterByLeague);
            });
        }
    });
}

// Function to get user location and highlight nearby clubs
function showUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLon = position.coords.longitude;

            // Add a marker for the user's location
            L.marker([userLat, userLon], { color: "blue" })
                .addTo(map)
                .bindPopup("📍 You are here!");

            map.setView([userLat, userLon], 10); // Zoom into user's location
        }, function(error) {
            console.error("Error getting location:", error);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to search for a club
function searchClub() {
    var input = document.getElementById("searchBox").value.toLowerCase();
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            var popupText = layer.getPopup().getContent().toLowerCase();
            if (popupText.includes(input)) {
                layer.openPopup();
            } else {
                layer.closePopup();
            }
        }
    });
}

// Function to filter clubs by league
function filterByLeague() {
    var checkedLeagues = [];
    document.querySelectorAll(".league-filter:checked").forEach(checkbox => {
        checkedLeagues.push(checkbox.value);
    });

    markers.forEach(marker => {
        if (checkedLeagues.includes(marker.league)) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Load CSV data and display markers
loadCSV(csvUrl);
showUserLocation();
