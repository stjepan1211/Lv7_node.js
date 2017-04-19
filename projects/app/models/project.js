var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var projectSchema = new mongoose.Schema({  
  naziv: String,
  opis: String,
  cijena: Number,
  obavljeni: Boolean,
  voditelj: String,
  clanovi: String,
  pocetak: { type: Date, default: Date.now },
  zavrsetak: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Project', projectSchema);

