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
async function searchClubs() {
    var postcode = document.getElementById("postcode").value.trim();
    var selectedDistance = parseFloat(document.getElementById("distance").value);
    var selectedTier = parseInt(document.getElementById("league-tier").value);

    console.log("User entered postcode:", postcode);
    console.log("Selected distance:", selectedDistance, "miles");
    console.log("Selected tier:", selectedTier, "and below");

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
                if (club.Latitude && club.Longitude && club.Tier) {
                    var clubLat = parseFloat(club.Latitude);
                    var clubLon = parseFloat(club.Longitude);
                    var clubTier = parseInt(club.Tier);
                    var distance = getDistance(userLocation.lat, userLocation.lon, clubLat, clubLon);

                    // Apply both distance filter and tier filter
                    if (distance <= selectedDistance && clubTier >= selectedTier) {
                        foundClubs.push({ 
                            name: club["Club Name"],
                            league: club["League"] || "Unknown",
                            website: club["Website"],
                            distance: distance.toFixed(1),
                            tier: clubTier,
                            lat: clubLat,
                            lon: clubLon
                        });

                        L.marker([clubLat, clubLon])
                            .addTo(map)
                            .bindPopup(`<b>${club["Club Name"]}</b><br>League: ${club["League"]}
                                <br>Tier: ${clubTier}<br><a href="${club["Website"]}" target="_blank">Visit Website</a>`);
                    }
                }
            });

            console.log("Matching clubs found:", foundClubs.length);
            if (foundClubs.length === 0) {
                clubList.innerHTML = `<p>No clubs found within ${selectedDistance} miles in selected tiers. Try another postcode.</p>`;
            } else {
                foundClubs.forEach(club => {
                    clubList.innerHTML += `<li><b>${club.name}</b> - ${club.league} (Tier ${club.tier}, ${club.distance} miles away) 
                        <br><a href="${club.website}" target="_blank">Visit Website</a></li>`;
                });
            }
        }
    });
}

// Initialize the map on page load
initializeMap();
