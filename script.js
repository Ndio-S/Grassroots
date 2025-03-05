// Initialize the map
var map = L.map('map').setView([53.5, -2.5], 6); // Default UK center

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// GitHub CSV URL
var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
var markers = [];

// Function to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in km
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Function to load and parse CSV
function loadCSV(url, userLat, userLon) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            var nearbyClubs = [];
            
            results.data.forEach(club => {
                if (club.Latitude && club.Longitude) {
                    var lat = parseFloat(club.Latitude);
                    var lon = parseFloat(club.Longitude);
                    var distance = getDistance(userLat, userLon, lat, lon);

                    if (distance <= 50) { // Only show clubs within 50km
                        var marker = L.marker([lat, lon])
                            .bindPopup(`<b>${club["Club Name"]}</b><br>${club["Stadium Name"] || "Unknown Stadium"}<br><a href="${club["Wikipedia Link"]}" target="_blank">More Info</a>`);
                        marker.addTo(map);
                        markers.push(marker);

                        nearbyClubs.push({
                            name: club["Club Name"],
                            stadium: club["Stadium Name"],
                            distance: distance.toFixed(1)
                        });
                    }
                }
            });

            // Display nearby clubs in the list
            document.getElementById("club-count").textContent = nearbyClubs.length;
            var clubResults = document.getElementById("club-results");
            clubResults.innerHTML = "";
            nearbyClubs.forEach(club => {
                clubResults.innerHTML += `<li><b>${club.name}</b> - ${club.stadium} (${club.distance} km away)</li>`;
            });
        }
    });
}

// Function to get user location
function showUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLon = position.coords.longitude;

            // Update user location text
            document.getElementById("user-location").textContent = `Lat: ${userLat}, Lon: ${userLon}`;

            // Center map on user
            map.setView([userLat, userLon], 10);

            // Add user marker
            L.marker([userLat, userLon], { color: "blue" })
                .addTo(map)
                .bindPopup("📍 You are here!");

            // Load CSV and filter nearby clubs
            loadCSV(csvUrl, userLat, userLon);
        }, function(error) {
            console.error("Error getting location:", error);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Run on page load
showUserLocation();
