const express = require('express');
const cors = require('cors');
var mongoose = require('mongoose')
const bodyParser = require(  'body-parser');
const Radio = require('./models/radio')
const File = require('./models/file')
const Command = require('./models/command')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var setTimeOut = []

function callCommand(pid, vol, time){
    setTimeOut.push(setTimeout(function() {client.publish("tk/demo", `mpc volume ${vol}`); client.publish("tk/demo", `mpc play ${pid}`);}, time));
}

function calculateWaitTime(time){
    const minute = Math.floor(time)
    const second = time - minute
    const timeToWait = minute*60000 + second*100000
    return timeToWait
}

function calculateTimeBeforeOpen(openTime,time){
    const hour = parseInt(openTime.slice(0,2))
    const minute = parseInt(openTime.slice(3,5))
    const sum = 60*hour + minute - time
    const openHour = Math.floor(sum/60)
    const openMinute = sum%60
    if(openHour < 10){
        strOpenHour = '0'+openHour
    }
    else{
        strOpenHour = openHour.toString()
    }
    if(openMinute < 10){
        strOpenMinute = '0'+openMinute
    }
    else{
        strOpenMinute = openMinute.toString()
    }
    return [strOpenHour,strOpenMinute]
}

function calculateTimeAfterClose(closeTime,time){
    const hour = parseInt(closeTime.slice(0,2))
    const minute = parseInt(closeTime.slice(3,5))
    const sum = 60*hour + minute + time
    const closeHour = Math.floor(sum/60)
    const closeMinute = sum%60
    if(closeHour < 10){
        strCloseHour = '0'+openHour
    }
    else if(closeHour>=24){
        const newCloseHour = closeHour-24
        if(newCloseHour<10){
            strCloseHour = '0' + newCloseHour
        }
        else{
            strCloseHour = newCloseHour.toString()
        }
    }
    else{
        strCloseHour = closeHour.toString()
    }
    if(closeMinute < 10){
        strCloseMinute = '0'+closeMinute
    }
    else{
        strCloseMinute = closeMinute.toString()
    }
    return [strCloseHour,strCloseMinute]
}

var state = 'idle'


var mongo_uri = "mongodb+srv://waris46842:Gamerpg46842@next-radio.scrbg.mongodb.net/radio?retryWrites=true&w=majority"
mongoose.Promise = global.Promise;
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
  () => {
    console.log("[success] task 2 : connected to the database ");
  },
  error => {
    console.log("[failed] task 2 " + error);
    process.exit();
  }
);

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

const MQTT_SERVER = "test.mosquitto.org";
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
    'clearCrontab' : 'crontab -r',
    'plays': 'plays',
    'getOutput':'getOutput',
    'interrupt': 'interrupt'
}

var client = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
});

client.on('connect', function () {
    console.log("MQTT Connect");
    client.subscribe('tk/demo', function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', function (topic, message) {
    console.log(message.toString());
});

app.get('/command/:string', (req, res) => {
    const cmd = String(req.params.string);
    tmp = cmd.split(" ");
    if (tmp.length == 1){
        let x = dictionary[tmp[0]]
        client.publish("tk/demo", x);
        res.send(x);
    }
    else if (tmp.length == 2){
        let x = dictionary[tmp[0]] + tmp[1]
        client.publish("tk/demo", x);
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
    const fid = '1'
    const payload = {"musicBeforeOpen" : req.params.time}
    try {
        const radios = await Radio.findById(fid)
        const mon = calculateTimeBeforeOpen(radios["MonOpenTime"],parseInt(req.params.time))
        const tue = calculateTimeBeforeOpen(radios["TueOpenTime"],parseInt(req.params.time))
        const wed = calculateTimeBeforeOpen(radios["WedOpenTime"],parseInt(req.params.time))
        const thu = calculateTimeBeforeOpen(radios["ThuOpenTime"],parseInt(req.params.time))
        const fri = calculateTimeBeforeOpen(radios["FriOpenTime"],parseInt(req.params.time))
        const sat = calculateTimeBeforeOpen(radios["SatOpenTime"],parseInt(req.params.time))
        const sun = calculateTimeBeforeOpen(radios["SunOpenTime"],parseInt(req.params.time))
        client.publish("tk/demo", `(crontab -l ; echo "${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc play") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc play") | crontab`);

    } catch (error) {
        res.status(400).json(error)
    }
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
    
    try {
        const radios = await Radio.findById(fid)
        const command = await Command.findById(fid)
        const mon = calculateTimeBeforeOpen(radios["MonOpenTime"],parseInt(req.params.time))
        const tue = calculateTimeBeforeOpen(radios["TueOpenTime"],parseInt(req.params.time))
        const wed = calculateTimeBeforeOpen(radios["WedOpenTime"],parseInt(req.params.time))
        const thu = calculateTimeBeforeOpen(radios["ThuOpenTime"],parseInt(req.params.time))
        const fri = calculateTimeBeforeOpen(radios["FriOpenTime"],parseInt(req.params.time))
        const sat = calculateTimeBeforeOpen(radios["SatOpenTime"],parseInt(req.params.time))
        const sun = calculateTimeBeforeOpen(radios["SunOpenTime"],parseInt(req.params.time))
        const sunCmd = {cmd: 'sunBoxStartTime',cron: `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc play`}
        const monCmd = {cmd: 'monBoxStartTime',cron: `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc play`}
        const tueCmd = {cmd: 'tueBoxStartTime',cron: `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc play`}
        const wedCmd = {cmd: 'wedBoxStartTime',cron: `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc play`}
        const thuCmd = {cmd: 'thuBoxStartTime',cron: `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc play`}
        const friCmd = {cmd: 'friBoxStartTime',cron: `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc play`}
        const satCmd = {cmd: 'satBoxStartTime',cron: `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc play`}
        const newCmd = command.command
        if(newCmd.filter((d) => d.cmd === sunCmd.cmd).length <= 0){
            newCmd.push(sunCmd)
            newCmd.push(monCmd)
            newCmd.push(tueCmd)
            newCmd.push(wedCmd)
            newCmd.push(thuCmd)
            newCmd.push(friCmd)
            newCmd.push(satCmd)
        }
        else{
            const oldSunCmd = newCmd.find(d => d.cmd === sunCmd.cmd).cron
            const oldMonCmd = newCmd.find(d => d.cmd === monCmd.cmd).cron
            const oldTueCmd = newCmd.find(d => d.cmd === tueCmd.cmd).cron
            const oldWedCmd = newCmd.find(d => d.cmd === wedCmd.cmd).cron
            const oldThuCmd = newCmd.find(d => d.cmd === thuCmd.cmd).cron
            const oldFriCmd = newCmd.find(d => d.cmd === friCmd.cmd).cron
            const oldSatCmd = newCmd.find(d => d.cmd === satCmd.cmd).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSunCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldMonCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldTueCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldWedCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldThuCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldFriCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSatCmd}' | crontab -`)
            newCmd.find(d => d.cmd === sunCmd.cmd).cron = `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === monCmd.cmd).cron = `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === tueCmd.cmd).cron = `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === wedCmd.cmd).cron = `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === thuCmd.cmd).cron = `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === friCmd.cmd).cron = `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc play`
            newCmd.find(d => d.cmd === satCmd.cmd).cron = `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc play`
        }
        
        const payload2 = {}
        payload2['command'] = newCmd
        const x = await Command.findByIdAndUpdate(fid, {$set: payload2})
    }catch(error){
        res.status(400).json(error)
    }
})

app.put('/boxCloseTime/:time', async (req, res) => {
    const fid = '1'
    const payload = {"musicAfterClose" : req.params.time}
    try {
        const radios = await Radio.findById(fid)
        const mon = calculateTimeAfterClose(radios["MonCloseTime"],parseInt(req.params.time))
        const tue = calculateTimeAfterClose(radios["TueCloseTime"],parseInt(req.params.time))
        const wed = calculateTimeAfterClose(radios["WedCloseTime"],parseInt(req.params.time))
        const thu = calculateTimeAfterClose(radios["ThuCloseTime"],parseInt(req.params.time))
        const fri = calculateTimeAfterClose(radios["FriCloseTime"],parseInt(req.params.time))
        const sat = calculateTimeAfterClose(radios["SatCloseTime"],parseInt(req.params.time))
        const sun = calculateTimeAfterClose(radios["SunCloseTime"],parseInt(req.params.time))
        client.publish("tk/demo", `(crontab -l ; echo "${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause") | crontab`);

    }   catch (error) {
        res.status(400).json(error)
    }
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }

    try {
        const radios = await Radio.findById(fid)
        const command = await Command.findById(fid)
        const mon = calculateTimeAfterClose(radios["MonCloseTime"],parseInt(req.params.time))
        const tue = calculateTimeAfterClose(radios["TueCloseTime"],parseInt(req.params.time))
        const wed = calculateTimeAfterClose(radios["WedCloseTime"],parseInt(req.params.time))
        const thu = calculateTimeAfterClose(radios["ThuCloseTime"],parseInt(req.params.time))
        const fri = calculateTimeAfterClose(radios["FriCloseTime"],parseInt(req.params.time))
        const sat = calculateTimeAfterClose(radios["SatCloseTime"],parseInt(req.params.time))
        const sun = calculateTimeAfterClose(radios["SunCloseTime"],parseInt(req.params.time))
        const sunCmd = {cmd: 'sunBoxCloseTime',cron: `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`}
        const monCmd = {cmd: 'monBoxCloseTime',cron: `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`}
        const tueCmd = {cmd: 'tueBoxCloseTime',cron: `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`}
        const wedCmd = {cmd: 'wedBoxCloseTime',cron: `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`}
        const thuCmd = {cmd: 'thuBoxCloseTime',cron: `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`}
        const friCmd = {cmd: 'friBoxCloseTime',cron: `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`}
        const satCmd = {cmd: 'satBoxCloseTime',cron: `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`}
        const newCmd = command.command
        if(newCmd.filter((d) => d.cmd === sunCmd.cmd).length <= 0){
            newCmd.push(sunCmd)
            newCmd.push(monCmd)
            newCmd.push(tueCmd)
            newCmd.push(wedCmd)
            newCmd.push(thuCmd)
            newCmd.push(friCmd)
            newCmd.push(satCmd)
        }
        else{
            const oldSunCmd = newCmd.find(d => d.cmd === sunCmd.cmd).cron
            const oldMonCmd = newCmd.find(d => d.cmd === monCmd.cmd).cron
            const oldTueCmd = newCmd.find(d => d.cmd === tueCmd.cmd).cron
            const oldWedCmd = newCmd.find(d => d.cmd === wedCmd.cmd).cron
            const oldThuCmd = newCmd.find(d => d.cmd === thuCmd.cmd).cron
            const oldFriCmd = newCmd.find(d => d.cmd === friCmd.cmd).cron
            const oldSatCmd = newCmd.find(d => d.cmd === satCmd.cmd).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSunCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldMonCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldTueCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldWedCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldThuCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldFriCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSatCmd}' | crontab -`)
            newCmd.find(d => d.cmd === sunCmd.cmd).cron = `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === monCmd.cmd).cron = `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === tueCmd.cmd).cron = `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === wedCmd.cmd).cron = `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === thuCmd.cmd).cron = `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === friCmd.cmd).cron = `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === satCmd.cmd).cron = `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`
        }
        const payload2 = {}
        payload2['command'] = newCmd
        const x = await Command.findByIdAndUpdate(fid, {$set: payload2})
    }catch(error){
        res.status(400).json(error)
    }
})

app.put('/silentBeforeOpen/:time', async (req, res) => {
    const fid = '1'
    const payload = {"silentBeforeOpen" : req.params.time}
    try {
        const radios = await Radio.findById(fid)
        const mon = calculateTimeBeforeOpen(radios["MonOpenTime"],parseInt(req.params.time))
        const tue = calculateTimeBeforeOpen(radios["TueOpenTime"],parseInt(req.params.time))
        const wed = calculateTimeBeforeOpen(radios["WedOpenTime"],parseInt(req.params.time))
        const thu = calculateTimeBeforeOpen(radios["ThuOpenTime"],parseInt(req.params.time))
        const fri = calculateTimeBeforeOpen(radios["FriOpenTime"],parseInt(req.params.time))
        const sat = calculateTimeBeforeOpen(radios["SatOpenTime"],parseInt(req.params.time))
        const sun = calculateTimeBeforeOpen(radios["SunOpenTime"],parseInt(req.params.time))
        client.publish("tk/demo", `(crontab -l ; echo "${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause") | crontab`);

    } catch (error) {
        res.status(400).json(error)
    }
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
    try {
        const radios = await Radio.findById(fid)
        const command = await Command.findById(fid)
        const mon = calculateTimeBeforeOpen(radios["MonOpenTime"],parseInt(req.params.time))
        const tue = calculateTimeBeforeOpen(radios["TueOpenTime"],parseInt(req.params.time))
        const wed = calculateTimeBeforeOpen(radios["WedOpenTime"],parseInt(req.params.time))
        const thu = calculateTimeBeforeOpen(radios["ThuOpenTime"],parseInt(req.params.time))
        const fri = calculateTimeBeforeOpen(radios["FriOpenTime"],parseInt(req.params.time))
        const sat = calculateTimeBeforeOpen(radios["SatOpenTime"],parseInt(req.params.time))
        const sun = calculateTimeBeforeOpen(radios["SunOpenTime"],parseInt(req.params.time))
        const sunCmd = {cmd: 'sunSilentBeforeOpen',cron: `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`}
        const monCmd = {cmd: 'monSilentBeforeOpen',cron: `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`}
        const tueCmd = {cmd: 'tueSilentBeforeOpen',cron: `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`}
        const wedCmd = {cmd: 'wedSilentBeforeOpen',cron: `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`}
        const thuCmd = {cmd: 'thuSilentBeforeOpen',cron: `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`}
        const friCmd = {cmd: 'friSilentBeforeOpen',cron: `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`}
        const satCmd = {cmd: 'satSilentBeforeOpen',cron: `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`}
        const newCmd = command.command
        if(newCmd.filter((d) => d.cmd === sunCmd.cmd).length <= 0){
            newCmd.push(sunCmd)
            newCmd.push(monCmd)
            newCmd.push(tueCmd)
            newCmd.push(wedCmd)
            newCmd.push(thuCmd)
            newCmd.push(friCmd)
            newCmd.push(satCmd)
        }
        else{
            const oldSunCmd = newCmd.find(d => d.cmd === sunCmd.cmd).cron
            const oldMonCmd = newCmd.find(d => d.cmd === monCmd.cmd).cron
            const oldTueCmd = newCmd.find(d => d.cmd === tueCmd.cmd).cron
            const oldWedCmd = newCmd.find(d => d.cmd === wedCmd.cmd).cron
            const oldThuCmd = newCmd.find(d => d.cmd === thuCmd.cmd).cron
            const oldFriCmd = newCmd.find(d => d.cmd === friCmd.cmd).cron
            const oldSatCmd = newCmd.find(d => d.cmd === satCmd.cmd).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSunCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldMonCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldTueCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldWedCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldThuCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldFriCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSatCmd}' | crontab -`)
            newCmd.find(d => d.cmd === sunCmd.cmd).cron = `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === monCmd.cmd).cron = `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === tueCmd.cmd).cron = `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === wedCmd.cmd).cron = `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === thuCmd.cmd).cron = `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === friCmd.cmd).cron = `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === satCmd.cmd).cron = `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`
        }
        const payload2 = {}
        payload2['command'] = newCmd
        const x = await Command.findByIdAndUpdate(fid, {$set: payload2})
        //res.json(x)
    }catch(error){
        res.status(400).json(error)
    }
})
//not sure
app.put('/silentAfterClose/:time', async (req, res) => {
    const fid = '1'
    const payload = {"silentAfterClose" : req.params.time}
    try {
        const radio = await Radio.findById(fid)
        const mon = calculateTimeAfterClose(radios["MonCloseTime"],parseInt(req.params.time))
        const tue = calculateTimeAfterClose(radios["TueCloseTime"],parseInt(req.params.time))
        const wed = calculateTimeAfterClose(radios["WedCloseTime"],parseInt(req.params.time))
        const thu = calculateTimeAfterClose(radios["ThuCloseTime"],parseInt(req.params.time))
        const fri = calculateTimeAfterClose(radios["FriCloseTime"],parseInt(req.params.time))
        const sat = calculateTimeAfterClose(radios["SatCloseTime"],parseInt(req.params.time))
        const sun = calculateTimeAfterClose(radios["SunCloseTime"],parseInt(req.params.time))
        client.publish("tk/demo", `(crontab -l ; echo "${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause") | crontab`);
        client.publish("tk/demo", `(crontab -l ; echo "${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause") | crontab`);
        
    }   catch (error) {
        res.status(400).json(error)
    }
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }catch (error) {
        res.status(400).json(error)
    }
    try {
        const radios = await Radio.findById(fid)
        const command = await Command.findById(fid)
        const mon = calculateTimeAfterClose(radios["MonCloseTime"],parseInt(req.params.time))
        const tue = calculateTimeAfterClose(radios["TueCloseTime"],parseInt(req.params.time))
        const wed = calculateTimeAfterClose(radios["WedCloseTime"],parseInt(req.params.time))
        const thu = calculateTimeAfterClose(radios["ThuCloseTime"],parseInt(req.params.time))
        const fri = calculateTimeAfterClose(radios["FriCLoseTime"],parseInt(req.params.time))
        const sat = calculateTimeAfterClose(radios["SatCloseTime"],parseInt(req.params.time))
        const sun = calculateTimeAfterClose(radios["SunCloseTime"],parseInt(req.params.time))
        const sunCmd = {cmd: 'sunSilentAfterClose',cron: `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`}
        const monCmd = {cmd: 'monSilentAfterClose',cron: `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`}
        const tueCmd = {cmd: 'tueSilentAfterClose',cron: `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`}
        const wedCmd = {cmd: 'wedSilentAfterClose',cron: `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`}
        const thuCmd = {cmd: 'thuSilentAfterClose',cron: `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`}
        const friCmd = {cmd: 'friSilentAfterClose',cron: `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`}
        const satCmd = {cmd: 'satSilentAfterClose',cron: `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`}
        const newCmd = command.command
        if(newCmd.filter((d) => d.cmd === sunCmd.cmd).length <= 0){
            newCmd.push(sunCmd)
            newCmd.push(monCmd)
            newCmd.push(tueCmd)
            newCmd.push(wedCmd)
            newCmd.push(thuCmd)
            newCmd.push(friCmd)
            newCmd.push(satCmd)
        }
        else{
            const oldSunCmd = newCmd.find(d => d.cmd === sunCmd.cmd).cron
            const oldMonCmd = newCmd.find(d => d.cmd === monCmd.cmd).cron
            const oldTueCmd = newCmd.find(d => d.cmd === tueCmd.cmd).cron
            const oldWedCmd = newCmd.find(d => d.cmd === wedCmd.cmd).cron
            const oldThuCmd = newCmd.find(d => d.cmd === thuCmd.cmd).cron
            const oldFriCmd = newCmd.find(d => d.cmd === friCmd.cmd).cron
            const oldSatCmd = newCmd.find(d => d.cmd === satCmd.cmd).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSunCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldMonCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldTueCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldWedCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldThuCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldFriCmd}' | crontab -`)
            client.publish("tk/demo", `crontab -l | grep -vF '${oldSatCmd}' | crontab -`)
            newCmd.find(d => d.cmd === sunCmd.cmd).cron = `${sun[1]} ${sun[0]} * * 0 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === monCmd.cmd).cron = `${mon[1]} ${mon[0]} * * 1 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === tueCmd.cmd).cron = `${tue[1]} ${tue[0]} * * 2 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === wedCmd.cmd).cron = `${wed[1]} ${wed[0]} * * 3 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === thuCmd.cmd).cron = `${thu[1]} ${thu[0]} * * 4 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === friCmd.cmd).cron = `${fri[1]} ${fri[0]} * * 5 /usr/bin/mpc pause`
            newCmd.find(d => d.cmd === satCmd.cmd).cron = `${sat[1]} ${sat[0]} * * 6 /usr/bin/mpc pause`
        }
        const payload2 = {}
        payload2['command'] = newCmd
        const x = await Command.findByIdAndUpdate(fid, {$set: payload2})
    }catch(error){
        res.status(400).json(error)
    }
})

app.put('/mainVolume/:vol', async (req, res) => {
    const fid = '1'
    const payload = {"mainVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/jingleVolume/:vol', async (req, res) => {
    const fid = '1'
    const payload = {"jingleVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/musicVolume/:vol', async (req, res) => {
    const fid = '1'
    const payload = {"musicVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/spotVolume/:vol', async (req, res) => {
    const fid = '1'
    const payload = {"spotVolume" : req.params.vol}
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
})

app.put('/storeIdentityVolume/:vol', async (req, res) => {
    const fid = '1'
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
    const fid = '1'
    const day = req.body.day
    const number = week.indexOf(day)
    const openHour = req.body.open.slice(0,2)
    const openMinute = req.body.open.slice(3,5)
    const closeHour = req.body.close.slice(0,2)
    const closeMinute = req.body.close.slice(3,5)
    const payload = {}
    payload[`${day}OpenTime`] = req.body.open
    payload[`${day}CloseTime`] = req.body.close
    try {
        const radio = await Radio.findByIdAndUpdate(fid, {$set: payload})
        res.json(radio)
    }   catch (error) {
        res.status(400).json(error)
    }
    const openCommand = {cmd: `${day}OpenTime:${openHour}:${openMinute}`,cron: `${openMinute} ${openHour} * * ${number} /usr/bin/mpc play`}
    const closeCommand = {cmd: `${day}CloseTime:${closeHour}:${closeMinute}`,cron: `${closeMinute} ${closeHour} * * ${number} /usr/bin/mpc pause`}
    
    try{
        const command = await Command.findById(fid)
        const newCmd = command.command
        if(newCmd.filter((d) => d.cmd.slice(0,11) === openCommand.cmd.slice(0,11)).length <=0 ){
            newCmd.push(openCommand)
        }
        else{
            const  oldCmd = newCmd.find(d => d.cmd.slice(0,11) === openCommand.cmd.slice(0,11)).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldCmd}' | crontab -`)
            newCmd.find(d => d.cmd.slice(0,11) === openCommand.cmd.slice(0,11)).cmd = `${day}OpenTime:${openHour}:${openMinute}`
            newCmd.find(d => d.cmd.slice(0,11) === openCommand.cmd.slice(0,11)).cron = `${openMinute} ${openHour} * * ${number} /usr/bin/mpc play`
        }
        if(newCmd.filter((d) => d.cmd.slice(0,12) === closeCommand.cmd.slice(0,12)).length <=0 ){
            newCmd.push(closeCommand)
        }
        else{
            const  oldCmd = newCmd.find(d => d.cmd.slice(0,11) === closeCommand.cmd.slice(0,11)).cron
            client.publish("tk/demo", `crontab -l | grep -vF '${oldCmd}' | crontab -`)
            newCmd.find(d => d.cmd.slice(0,12) === closeCommand.cmd.slice(0,12)).cmd = `${day}CloseTime:${closeHour}:${closeMinute}`
            newCmd.find(d => d.cmd.slice(0,12) === closeCommand.cmd.slice(0,12)).cron = `${closeMinute} ${closeHour} * * ${number} /usr/bin/mpc pause`
        }
        const payload2 = {}
        payload2['command'] = newCmd
        const x = await Command.findByIdAndUpdate(fid, {$set: payload2})
    }catch(error){
        res.status(400).json(error)
    }
    client.publish("tk/demo", `(crontab -l ; echo "${openMinute} ${openHour} * * ${number} /usr/bin/mpc play") | crontab`);
    client.publish("tk/demo", `(crontab -l ; echo "${closeMinute} ${closeHour} * * ${number} /usr/bin/mpc pause") | crontab`);
})

app.put('/addHoliday/:day', async (req, res) => {
    const fid = '1'
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
    const fid = '1'
    value = req.params.val
    try{
        const radios = await Radio.findByIdAndUpdate(fid, {$set: {'crossFade' : value}})
        res.json(radios)
        client.publish("tk/demo", `mpc crossfade ${value}`)
    }catch (error) {
        res.status(400).json(error)
    }
})

app.get('/stopPlaying', async (req, res) => {
    if(setTimeOut.length>0){
        //console.log(1234567890)
        for (let id in setTimeOut){
            console.log(setTimeOut[id]);
            clearTimeout(setTimeOut[id]);
            console.log(setTimeOut[id])
        }
        //console.log(setTimeOut)
        setTimeOut=[]
    }
})

app.get('/play', async (req, res) => {
    const fid = '1'
    if(true){
        state = 'play'
        try{
            const radios = await Radio.findById(fid)
            const playlist = radios.playlist
            let waitTime = 0
            var i
            for(i=0; i<playlist.length; i++){
                const nextFile = playlist[i]
                console.log(nextFile)
                const file = await File.findById(nextFile)
                const pid = file.pid
                const fileType = file.fileType
                let vol = radios.mainVolume
                if(fileType === 'jingle'){
                    vol = radios.mainVolume + radios.jingleVolume
                }
                else if(fileType === 'music'){
                    vol = radios.mainVolume + radios.musicVolume
                }
                else if(fileType === 'spot'){
                    vol = radios.mainVolume + radios.spotVolume
                }
                else if(fileType === 'storeIdentity'){
                    vol = radios.mainVolume + radios.storeIdentityVolume
                }
                console.log(vol)
                //const length = file.fileLength
                //const waitTime = calculateWaitTime(length)
                console.log(waitTime)
                //client.publish("tk/demo", `mpc volume ${vol}`)
                //client.publish("tk/demo", `mpc play ${pid}`)
                timeOut = callCommand(pid, vol, waitTime)
                const length = file.fileLength
                waitTime = waitTime + calculateWaitTime(length)
                //await sleep(10000)
                //clearTimeout(x)
            }
            //state = 'idle'
        }catch (error) {
            res.status(400).json(error)
        }
    }
}),

app.put('/selectSpeechSoundBeforeOpen/:sound', async (req,res) => {
    const fid = '1'
    const sound = req.params.sound

}),

app.put('/selectSpeechSoundAfterClose/:sound', async (req,res) => {
    const fid = '1'
    const sound = req.params.sound

}),

app.put('/editUploadLogFileSIze/:fileSize', async (req,res) => {
    const fid = '1'
    const fileSize = req.params.fileSize
}),

app.put('/resetVolumeTime/:number', async (req,res) => {
    const fid = '1'
    const number = req.params.number
})

app.put('/interrupt/:interruptFile', async (req,res) => {
    const fid = '1'
    const interruptFile = req.params.interruptFile
    client.publish("tk/demo",`interrupt ${interruptFile}`)
})

app.use((req, res, next) => {
    const err = new Error("ERROR PATH");
    err.status = 404;
    next(err);
});
