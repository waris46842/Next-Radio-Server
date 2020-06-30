const mongoose = require('mongoose')
const Schema = mongoose.Schema

const radioSchema = new Schema({
    _id: Number,
    group: String,
    status: String,
    MonOpenTime: String,
    MonCloseTime: String,
    TueOpenTime: String,
    TueCloseTime: String,
    WedOpenTime: String,
    WedCloseTime: String,
    ThuOpenTime: String,
    ThuCloseTime: String,
    FriOpenTime: String,
    FriCloseTime: String,
    SatOpenTime: String,
    SatCloseTime: String,
    SunOpenTime: String,
    SunCloseTime: String,
    MonSyncTime: Array,
    TueSyncTime: Array,
    WedSyncTime: Array,
    ThuSyncTime: Array,
    FriSyncTime: Array,
    SatSyncTime: Array,
    SunSyncTime: Array,
    mainVolume: Number,
    jingleVolume: Number,
    musicVolume: Number,
    spotVolume: Number,
    storeIdentityVolume: Number,
    musicBeforeOpen: Number,
    musicAfterClose: Number,
    silentBeforeOpen: Number,
    silentAfterClose: Number,
    timeSpeechBeforeOpen: Number,
    timeSpeechAfterClose: Number,
    holiday: Array,
    playlist: Array,
    playlist1: Array,
    playlist2: Array,
    playlist3: Array,
    playlist4: Array,
    playlist5: Array,
    defaultPlaylist: Array,
    crossFade: Number,
    heartbeatTime: Number,
    timeAutoSync: Number,
    dateAutoSync: Number,
    activeLastTime: Number
    
}, { timestamps: true, versionKey: false })

const radioModel = mongoose.model('radio', radioSchema,'radios')

module.exports = radioModel
