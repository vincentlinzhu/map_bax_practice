import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';


function App() {
  mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmllLXRoZS16aHUiLCJhIjoiY2w0bHVmcWJjMHF6bTNrb3Z1N2FodXhhNCJ9.ElnrnDn7jHCaYS9isGfmYw';
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-104.9903);
  const [lat, setLat] = useState(39.7392);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [lng, lat],
      zoom: zoom
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      zoom: 14, // Set the zoom level for geocoding results
      // placeholder: 'Enter an address or place name', // This placeholder text will display in the search bar
      bbox: [-105.116, 39.679, -104.898, 39.837], // Set a bounding box
      marker: false,
    });

    map.current.addControl(geocoder);

    const marker = new mapboxgl.Marker({ color: '#9370DB' }); // Create a new green marker
    geocoder.on("result", async (event) => {
    // When the geocoder returns a result
      const point = event.result.center; // Capture the result coordinates
      const tileset = 'vinnie-the-zhu.0mx616lr'; // replace this with the ID of the tileset you created
      const radius = 1609; // 1609 meters is roughly equal to one mile
      const limit = 500; // The maximum amount of results to return
      marker.setLngLat(point).addTo(map.current); // Add the marker to the map at the result coordinates
      const query = await fetch(
        `https://api.mapbox.com/v4/${tileset}/tilequery/${point[0]},${point[1]}.json?radius=${radius}&limit=${limit}&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      console.log(json);
      map.current.getSource('tilequery').setData(json);
    });
    map.current.on('load', () => {
      map.current.addSource('tilequery', {
        // Add a new source to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addsource
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
  
      map.current.addLayer({
        // Add a new layer to the map style: https://docs.mapbox.com/mapbox-gl-js/api/#map#addlayer
        id: 'tilequery-points',
        type: 'circle',
        source: 'tilequery', // Set the layer source
        paint: {
          'circle-stroke-color': 'white',
          'circle-stroke-width': {
            // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
            stops: [
              [0, 0.1],
              [18, 3]
            ],
            base: 5
          },
          'circle-radius': {
            // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
            stops: [
              [12, 5],
              [22, 180]
            ],
            base: 5
          },
          'circle-color': [
            // Specify the color each circle should be
            'match', // Use the 'match' expression: https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            ['get', 'STORE_TYPE'], // Use the result 'STORE_TYPE' property
            'Small Grocery Store',
            '#008000',
            'Supercenter',
            '#008000',
            'Superette',
            '#008000',
            'Supermarket',
            '#008000',
            'Warehouse Club Store',
            '#008000',
            'Specialty Food Store',
            '#9ACD32',
            'Convenience Store',
            '#FF8C00',
            'Convenience Store With Gas',
            '#FF8C00',
            'Pharmacy',
            '#FF8C00',
            '#FF0000' // any other store type
          ]
        }
      });
     })

    map.current.addControl(new mapboxgl.NavigationControl());

    const popup = new mapboxgl.Popup(); // Initialize a new popup

    map.current.on('mouseenter', 'tilequery-points', (event) => {
      map.current.getCanvas().style.cursor = 'pointer'; // When the cursor enters a feature, set it to a pointer
      const properties = event.features[0].properties;
      const obj = JSON.parse(properties.tilequery); // Get the feature's tilequery object (https://docs.mapbox.com/api/maps/#response-retrieve-features-from-vector-tiles)
      const coordinates = new mapboxgl.LngLat(
        properties.longitude,
        properties.latitude
      ); // Create a new LngLat object (https://docs.mapbox.com/mapbox-gl-js/api/#lnglatlike)
    
      const content = `<h3>${properties.STORE_NAME}</h3><h4>${properties.STORE_TYPE}</h4><p>${properties.ADDRESS_LINE1}</p><p>${(obj.distance / 1609.344).toFixed(2)} mi. from location</p>`;
    
      popup
        .setLngLat(coordinates) // Set the popup at the given coordinates
        .setHTML(content) // Set the popup contents equal to the HTML elements you created
        .addTo(map.current); // Add the popup to the map
    });
    
    map.current.on('mouseleave', 'tilequery-points', () => {
      map.current.getCanvas().style.cursor = ''; // Reset the cursor when it leaves the point
      popup.remove(); // Remove the popup when the cursor leaves the point
    });

  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  

  return (
    <div className="App">
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div>
        <div ref={mapContainer} className="map-container" />
      </div>
      <div>
        {/* <InformationCards/> */}
      </div>
    </div>
  );
}

export default App;
