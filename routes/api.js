exports.getPublicStuff = function(req, res) {
  res.send('public stuff');
}

exports.getProtectedStuff = function(req, res) {
  res.send('protected stuff');
}
