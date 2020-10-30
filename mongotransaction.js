const getDB=require('./db.js');

getDB(async (err, db)=>{
    var session=db.mongoClient.startSession();
    try {
        await session.withTransaction(
        async()=>{
            db.users.updateOne({_id:'test'}, {$set:{a:2}}, {upsert:true, session});
            throw 'make an error'
        },{
            readPreference: 'secondaryPreferred',
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' }
        });
    }catch(e) {
        console.error(e);
    }
    session.endSession();
})