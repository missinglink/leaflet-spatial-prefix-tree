
var quadtree = {};

quadtree.encode = function(coordinate, precision) {

  var origin = { lng: 0, lat: 0 };
  var range = { lng: 180, lat: 90 };

  var result = '';

  while(precision > 0) {
    range.lng /= 2;
    range.lat /= 2;

    if((coordinate.lng < origin.lng) && (coordinate.lat >= origin.lat)) {
      origin.lng -= range.lng;
      origin.lat += range.lat;
      result += '0';
    } else if((coordinate.lng >= origin.lng) && (coordinate.lat >= origin.lat)) {
      origin.lng += range.lng;
      origin.lat += range.lat;
      result += '1';
    } else if((coordinate.lng < origin.lng) && (coordinate.lat < origin.lat)) {
      origin.lng -= range.lng;
      origin.lat -= range.lat;
      result += '2';
    } else {
      origin.lng += range.lng;
      origin.lat -= range.lat;
      result += '3';
    }

    --precision;
  }

  return result;
};

quadtree.decode = function(encoded) {
  var origin = { lng: 0, lat: 0 };
  var error = { lng: 180, lat: 90 };

  var precision = encoded.length;
  var currentPrecision = 0;

  while(currentPrecision < precision) {
    error.lng /= 2;
    error.lat /= 2;

    var quadrant = encoded[currentPrecision];
    if(quadrant === '0') {
      origin.lng -= error.lng;
      origin.lat += error.lat;
    } else if(quadrant === '1') {
      origin.lng += error.lng;
      origin.lat += error.lat;
    } else if(quadrant === '2') {
      origin.lng -= error.lng;
      origin.lat -= error.lat;
    } else {
      origin.lng += error.lng;
      origin.lat -= error.lat;
    }

    ++currentPrecision;
  }

  return { origin: origin, error: error };
};

quadtree.neighbour = function(encoded, north, east) {
  var decoded = quadtree.decode(encoded);
  var neighbour = {
    lng: decoded.origin.lng + decoded.error.lng * east * 2,
    lat: decoded.origin.lat + decoded.error.lat * north * 2
  };

  return quadtree.encode(neighbour, encoded.length);
};

quadtree.bbox = function(encoded) {
  var decoded = quadtree.decode(encoded);

  return {
    minlng: decoded.origin.lng - decoded.error.lng,
    minlat: decoded.origin.lat - decoded.error.lat,
    maxlng: decoded.origin.lng + decoded.error.lng,
    maxlat: decoded.origin.lat + decoded.error.lat
  };
};

quadtree.envelop = function(bbox, precision) {
  var end = quadtree.encode({ lng: bbox.maxlng, lat: bbox.maxlat }, precision);

  var rowStart = quadtree.encode({ lng: bbox.minlng, lat: bbox.minlat }, precision);
  var rowEnd = quadtree.encode({ lng: bbox.maxlng, lat: bbox.minlat }, precision);

  var current = rowStart;

  var quadtrees = [];
  while (true) {
    while(current != rowEnd) {
      quadtrees.push(current);
      current = quadtree.neighbour(current, 0, 1);
    }

    if(current == end) break;

    quadtrees.push(rowEnd);

    rowEnd = quadtree.neighbour(rowEnd, 1, 0);
    rowStart = quadtree.neighbour(rowStart, 1, 0);
    current = rowStart;
  }

  quadtrees.push(end);
  return quadtrees;
};

window.quadtree = quadtree;