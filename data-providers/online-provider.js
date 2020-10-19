const onlineUsers=require('../onlineuser')
	, {dedecimal} =require('../etc')

module.exports={
	list() {
		var ul=[];
		onlineUsers.all.forEach((phone)=>{
			var {dbuser}=onlineUsers.get(phone), {salt, ...rest}=dbuser;
			ul.push(dedecimal(rest));
		});
		return ul;
	}
}