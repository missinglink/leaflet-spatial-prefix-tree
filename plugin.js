
var labelConfig = {
  noHide: true,
  className: "my-label",
  direction: 'right',
  offset: [5, 5],
  zoomAnimation: true
};

var labelConfig2 = {
  noHide: true,
  className: "my-label2",
  direction: 'right',
  offset: [-15, -10],
  zoomAnimation: true
};

var rectStyle = {
  color: "#ff0000",
  weight: 1,
  opacity: 0.3,
  fillOpacity: 0,
  lineCap: 'butt'
};

var layerGroup = L.layerGroup();
map.addLayer( layerGroup );

var quadAdapter = {
  range: ['0','1','2','3'],
  encode: function( centroid, precision ){
    return '' + quadtree.encode( centroid, precision );
  },
  bbox: function( str ){
    return quadtree.bbox( '' + str );
  },
  layers: function( currentHash, zoom ){
    var layers = {};
    // if( zoom > 4 ) layers[ currentHash.substr( 0, zoom -4 ) ] = true;
    // if( zoom > 3 ) layers[ currentHash.substr( 0, zoom -3 ) ] = true;
    if( zoom > 2 ) layers[ currentHash.substr( 0, zoom -2 ) ] = true;
    if( zoom > 1 ) layers[ currentHash.substr( 0, zoom -1 ) ] = true;
    layers[ currentHash.substr( 0, zoom ) ] = true;
    return layers;
  },
  labels: function( hash ){
    return {
      long: hash,
      short: hash.substr(-1, 1)
    };
  }
};

var slippyAdapter = {
  range: quadAdapter.range,
  encode: quadAdapter.encode,
  bbox: quadAdapter.bbox,
  layers: quadAdapter.layers,
  labels: function( hash ){

    var tile = QuadToSlippy( hash );

    return {
      long: [ tile.z, tile.x, tile.y ].join('/'),
      short: ''
    };
  }
};

function QuadToSlippy(quad) {
  var x = 0;
  var y = 0;
  var z = 0;
	quad.split("").forEach(function(char){
    x *= 2;
		y *= 2;
		z++;

		if( char == "1" || char == "3" ){
			x++;
		}

		if( char == "2" || char == "3" ){
			y++;
		}
  });
	return { x:x, y:y, z:z };
}

var hashAdapter = {
  range: Object.keys( BASE32_CODES_DICT ),
  encode: function( centroid, precision ){
    return '' + geohash.encode( centroid.lat, centroid.lng, precision );
  },
  bbox: function( str ){
    var box = geohash.decode_bbox( '' + str );
    return { minlat: box[0], minlng: box[1], maxlat: box[2], maxlng: box[3] };
  },
  layers: function( currentHash, zoom ){
    var layers = {};
    layers[ '' ] = true;
    for( var x=1; x<7; x++ ){
      if( zoom >= (x*3) && zoom < ((x+2)*3) ){
        layers[ '' + currentHash.substr( 0, x ) ] = true;
      }
    }
    return layers;
  },
  labels: function( hash ){
    return {
      long: hash,
      short: hash.substr(-1, 1)
    };
  }
};

var currentHash;
var adapter = quadAdapter;
// var adapter = hashAdapter;

var mousePositionEvent = null;

var generateCurrentHash = function( precision ){

  var center = map.getCenter();

  if( mousePositionEvent ){
    center = mousePositionEvent.latlng;
    // console.log( center );
  }

  return adapter.encode( center, precision );
};

var changeHashFunction = function( algorithm ){
  if( algorithm == 'geohash' ) adapter = hashAdapter;
  else if( algorithm == 'slippy' ) adapter = slippyAdapter;
  else adapter = quadAdapter;
  // currentHash = generateCurrentHash();
  updateLayer();
};

// 0 : 1 char
// 3 : 2 chars
// 6 : 3 chars
var zoomToHashChars = function( zoom ){
  return 1 + Math.floor( zoom / 3 );
};

var prevHash = 'foo';
function updateLayer(){

  var zoom = map.getZoom();
  var hashLength = zoom+1;

  // update current hash
  currentHash = generateCurrentHash( hashLength );

  if( adapter === hashAdapter ){
    hashLength = zoomToHashChars( zoom );
  }

  var hashPrefix = currentHash.substr( 0, hashLength );

  // console.log( 'zoom', zoom );
  // console.log( 'prevHash', prevHash );
  // console.log( 'hashPrefix', hashPrefix );

  // performance tweak
  // @todo: not that performant?
  if( prevHash != hashPrefix ){
  // console.log( 'zoom', zoom );
    layerGroup.clearLayers();

    var layers = adapter.layers( currentHash, zoom );
    for( var attr in layers ){
      drawLayer( attr, layers[attr] );
    }
  }

  prevHash = hashPrefix;
}

function drawRect( bounds, hash, showDigit ){

  // console.log('draw');

  // http://leafletjs.com/reference.html#path-options
  var poly = L.rectangle( bounds, rectStyle );
  poly.addTo( layerGroup );

  // generate labels
  var labels = adapter.labels( hash );

  // full (long) hash marker
  if( labels.long.length > 1 ){
    var marker = new L.marker( poly.getBounds().getNorthWest(), { opacity: 0.0001 });
    marker.bindLabel( labels.long, labelConfig );
    marker.addTo( layerGroup );
  }

  // large single digit marker
  if( showDigit ){
    var marker2 = new L.marker( poly.getBounds().getCenter(), { opacity: 0.0001 });
    marker2.bindLabel( labels.short, labelConfig2 );
    marker2.addTo( layerGroup );
  }
}

function drawLayer( prefix, showDigit ){
  adapter.range.forEach( function( n ){

    var hash = '' + prefix + n;
    var bbox = adapter.bbox( hash );

    var bounds = L.latLngBounds(
      L.latLng( bbox.maxlat, bbox.minlng ),
      L.latLng( bbox.minlat, bbox.maxlng )
    );

    // console.log( hash );
    // console.log( bbox );
    // console.log( bounds );

    drawRect( bounds, hash, showDigit );
  });
}

// update on changes
map.on('zoomend', updateLayer);
map.on('moveend', updateLayer);

// init
changeHashFunction( 'quadtree' );
// updateLayer();

map.on('mousemove', function( e ){
  mousePositionEvent = e;
  updateLayer();
});
