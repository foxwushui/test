var crypto = require('crypto');
var userModel = require('./dbse').userModel;

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback){
	var md5 = crypto.createHash('md5'),
		email_Md5 = md5.update(this.email.toLowerCase()).digest('hex');
	var user = {
		name : this.name,
		password : this.password,
		email : this.email
	}
	
	var newUser = new userModel(user);
	

	newUser.save(function(err,user){
		if(err){
			return callback(err);
		}
		callback(null,user);
	});
	
};

User.get = function(name,callback){
	userModel.findOne({name:name},function(err,user){
		if(err){
			return callback(err);
		}
		callback(null,user);
	});
};
