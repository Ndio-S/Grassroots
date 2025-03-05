var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
var searchRadiusMiles = 10; // Search radius (miles)
var searchRadiusKm = searchRadiusMiles * 1.60934; // Convert miles to km

// Function to calculate distance using Haversine formula
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

// Function to load and display clubs within 10 miles
function loadNearbyClubs(userLat, userLon) {
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

// Function to get user location and update the list
function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLat = position.coords.latitude;
                var userLon = position.coords.longitude;
                document.getElementById("user-location").textContent = `Lat: ${userLat}, Lon: ${userLon}`;
                loadNearbyClubs(userLat, userLon);
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
