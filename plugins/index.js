const plugins={
    promotions:require('./promotions'),
}
const {logerr:noop}=require('../etc');

module.exports={
    attach(sock) {
        sock.on('list', async (op, cb)=>{
            var {target, ...rest}=op;
            cb=cb||noop;
            if (!plugins[target]) return cb('no such plugin');
            if (!plugins[target].list) return cb('not supported');
            try {
                var ret=await plugins[target].list({...rest, user:sock.user});
                cb(null, ret);
            } catch(e) {
                cb(e);
            }
        })
        .on('upd', async(op, cb)=>{
            var {target, ...rest}=op;
            cb=cb||noop;
            if (!plugins[target]) return cb('no such plugin');
            if (!plugins[target].update) return cb('not supported');
            try {
                cb(null, await plugins[target].update({...rest, user:sock.user}));
            }catch(e) {cb(e)}
        })
        .on('del', async (op, cb)=>{
            var {target, ...rest}=op;
            cb=cb||noop;
            if (!plugins[target]) return cb('no such plugin');
            if (!plugins[target].del) return cb('not supported');
            try {
                cb(null, await plugins[target].del({...rest, user:sock.user}));
            }catch(e) {cb(e)}
        })
        .on('create', async (op, cb)=>{
            var {target, ...rest}=op;
            cb=cb||noop;
            if (!plugins[target]) return cb('no such plugin');
            if (!plugins[target].create) return cb('not supported');
            try {
                cb(null, await plugins[target].create({...rest, user:sock.user}));
            }catch(e) {cb(e)}
        })
    },
    ...plugins,
}