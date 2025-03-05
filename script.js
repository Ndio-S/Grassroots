// Initialize the map with a default view centered in the UK
var map = L.map("map").setView([53.5, -2.5], 6);

// Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// CSV dataset hosted on GitHub
var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
var markers = [];
var userMarker = null;
var searchRadiusMiles = 10; // Search radius (miles)
var searchRadiusKm = searchRadiusMiles * 1.60934; // Convert miles to km

// Function to calculate distance using Haversine formula (Earth curvature)
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in km
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Function to load and filter clubs dynamically based on user location
function updateMarkers(userLat, userLon) {
    // Remove previous markers
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    // Fetch club data from CSV and filter by distance
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function (results) {
            var nearbyClubs = [];

            results.data.forEach((club) => {
                if (club.Latitude && club.Longitude) {
                    var lat = parseFloat(club.Latitude);
                    var lon = parseFloat(club.Longitude);
                    var distance = getDistance(userLat, userLon, lat, lon);

                    if (distance <= searchRadiusKm) {
                        // Create a marker for each club within the radius
                        var marker = L.marker([lat, lon])
                            .bindPopup(
                                `<b>${club["Club Name"]}</b><br>${club["Stadium Name"] || "Unknown Stadium"}
                                <br>${distance.toFixed(1)} miles away<br>
                                <a href="${club["Wikipedia Link"]}" target="_blank">More Info</a>`
                            )
                            .addTo(map);

                        markers.push(marker);

                        // Store the club for list display
                        nearbyClubs.push({
                            name: club["Club Name"],
                            stadium: club["Stadium Name"],
                            distance: distance.toFixed(1),
                        });
                    }
                }
            });

            // Update the club list dynamically
            document.getElementById("club-count").textContent = nearbyClubs.length;
            var clubResults = document.getElementById("club-results");
            clubResults.innerHTML = "";
            nearbyClubs.forEach((club) => {
                clubResults.innerHTML += `<li><b>${club.name}</b> - ${club.stadium} (${club.distance} miles away)</li>`;
            });
        },
    });
}

// Function to track user location and update the map dynamically
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLon = position.coords.longitude;

                // Update user location display
                document.getElementById("user-location").textContent = `Lat: ${userLat}, Lon: ${userLon}`;
                map.setView([userLat, userLon], 10); // Zoom to user location

                // Remove old user marker before adding a new one
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                userMarker = L.marker([userLat, userLon], {
                    icon: L.icon({
                        iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                    }),
                })
                    .addTo(map)
                    .bindPopup("📍 You are here!");

                // Update map markers dynamically
                updateMarkers(userLat, userLon);
            },
            function (error) {
                console.error("Error getting location:", error);
                alert("Unable to access location. Please allow location permissions.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Run the user tracking function on page load
trackUserLocation();
