const mongoose = require('mongoose');
function mongoConnect(){
    mongoose.set("strictQuery", false);
    mongoose.connect("mongodb://0.0.0.0:27017/whatsappclone", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
            console.log('Connected to MongoDB');
    }).catch(err => {
            console.error('Error connecting to MongoDB', err);
    })
}


module.exports = mongoConnect;
