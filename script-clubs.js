var csvUrl = "https://raw.githubusercontent.com/Ndio-S/Grassroots/main/FC_with_websites_postcodes.csv";
var map = L.map("map").setView([53.5, -2.5], 6);

// Load OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function searchClubs() {
    var postcode = document.getElementById("postcode").value;
    if (!postcode) {
        alert("Please enter a postcode.");
        return;
    }

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function (results) {
            var clubList = document.getElementById("club-list");
            clubList.innerHTML = "";

            var foundClubs = results.data.filter(club => club.Postcode === postcode);

            foundClubs.forEach(club => {
                var listItem = document.createElement("li");
                listItem.className = "club-item";
                listItem.innerHTML = `
                    <b>${club["Club Name"]}</b><br>
                    League: ${club["League"] || "Unknown"}<br>
                    <a href="${club["Website"]}" target="_blank">Visit Website</a>
                `;

                clubList.appendChild(listItem);

                // Add marker to the map
                if (club.Latitude && club.Longitude) {
                    L.marker([parseFloat(club.Latitude), parseFloat(club.Longitude)])
                        .addTo(map)
                        .bindPopup(`<b>${club["Club Name"]}</b><br><a href="${club["Website"]}" target="_blank">Visit Website</a>`);
                }
            });

            if (foundClubs.length === 0) {
                clubList.innerHTML = "<p>No clubs found for this postcode.</p>";
            }
        }
    });
}
