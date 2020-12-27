const mongoose = require('mongoose');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var V2GSchema = require('./v2g');
var ChargingSchema = require('./charging');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

const UserConfigSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId() } },
    t_out_time: Date,
    t_out_date: String,
    isV2G: Boolean,
    // v2g: { type: mongoose.Schema.ObjectId, ref: 'V2G' },
    v2g: V2GSchema.schema,
    isCharging: Boolean,
    // charging: { type: mongoose.Schema.ObjectId, ref: 'Charging' },
    charging: ChargingSchema.schema
}, {
    timestamps: true
});


module.exports = mongoose.model('UserConfig', UserConfigSchema);