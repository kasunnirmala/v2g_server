const mongoose = require('mongoose');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

const V2GSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId() } },
    dRate: Number,
    count:Number
}, {
    timestamps: true
});


module.exports = mongoose.model('V2G', V2GSchema);