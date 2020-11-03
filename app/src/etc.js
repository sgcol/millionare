Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

export const dateTimeString=(t)=>{
	t=new Date(t);
	return `${t.getFullYear().pad(4)}-${(t.getMonth()+1).pad()}-${t.getDate().pad()} ${t.getHours().pad()}:${t.getMinutes().pad()}:${t.getSeconds().pad()}`;
}

export const timeString=(t)=>{
    t=new Date(t);
    return `${t.getHours().pad()}:${t.getMinutes().pad()}:${t.getSeconds().pad()}`;
}

export const nullAsZero=(n)=>{
	if (n==null) return 0;
	return n;
}

export const nullAsSpace=(n)=>{
	if (n==null) return '';
	return n;
}