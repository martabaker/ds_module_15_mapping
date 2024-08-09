// helper functions
// creates the marker size based on earthquake magnitude
function markerSize(mag){
  // Sets default radius if no magnitude is provided
  let radius = 1;

  // set radius size based on magnitude
  if (mag > 0){
    radius = mag ** 6.5
  };

  return radius
};

function markerColor(depth){
  // set default color if no depth is provided
  let color = 'black';

  // set color based on depth of earthquake
  if (depth <= 10){
    color='#58EFEC';
  } else if (depth <= 30){
    color='#75D2DA';
  } else if (depth <= 50){
    color='#92B4C7';
  } else if (depth <= 70){
    color='#AE97B5';
  } else if (depth <= 90){
    color='#CB79A2';
  } else {
    color='#E85C90';
  }

  return color
};

// function to create the map
function createMap(data, geoData){
  // base layers
  // Define variables for the tile layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Overlay layers
  let markers = L.markerClusterGroup();
  let heatArray = [];
  let circleArray = [];

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let location = row.geometry;

    if (location) {
      // extract coordinates
      // geoJSON lists coordinates as (longitude, latitude), need to switch to (latitude, longitude)
      let point = [location.coordinates[1], location.coordinates[0]];

      // make markers
      let marker = L.marker(point);
      let popup = `<h3>${row.properties.place}</h3><hr><h5>Magnitude: ${row.properties.mag} | Depth: ${location.coordinates[2]}</h5>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // add to heatmap to relevant list
      heatArray.push(point);

      // Create circle marker
      // Adjust color, fill color and radius based on depth and magnitude
      let circleMarker = L.circle(point, {
        fillOpacity: 0.75,
        color: markerColor(location.coordinates[2]),
        fillColor: markerColor(location.coordinates[2]),
        radius: markerSize(row.properties.mag)
      }).bindPopup(popup);

      // Add circle markers to relevant list
      circleArray.push(circleMarker);
    }
  }
  
  // create heat layer and adjust style accordingly
  let heatLayer = L.heatLayer(heatArray, {
    radius: 10,
    minOpacity: 0.5,
    maxZoom: 11,
    blur: 15
  });

  // create marker layer
  let circleLayer = L.layerGroup(circleArray);

  // Create the geoLayer housing the tectonic plates
  let geoLayer = L.geoJSON(geoData, {
        color: '#B35B9D',
        weight: 1.5
  });
  
  // Base Layer Dict
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  // Overlay Layer Dict
  let overlayLayers = {
    Markers: markers,
    Heatmap: heatLayer,
    Circles: circleLayer,
    "Tectonic Plates": geoLayer
  }

  // Initialize the map
  let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 4,
    layers: [street, markers, geoLayer]
  });


  // Add the Layer Control filter
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);

  // Add legend
  // Code from documentation: https://leafletjs.com/examples/choropleth/
  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
      let div = L.DomUtil.create('div', 'info legend'),
          depth = [-10, 10, 30, 50, 70, 90];

      // Loop through the depth intervals and generate a label with a colored square for each interval
      for (let i = 0; i < depth.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
              depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
      return div;
  };

  // Adds legend to the map
  legend.addTo(myMap);
}

function init() {
  // Assemble the API query URL.
  // url 1 represents all earthquakes that happened in the past month
  let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
  let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(url).then(function (data) {
    // variable for data.features
    let features = data.features

    d3.json(url2).then(function(geoData){
      createMap(features, geoData);
    });
  });
}

init();