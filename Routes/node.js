const express = require('express');
const router = express.Router();
const NodeModel = require('../model/node');
var moment = require('moment-timezone');
const UserConfigModel = require('../model/userConfig');
const ChargingModel = require('../model/charging');
const V2GModel = require('../model/v2g');
const RecursiveModel = require('../model/Recursive');
const constants = require('../util/constants');

router.get('/', async (req, res) => {
    try {
        var Node = await NodeModel.find();
        res.json(Node);
    } catch (error) {
        res.json({ message: error.message });
    }

});


router.post('/vehicle_status', async (req, res) => {
    // console.log(req.body);
    try {
        var Node = await NodeModel.findOne({ vehicleID: req.body.vehicleID, isGoing: true });
        res.json(Node);
    } catch (error) {
        res.json({ message: error });
    }

})

router.post('/vehicle_stop', async (req, res) => {
    // console.log(req.body);
    try {
        var Node = await NodeModel.findOne({ vehicleID: req.body.vehicleID });

        var updatedNode = await NodeModel.updateOne(
            { _id: Node._id },
            {
                $set: {
                    status: constants.STATUS_STOP,
                    isGoing: false
                }
            });


        res.json(updatedNode);
    } catch (error) {
        res.json({ message: error.message });
    }

})



// router.post('/getVehicle', async (req, res) => {
//     // console.log(req.body);
//     try {
//         var Node = await NodeModel.find({ vehicleID: req.body.vehicleID});
//         res.json(Node);
//     } catch (error) {
//         res.json({ message: error });
//     }

// })


router.post('/add_node', async (req, res) => {

    // console.log(req.body);
    // res.json({ aa: moment(req.body.EndAt).tz("Asia/Colombo")});;
    var soc = req.body.soc;
    const UserConfig = new UserConfigModel({
        t_out_time: moment(req.body.EndAt).tz("Asia/Colombo"),
        t_out_date: moment(req.body.EndAt).tz("Asia/Colombo").format("YYYY-MM-DD").toString(),
        isV2G: req.body.isV2G,
        isCharging: req.body.isCharging,
        charging: req.body.isCharging ? new ChargingModel({
            charging_mode: req.body.charge_mode,
            dRate: constants.D_RATE,
            t_ds: (80 - soc) * 40 / 100,
            PauseAt: moment(req.body.PauseAt).tz("Asia/Colombo"),
            PeakStartAt: moment(req.body.PeakStartAt).tz("Asia/Colombo"),
        }) : null,
        v2g: req.body.isV2G ? new V2GModel({
            count: 1,
            dRate: constants.DIS_RATE,
        }) : null,
    });

    const Node = new NodeModel({
        isGoing: true,
        start_time: moment(req.body.StartAt).tz("Asia/Colombo"),
        start_date: moment(req.body.StartAt).tz("Asia/Colombo").format("YYYY-MM-DD").toString(),
        initial_soc: soc,
        curr_soc: soc,
        vehicleID: req.body.id,
        status: constants.STATUS_PLAY,
        end_time: moment(req.body.EndAt).tz("Asia/Colombo"),
        user_config: UserConfig,


    });

    try {
        var savedNode = await Node.save();
        console.log(savedNode);
        res.json(savedNode);
    } catch (error) {
        console.log({ message: error.message });
        res.json({ message: error.message });
    };


});


router.post('/add', async (req, res) => {

    console.log("OO");
    const Node = new NodeModel({
        isGoing: true,
        start_time: moment().tz("Asia/Colombo"),
        start_date: moment().tz("Asia/Colombo").format("YYYY-MM-DD").toString(),
        initial_soc: 80,  // percentage
        curr_soc: 80,
    });

    try {
        const savedNode = await Node.save()

        res.json(savedNode);
    } catch (error) {
        res.json({ message: error.message });

    };
});


module.exports = router;