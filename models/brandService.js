const mongoose = require('mongoose');

const brandServiceSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required : [true, 'Must provide brand service']
	},
	
},
{ timestamps : true });

module.exports = mongoose.model('BrandService', brandServiceSchema);
