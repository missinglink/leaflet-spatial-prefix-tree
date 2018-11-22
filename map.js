
var map = L.map('map');

// create the tile layer with correct attribution
// var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
// var osm = new L.TileLayer( osmUrl );

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  maxZoom: 18
}).addTo(map);

L.control.geocoder('search-fljxAAA').addTo(map); // BUG!


var selectedByUrl = '';
var hash = window.location.hash
hash = hash.replace('#','');  // examples #6gzm/SP/MonteiroLobato ,  #6gycf/SP/SaoPaulo or #6gkz/PR/Curitiba
if (hash) {
	// check prefixes "geohash:" (default) or "quadtree:", and city 
	var selectedByUrl = 'geohash';
	var regex = /^((geohash|quadtree):)?(.+?)(\/(.+))?$/;
	var fd = hash.match(regex);
	selectedByUrl = (fd[2]!=undefined)? fd[2]: "geohash";
	hash = fd[3]; // main!
	var city = (fd[5]!=undefined)? fd[5]: "";
	console.log("External parameters:",selectedByUrl,hash,city);
	if (city) {
		var urlCities = "https://raw.githubusercontent.com/datasets-br/city-codes/master/data/dump_osm/";
		var gsl = new L.GeoJSON.AJAX(urlCities+city+".geojson");
		gsl.addTo(map);
		// there are a simple way to get gsl centroid? if no hash, use centroid or bbox center
	}
	// if selectedByUrl=='geohash'
	var x = geohash.decode(hash);
	var hl = (hash.length>9)? 9: hash.length;
	map.setView( new L.LatLng( x.latitude, x.longitude ), (hl<5)? 1+2*hl: 8+hl );
}  else {
	map.setView( new L.LatLng( 51.5072, 0.1275 ), 5 ); // default = South-East England
}

///// for plugin.js

$(document).ready(function() {
  $('#buttons button').on('click', function(event) {
    $('#buttons button').removeClass('active');
    $(event.target).addClass('active');
    changeHashFunction( event.target.id );
  });
});



