var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/refs/heads/main/FC_with_leagues.csv";
var map;

// Function to initialize the map only once
function initializeMap() {
    if (typeof map !== "undefined" && map.remove) {
        map.remove();
    }
    map = L.map("map").setView([53.5, -2.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
}

// Function to get lat/lon from a postcode using OpenStreetMap API
async function getCoordinates(postcode) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${postcode}`;
    let response = await fetch(url);
    let data = await response.json();
    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } else {
        return null;
    }
}

// Function to calculate distance using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Function to search for clubs based on proximity to entered postcode
async function searchClubs() {
    var postcode = document.getElementById("postcode").value.trim();
    console.log("User entered postcode:", postcode);
    if (!postcode) {
        alert("Please enter a postcode.");
        return;
    }

    let userLocation = await getCoordinates(postcode);
    if (!userLocation) {
        alert("Invalid postcode. Try again.");
        return;
    }

    console.log("User Location:", userLocation);
    
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function (results) {
            console.log("CSV Loaded:", results.data.length, "records");
            var clubList = document.getElementById("club-list");
            clubList.innerHTML = "";
            var foundClubs = [];

            results.data.forEach(club => {
                if (club.Latitude && club.Longitude) {
                    var clubLat = parseFloat(club.Latitude);
                    var clubLon = parseFloat(club.Longitude);
                    var distance = getDistance(userLocation.lat, userLocation.lon, clubLat, clubLon);
                    if (distance <= 10) {
                        foundClubs.push({ 
                            name: club["Club Name"],
                            league: club["League"] || "Unknown",
                            website: club["Website"],
                            distance: distance.toFixed(1),
                            lat: clubLat,
                            lon: clubLon
                        });
                        L.marker([clubLat, clubLon])
                            .addTo(map)
                            .bindPopup(`<b>${club["Club Name"]}</b><br><a href="${club["Website"]}" target="_blank">Visit Website</a>`);
                    }
                }
            });
            console.log("Matching clubs found:", foundClubs.length);
            if (foundClubs.length === 0) {
                clubList.innerHTML = "<p>No clubs found within 10 miles. Try another postcode.</p>";
            } else {
                foundClubs.forEach(club => {
                    clubList.innerHTML += `<li><b>${club.name}</b> - ${club.league} (${club.distance} miles away) 
                        <br><a href="${club.website}" target="_blank">Visit Website</a></li>`;
                });
            }
        }
    });
}

// Initialize the map on page load
initializeMap();
