
function createMap(data){
  // base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create the overlay layers
  let markers = L.markerClusterGroup();
  let heatArray = [];
  let circleArray = [];

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let location = row.geometry;

    if (location) {
      // extract coord
      let point = [location.coordinates[1], location.coordinates[0]];

      // make marker
      let marker = L.marker(point);
      let popup = `<h3>${row.properties.place}</h3><hr><h5>Magnitude: ${row.properties.mag}</h5>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // add to heatmap
      heatArray.push(point);

      // Create circle
      // define marker (in this case a circle)
      let circleMarker = L.circle(point, {
        fillOpacity: 0.75,
        // color: chooseColor(location.coordinates[2]),
        // fillColor: chooseColor(location.coordinates[2]),
        // radius: row.properties.mag
      }).bindPopup(popup);

      circleArray.push(circleMarker);
    }
  }
  
  // create layer
  let heatLayer = L.heatLayer(heatArray, {
    radius: 25,
    blur: 20
  });

  let circleLayer = L.layerGroup(circleArray);

  // // Create the overlay layer
  // let geoLayer = L.geoJSON(geoData, {
  //   style: function(feature){
  //     return {
  //       color: '#1B1B1B',
  //       fillColor: chooseColor(feature.properties.borough),
  //       fillOpacity: .5,
  //       weight: 1.5
  //   }},
  //   onEachFeature: onEachFeature
  // });
  
  // Step 3: BUILD the Layer Controls

  // Only one base layer can be shown at a time.
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  let overlayLayers = {
    Markers: markers,
    Heatmap: heatLayer,
    Circles: circleLayer
  }

  // Step 4: INIT the Map
  let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 4,
    layers: [street, markers]
  });


  // Step 5: Add the Layer Control filter + legends as needed
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);
}

function init() {
  // Assemble the API query URL.
  // url 1 represents all earthquakes that happened in the past month
  let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
  // let url2 = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";

  d3.json(url).then(function (data) {
  //   d3.json(url2).then(function(geoData){
      createMap(data.features);
  });
}

init();