const express = require('express');
const cors = require('cors');
var mongoose = require('mongoose')
const bodyParser = require(  'body-parser');
const Radio = require('./models/radio')
const File = require('./models/file')
const Group = require('./models/group')

setInterval(changeColor, 5000)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fid = 1

async function changeColor(){
    const radios = await Radio.findById(fid)
    const time = radios.activeLastTime
    const length = Date.now()-time
    let color
    if(length <= 600000){
        color = 'Green'
    }
    else if(length <= 10800000){
        color = 'Yellow'
    }
    else if(length <= 86400000){
        color = 'Red'
    }
    else if(length <= 259200000){
        color = 'Gray'
    }
    else{
        color = 'Black'
    }
    const payload = {'status':color}
    const x = await Radio.findByIdAndUpdate(fid, {$set: payload})
}

//var mongo_uri = "mongodb+srv://waris46842:4684246842@next-radio.scrbg.mongodb.net/radio?retryWrites=true&w=majority"
var mongo_uri = 'mongodb://waris46842:46842@192.168.1.194:27017/Next-Radio?authSource=admin';
mongoose.Promise = global.Promise;
async function connectToMongoDB(){
    mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
        () => {
          console.log("[success] task 2 : connected to the database ");
          clearInterval(db)
        },
        error => {
          console.log("[failed] task 2 " + error);
          //process.exit();
        }
      );
}

var db = setInterval(connectToMongoDB, 2000)

const app = express();
app.use(express.json())

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("[success] task 1 : listening on port " + port);
  });
//##################mqtt#####################
var mqtt = require('mqtt');

//const MQTT_SERVER = "test.mosquitto.org";
const MQTT_SERVER = "192.168.1.194";
const MQTT_PORT = "1883";

const dictionary = {
    'play':'mpc play',
    'pause':'mpc pause',
    'next':'mpc next',
    'prev':'mpc prev',
    'volume':'mpc volume ',
    'volume_up':'mpc volume +',
    'volume_down':'mpc volume -',
    'reboot':'reboot',
    'music_source':'mpc enable only ',
    'plays': 'plays',
    'interrupt': 'interrupt',
    'showlog':'showlog'
}

var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
});

client.on('connect', function () {
    console.log("MQTT Connect");
    client.subscribe('porsche', function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', async (topic, message) => {
    console.log(message.toString());
    
});

app.get('/command/:string', (req, res) => {
    const cmd = String(req.params.string);
    tmp = cmd.split(" ");
    if (tmp.length == 1){
        let x = dictionary[tmp[0]]
        client.publish("porsche", x);
        res.send(x);
    }
    else if (tmp.length == 2){
        let x = dictionary[tmp[0]] + tmp[1]
        client.publish("porsche", x);
        res.send(x);
    }
    else{
        res.send("This is not a proper command");
    }
});

 //####################Setting######################
app.get("/", (req, res) => {
    res.status(200).send("First Page");
  });

app.get('/radio', async (req, res) => {
    const radios = await Radio.find({})
    res.json(radios)
  });

app.get('/file', async (req, res) => {
    const file = await File.find({})
    res.json(file)
});

app.get('/command', async (req, res) => {
    const command = await Command.find({})
    res.json(command)
});

app.get('/radio/:id', async (req, res) => {
    const fid = req.params.id
    try {
        const radios = await Radio.findById(fid)
        res.json(radios)
    } catch (error) {
        res.status(400).json(error)
    }
});
  
app.post('/radio', async(req,res) => {
    const payload = req.body
    const radio = new Radio(payload)
    await radio.save()
    res.status(201).end()
});

app.put('/radio/:id', async(req,res) => {
    const payload = req.body
    const fid = req.params.id
    try {
        const radio = await Radio.findByIdAndUpdate(fid, { $set: payload })
        res.json(radio)
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/radio/:id', async (req, res) => {
    const fid = req.params.id
    try {
        await Radio.findByIdAndDelete(fid)
        res.status(204).end()
    } catch (error) {
        res.status(400).json(error)
    }
});

app.put('/boxStartTime/:time', async (req, res) => {
    const payload = {"musicBeforeOpen" : req.params.time}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/boxCloseTime/:time', async (req, res) => {
    const payload = {"musicAfterClose" : req.params.time}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/silentBeforeOpen/:time', async (req, res) => {
    const payload = {"silentBeforeOpen" : req.params.time}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})
app.put('/silentAfterClose/:time', async (req, res) => {
    const payload = {"silentAfterClose" : req.params.time}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }catch (error) {
        res.status(400).json(error)
    }
})


app.put('/mainVolume/:vol', async (req, res) => {
    const payload = {"mainVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/jingleVolume/:vol', async (req, res) => {
    const payload = {"jingleVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/musicVolume/:vol', async (req, res) => {
    const payload = {"musicVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/spotVolume/:vol', async (req, res) => {
    const payload = {"spotVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/storeIdentityVolume/:vol', async (req, res) => {
    const payload = {"storeIdentityVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/openCloseTime/', async (req, res) => {
    const week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const day = req.body.day
    const payload = {}
    payload[`${day}OpenTime`] = req.body.open
    payload[`${day}CloseTime`] = req.body.close
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/addHoliday/:day', async (req, res) => {
    try{
        const radios = await Radio.update({"_id": fid}, {
            $push: {
                holiday : req.params.day
            }
        })
    }catch (error) {
        res.status(400).json(error)
    }
})

app.put('/editCrossFade:val', async (req, res) => {
    const value = req.params.val
    try{
        const radios = await Radio.findByIdAndUpdate(fid, {$set: {'crossFade' : value}})
        res.json(radios)
        client.publish("porsche", `mpc crossfade ${value}`)
    }catch (error) {
        res.status(400).json(error)
    }
})

app.put('/setSpeechTimeBeforeOpen/:sound', async (req,res) => {
    const payload = {"timeSpeechBeforeOpen" : req.params.sound}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }

}),

app.put('/setSpeechTimeAfterClose/:sound', async (req,res) => {
    const payload = {"timeSpeechAfterClose" : req.params.sound}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }

}),

app.put('/editUploadLogFileSIze/:fileSize', async (req,res) => {
    const fileSize = req.params.fileSize
}),

app.put('/resetVolumeTime/:number', async (req,res) => {
    const number = req.params.number
})

app.put('/interrupt/', async (req,res) => {
    const payload = req.body
    const interruptFile = payload.file
    const timeToPlay = payload.time
    const radios = Radio.findById(fid)
    client.publish("porsche",`interrupt ${timeToPlay}/${interruptFile}`)
    res.sendStatus(200)
})

app.put('/setHeartbeatTime:heartbeatTime', async (req,res) => {
    const heartbeatTime = req.params.heartbeatTime
    try{
        const radios = await Radio.findByIdAndUpdate(fid, {$set: {'heartbeatTime' : heartbeatTime}})
        res.json(radios)
    }catch (error) {
        res.status(400).json(error)
    }
})

app.put('/setTimeForLog/', async (req,res) => {
    const timeForLog = req.params.timeForLog
    try{
        const radios = await Radio.findByIdAndUpdate(fid, {$set: {'timeForLog' : timeForLog}})
        res.json(radios)
    }catch (error) {
        res.status(400).json(error)
    }
})

app.put('/setAutoSync/', async (req,res) => {
    const date = req.body.dateAutoSync
    const time = req.body.timeAutoSync
        try{
            const payload = {}
            payload[`${date}SyncTime`] = time
            console.log(payload)
            const radios = await Radio.update({"_id": fid}, {
                $push: payload
            })
            res.json(radios)
        }catch (error) {
            res.status(400).json(error)
        }
})

app.use((req, res, next) => {
    const err = new Error("ERROR PATH");
    err.status = 404;
    next(err);
});
