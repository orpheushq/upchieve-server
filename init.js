var mongoose = require('mongoose');

// Configuration
var config = require('./config');

// Database
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to database');
  var collection = db.collection('question');
	var jsonArr = ['./geometry.json', './algebra.json', './trigonometry.json'];
	for (var i = 0; i < jsonArr.length; i++) {
		try {
			var json = require(jsonArr[i]);
			console.log(json);
		} catch (e) {
			console.log(e);
		}
		collection.insertMany(json, function(err,result) {
	    console.log(json);
	    if (err) {
	      throw new Error(err);
	    }
	    else {
	      console.log('Successfully imported data');
	      process.exit();
	    }
	  });
	}
});
