var map = L.map('map').setView([53.5, -2.5], 6); // Default UK center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
var markers = [];
var userMarker = null;

// Function to calculate distance (Haversine formula)
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

// Function to load and update markers dynamically
function updateMarkers(userLat, userLon) {
    // Remove old markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Fetch and filter clubs dynamically
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            var nearbyClubs = [];

            results.data.forEach(club => {
                if (club.Latitude && club.Longitude) {
                    var lat = parseFloat(club.Latitude);
                    var lon = parseFloat(club.Longitude);
                    var distance = getDistance(userLat, userLon, lat, lon);

                    if (distance <= 50) { // Show clubs within 50km
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

            // Update club list dynamically
            document.getElementById("club-count").textContent = nearbyClubs.length;
            var clubResults = document.getElementById("club-results");
            clubResults.innerHTML = "";
            nearbyClubs.forEach(club => {
                clubResults.innerHTML += `<li><b>${club.name}</b> - ${club.stadium} (${club.distance} km away)</li>`;
            });
        }
    });
}

// Function to track user location and update clubs dynamically
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLon = position.coords.longitude;

            document.getElementById("user-location").textContent = `Lat: ${userLat}, Lon: ${userLon}`;
            map.setView([userLat, userLon], 10);

            // Update user marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.marker([userLat, userLon], { color: "blue" })
                .addTo(map)
                .bindPopup("📍 You are here!");

            // Update markers dynamically
            updateMarkers(userLat, userLon);
        }, function(error) {
            console.error("Error getting location:", error);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Run the user tracking function on page load
trackUserLocation();
