const mongoose = require('mongoose');
var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;
var UserConfigSchema = require('./userConfig');


const NodeSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId() } },
    isGoing: Boolean,
    start_time: Date,
    start_date: String,
    initial_soc: Number,
    curr_soc: Number,
    vehicleID:String,
    end_time:Date,
    status:String,
    // user_config: { type: mongoose.Schema.ObjectId, ref: 'UserConfig' },
    user_config: UserConfigSchema.schema,
    ws_id: String,

}, {
    timestamps: true
});


module.exports = mongoose.model('Node', NodeSchema);