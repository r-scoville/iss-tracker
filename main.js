// PART 1
// LIVE MAP

// Map creation
// Source: Leaflet.js. Retrieved from leafletjs.com.
const map = L.map('map').setView([0, 0], 1);
let dateString = "";

// Tile creation
// Source: OpenStreetMap. Retrieved from openstreetmap.org.
// Note: tile URL template: s = style, z = zoom, x/y = lat/long
const attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(map);

// Icon creation
// Code source: Leaflet.js. Retrieved from leafletjs.com.
// Image source: Wikimedia Commons. Retrieved from: commons.wikimedia.org.
let issIcon = L.icon({
    iconUrl: 'assets/iss-marker.png',
    iconSize: [50, 32],
    iconAnchor: [26, 16],
});
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// ISS API
// Source: WTIA. Retrieved from api.wheretheiss.at.
const api = 'https://api.wheretheiss.at/v1/satellites/25544';

// Boolean to separate map view refresh from coordinates refresh
let firstLoad = true;

async function getIssMap(){

	fetch('https://api.wheretheiss.at/v1/satellites/25544')
	.then(function(response){
        return response.json();
	})
	.then(function(json){

		const data = json;
		const latitude = data.latitude;
		const longitude = data.longitude;

		// Set marker and map view to current coordinates
		marker.setLatLng([latitude, longitude]);
		if (firstLoad) {
			map.setView([latitude, longitude], 3);

			// Call the function to fetch upcoming week's ISS objects
			dateString = getNextDays(data);
			let issDatesUrl = `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${dateString}&units=km`;
			
			playWithIssData(issDatesUrl);

			// Flip boolean to prevent map view and dates array refresh
			firstLoad = false;
		}
	
		document.getElementById('lat').textContent = latitude.toFixed(2);
		document.getElementById('long').textContent = longitude.toFixed(2);
	})
};

// Do all the things
getIssMap();

// Refresh map every second
setInterval(getIssMap, 1000);


// PART 2
// WEEKLY REPORT

function getNextDays(unixDate) {

	let dateString = "";
	let incomingDate = unixDate.timestamp;

	// Populate string to pass in for multi-date API fetch
	for(let i = 0; i < 7; i++) {
		incomingDate += 24*60*60;
		dateString += incomingDate.toString() + ",";
	}

	//console.log(dateString.slice(0,-1));
	return dateString.slice(0,-1);
}

async function playWithIssData(issDatesUrl){

	fetch(issDatesUrl)
	.then(function(response){
        return response.json();
	})
	.then(function(json){

		console.log("A week's worth of ISS data:");
		console.log(json);

		// Filter data by visibility type
		const dayVisCount = json.filter(j => j.visibility === "daylight").length;
  		document.getElementById("dv-count").innerHTML = dayVisCount;

		const eclipVisCount = json.filter(j => j.visibility === "eclipsed").length;
		document.getElementById("ev-count").innerHTML = eclipVisCount;

		// Map data to array of daily ISS velocity
		// Reduce to total velocity then average
		let avgVelocity = json.map(j => j.velocity)
			.reduce((acc, curr) => acc + curr, 0);
		avgVelocity = (avgVelocity / 7).toFixed(2);
		document.getElementById("avg-velocity").innerHTML = avgVelocity;

		// Map data to array of daily ISS altitude
		// Reduce to total altitude then average
		let avgAlt = json.map(j => j.altitude)
			.reduce((acc, curr) => acc + curr, 0);
		avgAlt = (avgAlt / 7).toFixed(2);
		document.getElementById("avg-alt").innerHTML = avgAlt;
	})
};