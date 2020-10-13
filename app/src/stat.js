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