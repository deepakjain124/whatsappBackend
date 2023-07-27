const mongoose = require('mongoose');
function mongoConnect(){
    mongoose.connect("mongodb+srv://deepakjaindj052:6lLKD4ONwUUq90Ax@whatsapp-clone.ljstovi.mongodb.net/whatsapp-clone?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
            console.log('Connected to MongoDB');
    }).catch(err => {
            console.error('Error connecting to MongoDB', err);
    })
}


module.exports = mongoConnect;
