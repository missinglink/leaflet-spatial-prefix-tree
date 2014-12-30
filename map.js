
var map = L.map('map');

// create the tile layer with correct attribution
// var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
// var osm = new L.TileLayer( osmUrl );

L.tileLayer('https://{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18
}).addTo(map);

// start the map in South-East England
map.setView( new L.LatLng( 51.5072, 0.1275 ), 0 );


window.toggleButton = new L.Control.Button( 'geohash', {
  position: 'topright',
  className: 'toggle-button'
});

window.toggleButton.addTo(map);

window.toggleButton.on('click', function () {

  changeHashFunction( window.toggleButton._container.innerHTML );

  if( window.toggleButton._container.innerHTML == 'quadtree' ){
    window.toggleButton._container.innerHTML = 'geohash';
  } else {
    window.toggleButton._container.innerHTML = 'quadtree';
  }

  console.log( 'click', 'now', window.toggleButton._container.innerHTML );
});