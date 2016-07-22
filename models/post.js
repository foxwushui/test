
var crypto = require('crypto');
var postModel = require('./dbse').postModel;

function Post (name,title,tags,post) {
	this.name = name;
	this.title = title;
	this.post = post;
	this.tags = tags;
}

module.exports = Post;


Post.prototype.save = function(callback){
	var date = new Date;
	var time = {
		year : ''+date.getFullYear(),
		month: date.getFullYear()+'-'+(date.getMonth()+1),
		day : date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
	};
	
	var post = {
		name : this.name,
		title: this.title,
		post: this.post,
		time : time,
		tags:this.tags,
		pv:0,
		comments:[],
		reprint_info:{}
	};
		
	var newPost = new postModel(post);
	
	
	postModel.findOne({
		'title':post.title
	},function(err,doc){
		if(err){
			return callback(err);
		}
		if(doc){
			return callback('文章已有重名');
		}
		newPost.save(function(err,post){
			if(err){
				return callback(err);
			}
			callback(null,post);
		});
	});
	
};

Post.getTen = function(name,page,callback){
	var query = {};
	if(name){
		query.name = name;
	}
	postModel.count({},function (err,count){
		postModel.find(query,null,{
			skip:(page-1)*10,
			limit:10,
			sort:{'_id':-1}
		},function(err,docs){
			if(err){
				return callback(err);
			}
			callback(null,docs,count);
		});
	});
};


Post.getOne = function(name,day,title,callback){
	postModel.findOne({
		'name':name,
		'title':title,
		'time.day':day
	},function(err,doc){
		if(err){
			return callback(err);
		}
		if(doc){
			postModel.update({
				'name':name,
				'title':title,
				'time.day':day
			},{
				$inc:{'pv':1}
			},{},function(err){
				if(err){
					return callback(err);
				}
			});
			callback(null,doc);
		}
	});
};

Post.edit = function (name,day,title,callback){
	postModel.findOne({
		'name':name,
		'title':title,
		'time.day':day
	},function(err,doc){
		if(err){
			return callback(err);
		}
		callback(null,doc);
	});
};

Post.update = function (name,day,title,post,callback){
	postModel.update({
		'name':name,
		'time.day':day,
		'title':title
	},{
		$set:{post:post}
	},{},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	});	
};

Post.remove = function (name,day,title,callback){
	postModel.remove({
		'name':name,
		'time.day':day,
		'title':title
	},function(err){
		if(err){
			return callback(err);
		}
		callback(null);
	});
};

Post.getTags = function(callback){
	postModel.distinct('tags',function(err,docs){
		if(err){
			return callback(err);
		}
		callback(null,docs);
	});
};

Post.getTag = function(tag,callback){
	postModel.find({
		'tags':tag
	},{
		'name':1,
		'time':1,
		'title':1
	},{
		sort:{'_id':-1}
	},function(err,docs){
		if(err){
			return callback(err);
		}
		callback(null,docs);
	});
};

Post.search = function(keyword,callback){
	var reg = new RegExp(keyword,'i');
	postModel.find({
		'title':reg
	},{
		'name':1,
		'time':1,
		'title':1
	},{
		sort:{'_id':-1}
	},function(err,docs){
		if(err){
			return callback(err);
		}
		callback(null,docs);
	});
};


Post.reprint = function(reprint_form,reprint_to,callback){
	postModel.findOne({
		'name':reprint_form.name,
		'time.day':reprint_form.day,
		'title':reprint_form.title
	},function(err,doc){
		if(err){
			return callback('error',err);
		}
		var date = new Date;
		var time = {
			year : ''+date.getFullYear(),
			month: date.getFullYear()+'-'+(date.getMonth()+1),
			day : date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
		};
		
		delete doc._id;
		doc.name = reprint_to.name;
		doc.title = (doc.title.search(/[转载]/)>-1)?doc.title:'[转载]'+doc.title;
		doc.time = time;
		doc.comments = [];
		doc.reprint_info = {'reprint_form':reprint_form};
		doc.pv = 0;
		
		postModel.update({
			'name':reprint_form.name,
			'time.day':reprint_form.day,
			'title':reprint_form.title
		},{
			$push:{
				'reprint_info.reprint_to':{
					'name':doc.name,
					'day':time.day,
					'title':doc.title
				}
			}
		},{},function(err){
			if(err){
				return callback(err);
			}
		});
		
		postModel.insert(doc,{
			safe:true
		},function(err,post){
			if(err){
				return callback(err);
			}
			callback(err,post[0])
		});
	});
};




