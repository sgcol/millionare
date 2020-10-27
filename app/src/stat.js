function clearCache() {
    if (!window.TDGA) return;
    cache.forEach((item)=>{
        window.TDGA[item.fn](...item.args);
    });
    cache=null;
}
var cache=[];
export default new Proxy({}, {
    get(target, fn) {
        if (window.TDGA) {
            if (cache) clearCache();
            return (...args)=>window.TDGA[fn](...args);
        }
        return (...args) =>{
            cache.push({fn, args})
        }
    }
})

// // load TDGA script
// let TDGAScript = document.createElement('script')
// TDGAScript.setAttribute('src', 'https://h5.talkingdata.com/g/h5/v1/C860613B522848BAA7F561944C23CFFD')
// document.head.appendChild(TDGAScript)