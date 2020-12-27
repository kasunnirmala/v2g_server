const NodeModel = require('./model/node');
const UserConfigModel = require('./model/userConfig');
const ChargingModel = require('./model/charging');
const RecursiveModel = require('./model/Recursive');
const V2GModel = require('./model/v2g');
var moment = require('moment-timezone');
const constants = require('./util/constants');
const { set } = require('mongoose');
const { count } = require('./model/v2g');
const userConfig = require('./model/userConfig');
require('./db');


var tso_count = 1;
setInterval(async () => {
    var count = await NodeModel.count({
        'user_config.isV2G': true,
        'isGoing': true,
        'status': 'PLAY'
    });


    var tot_available = count * 0.6;
    var tot_tso = tot_available - 5;
    var tot_dRate = count == 0 ? 0 : tot_tso / count;


    if (tso_count == 15) {
        tso_count = 1;
    } else {
        tso_count++;
    }

    var Nodes = await NodeModel.find({ 'isGoing': true });

    Nodes.forEach(async (node) => {
        if (node.user_config) {
            if (node.user_config.isCharging) {
                var data = {
                    charging_mode: node.user_config.charging.charging_mode,
                    dRate: node.user_config.charging.dRate,
                    t_ds: node.user_config.charging.t_ds,
                    curr_soc: node.curr_soc,
                    node_id: node._id
                }

                console.log(node._id);
                //charging function
                await charging(data);
            } else if (node.user_config.isV2G) {
                // node.user_config.v2g.dRate,
                var curTime = moment().tz("Asia/Colombo");
                var setTime = moment().set("hour", 18).set("minute", 30);
                if (curTime > setTime) {
                    await v2g(
                        node.curr_soc,
                        tot_dRate,
                        node._id,
                        node.user_config.v2g.count,
                        node);
                }
            }
        } else {
            console.log("Send " + node._id + " Websocket");
        }

    });






}, 1 * 1000);




async function charging(data) {
    var charging_mode = data.charging_mode;
    var curr_soc = data.curr_soc;

    if (curr_soc < 80) {
        if (charging_mode == constants.CHARGING_MODE_NORMAL) {
            if (node.status == constants.STATUS_PLAY) { normalCharging(data); }

        } else if (charging_mode == constants.CHARGING_MODE_BUDGET) {
            var curTime = moment().tz("Asia/Colombo");
            var setTime = moment().set("hour", 22).set("minute", 30);
            if (curTime > setTime) {
                if (node.status == constants.STATUS_PLAY) { normalCharging(data); }
            }
        } else if (charging_mode == constants.CHARGING_MODE_ECO) {
            console.log("ECO");
            var pauseAt = moment(data.user_config.charging.PauseAt).tz("Asia/Colombo");
            var peakStartAt = moment(data.user_config.charging.PeakStartAt).tz("Asia/Colombo");
            var endAt = moment(data.user_config.t_out_time).tz("Asia/Colombo");
            var curTime = moment().tz("Asia/Colombo");
            if (curTime > pauseAt && curTime < peakStartAt) {
                ///// set status to pause

                var updatedNode = await NodeModel.updateOne(
                    { _id: date._id },
                    {
                        $set: {
                            status: constants.STATUS_PAUSE
                        }
                    });

                console.log(updatedNode);



            } else if (curr_soc > endAt) {
                ///////set status and is going false
                var updatedNode = await NodeModel.updateOne(
                    { _id: date._id },
                    {
                        $set: {
                            status: constants.STATUS_STOP
                        }
                    });

                console.log(updatedNode);


            } else {
                var updatedNode = await NodeModel.updateOne(
                    { _id: date._id },
                    {
                        $set: {
                            status: constants.STATUS_PLAY
                        }
                    });

                console.log(updatedNode);
                if (node.status == constants.STATUS_PLAY) { normalCharging(data); }
            }


        }
    }

}



async function normalCharging(data) {
    var charging_mode = data.charging_mode;
    var cRate = data.dRate;
    var curr_soc = data.curr_soc;
    var node_id = data.node_id;


    var soc = ((curr_soc * 40 / 100) + (cRate / 60)) * 100 / 40;

    const Recursive = new RecursiveModel({
        soc: soc,
        d_c_Rate: cRate,
        time: moment().tz("Asia/Colombo"),
        date: moment().tz("Asia/Colombo").format("YYYY-MM-DD").toString(),
        node: node_id,
    });

    try {
        var savedRecursive = await Recursive.save();
        console.log(Recursive);



        var updatedNode = await NodeModel.updateOne(
            { _id: node_id },
            {
                $set: {
                    curr_soc: soc,
                    end_time: moment().tz("Asia/Colombo"),
                    isGoing: soc > 80 ? false : true,
                    status: soc > 80 ? constants.STATUS_STOP : constants.STATUS_PLAY
                }
            });

        console.log(updatedNode);




    } catch (error) {
        console.log({ message: error.message });

    };
}


async function v2g(curr_soc, dRate, node_id, count, data) {
    var soc_new = ((curr_soc * 40 / 100) - (dRate / 60)) * 100 / 40;
    var isCharging = false;
    var isv2g = true;
    var charging = null;
    if (count == 15) {
        count = 1;

        if ((soc_new - 40) * 0.4 / 0.75 < 1) {
            charging = new ChargingModel({
                charging_mode: constants.CHARGING_MODE_BUDGET,
                dRate: constants.D_RATE,
                t_ds: (80 - soc_new) * 40 / 100
            });
            isCharging = true;
            isv2g = false;
        }

    } else {
        count++;
    }



    var updatedNode = await NodeModel.updateOne(
        { _id: node_id },
        {
            $set: {
                curr_soc: soc_new,
                end_time: moment().tz("Asia/Colombo"),
                isGoing: soc_new > 80 ? false : true,
                'user_config.isV2G': isv2g,
                'user_config.isCharging': isCharging,
                'user_config.charging': charging,
                status: soc_new > 80 ? constants.STATUS_STOP : constants.STATUS_PLAY,
                'user_config.v2g.dRate': dRate,
                'user_config.v2g.count': count,

            }
        });

    console.log(updatedNode);

}

// async function test() {
//     var Nodes = await NodeModel.find({ 'isGoing': true });
//     var node = Nodes[0];
//     console.log(node.status==constants.STATUS_PLAY);

// }


// test();