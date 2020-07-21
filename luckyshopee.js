const crypto=require('crypto')
    , request=require('request')

const url='https://pay.luckyshopee.com/sms/send',
    appId='devTestAppId', 
    appKey='fe68e63bea35f8edeae04daec0ecb722';

function makeSign(data) {
    var hash = crypto.createHash('sha256');
    hash.update();
    console.log(hash.digest('hex'));

	delete data.sign;
	var message ='', o=Object.assign({appId}, data);
	Object.keys(o).sort().map((key)=>{
		if (key=='sign') return;
		if (key=='sign_type' && ((!options) || (!options.includeSignType))) return;
		if (!o[key]) return;
		message+=''+key+'='+o[key]+'&';
	})
    hash.update(message+'key='+appKey);
	o['sign'] = hash.digest('hex');
	return o;

}

exports.sendSms=function(phone, deviceId, ip, captcha, content) {
    request.post({uri:url, json:makeSign({appId, phone, deviceId, userIp:ip, captcha, content})}, (err, header, body)=>{

    })
}