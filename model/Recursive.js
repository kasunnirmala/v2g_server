const mongoose = require('mongoose');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var NodeSchema = require('./node');

const RecursiveSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId() } },
    soc: Number,
    d_c_Rate: Number,
    time: Date,
    date: String,
    node: { type: mongoose.Schema.ObjectId, ref: 'Node' },
    // node: NodeSchema.schema
}, {
    timestamps: true
});


module.exports = mongoose.model('Recursive', RecursiveSchema);