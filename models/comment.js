
var postModel = require('./dbse').postModel;

function Comment(name,day,title,comment){
	this.name = name;
	this.day = day;
	this.title = title;
	this.comment = comment;
};

module.exports = Comment;

Comment.prototype.save = function(callback){
	var name =  this.name,
		day = this.day,
		title = this.title,
		comment = this.comment;
	postModel.update({
		'name':name,
		'time.day':day,
		'title':title
	},{
		$push:{'comments':comment}
	},{},function(err){
		if(err){
			return callback(err)
		}
		callback(null);
	});	
};
