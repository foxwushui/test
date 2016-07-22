//数据库创建  连接    表的定义 
var mongoose = require('mongoose');
var settings = require('../settings');
mongoose.connect(settings.url);

var postSchema = new mongoose.Schema({
	name : String,
	title: String,
	post:String,
	time:Object,
	tags:[],
	comments:[],
	pv:Number,
	reprint_info:Object
},{
	collection:'posts'
});

var userSchema = new mongoose.Schema({
	name : String,
	password: String,
	email:String
},{
	collection:'users'
});


exports.userModel = mongoose.model('User',userSchema);
exports.postModel = mongoose.model('Post',postSchema);

