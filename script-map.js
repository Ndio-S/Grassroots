document.addEventListener("DOMContentLoaded", function () {
    console.log("📍 Map script loaded!");

    // Ensure the map div exists before initializing
    var mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("❌ ERROR: #map div not found in HTML.");
        return;
    }

    // Initialize the map centered on the UK
    var map = L.map("map").setView([53.5, -2.5], 6);

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    console.log("✅ Map initialized successfully.");

    var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_coordinates.csv";
    var markers = [];

    // Function to load and display clubs on the map
    function loadClubs() {
        console.log("📥 Fetching club data...");
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            complete: function (results) {
                console.log(`✅ CSV Loaded: ${results.data.length} clubs found.`);

                results.data.forEach((club) => {
                    if (club.Latitude && club.Longitude) {
                        var lat = parseFloat(club.Latitude);
                        var lon = parseFloat(club.Longitude);

                        var marker = L.marker([lat, lon])
                            .bindPopup(`<b>${club["Club Name"]}</b><br>${club["Stadium Name"] || "Unknown Stadium"}
                                <br><a href="${club["Wikipedia Link"]}" target="_blank">More Info</a>`)
                            .addTo(map);

                        markers.push(marker);
                    }
                });

                console.log(`✅ ${markers.length} clubs added to map.`);
            },
            error: function (err) {
                console.error("❌ CSV Parsing Error:", err);
            }
        });
    }

    // Call the function to load clubs
    loadClubs();
});
