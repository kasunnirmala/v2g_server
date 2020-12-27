const mongoose = require('mongoose');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

const ChargingSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId() } },
    charging_mode: String,
    dRate: Number,
    t_ds: Number,
    PauseAt: Date,
    PeakStartAt: Date,
}, {
    timestamps: true
});


module.exports = mongoose.model('Charging', ChargingSchema);