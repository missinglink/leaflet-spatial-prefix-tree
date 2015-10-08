
var map = L.map('map');

// create the tile layer with correct attribution
// var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
// var osm = new L.TileLayer( osmUrl );

L.tileLayer('https://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
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
