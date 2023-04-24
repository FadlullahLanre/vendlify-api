const mongoose = require('mongoose');

const SchoolsSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required : [true, 'Must provide school name']
	},
	
},
{ timestamps : true });

module.exports = mongoose.model('School', SchoolsSchema);
