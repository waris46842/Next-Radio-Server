<template>
  <div id="app">
    <input v-model="message" placeholder="Type Command Here">
    <button @click="doCommand()">Submit</button>
    <p>Latest Command is: {{ this.cmd }}</p>
    <input v-model="boxStartTime" placeholder="boxStartTime">
    <button @click="changeBoxStartTime()">Submit</button>
    <p>changeBoxStartTime</p>
    <input v-model="boxCloseTime" placeholder="boxCloseTime">
    <button @click="changeBoxCloseTime()">Submit</button>
    <p>changeBoxCloseTime</p>
    <input v-model="silentBeforeOpen" placeholder="silentBeforeOpen">
    <button @click="changeSilentBeforeOpen()">Submit</button>
    <p>changeSilentBeforeOpen</p>
    <input v-model="silentAfterClose" placeholder="silentAfterClose">
    <button @click="changeSilentAfterClose()">Submit</button>
    <p>changeSilentAfterClose</p>

    <input v-model="speechBeforeOpen" placeholder="speechBeforeOpen">
    <button @click="changeSpeechTimeBeforeOpen()">Submit</button>
    <p>changeSpeechTimeBeforeOpen</p>
    <input v-model="speechAfterClose" placeholder="speechAfterClose">
    <button @click="changeSpeechTimeAfterClose()">Submit</button>
    <p>changeSpeechTimeAfterClose</p>




    <input v-model="mainVolume" placeholder="mainVolume">
    <button @click="setMainVolume()">Submit</button>
    <p>setMainVolume</p>
    <input v-model="jingleVolume" placeholder="jingleVolume">
    <button @click="setJingleVolume()">Submit</button>
    <p>setJingleVolume</p>
    <input v-model="musicVolume" placeholder="musicVolume">
    <button @click="setMusicVolume()">Submit</button>
    <p>setMusicVolume</p>
    <input v-model="spotVolume" placeholder="spotVolume">
    <button @click="setSpotVolume()">Submit</button>
    <p>setSpotVolume</p>
    <input v-model="storeIdentityVolume" placeholder="storeIdentityVolume">
    <button @click="setStoreIdentityVolume()">Submit</button>
    <p>setStoreIdentityVolume</p>
    <input v-model="day" placeholder="day">
    <input v-model="openTime" placeholder="openTime">
    <input v-model="closeTime" placeholder="closeTime">
    <button @click="setOpenCloseHour()">Submit</button>
    <p>setOpenCloseTime</p>
    <input v-model="holiday" placeholder="addHoliday">
    <button @click="addHoliday()">Submit</button>
    <p>addHoliday</p>
    <input v-model="crossFade" placeholder="crossFade">
    <button @click="editCrossFade()">Submit</button>
    <p>editCrossFade</p>

    <!-- <input v-model="speechSoundBeforeOpen" placeholder="speechSoundBeforeOpen">
    <button @click="selectSpeechSoundBeforeOpen()">Submit</button>
    <p>selectSpeechSoundBeforeOpen</p>

    <input v-model="speechSoundAfterClose" placeholder="speechSoundAfterClose">
    <button @click="selectSpeechSoundAfterClose()">Submit</button>
    <p>selectSpeechSoundAfterClose</p> -->

    <!-- <input v-model="resetVolumeTime" placeholder="resetVolumeTime">
    <button @click="resetVolumeTime()">Submit</button>
    <p>resetVolumeTime</p> -->

    <!-- <input v-model="uploadLogFileSize" placeHolder="uploadLogFileSize">
    <button @click="editUploadLogFileSize()">Submit</button>
    <p>editUploadLogFileSize</p> -->

    <input v-model="interrupt" placeHolder="interrupt">
    <input v-model="timeToInterrupt" placeholder="timeToInterrupt">
    <button @click="interruptFile()">Submit</button>
    <p>interruptFile</p>

    <input v-model="heartbeatTime" placeholder="heartbeatTime">
    <button @click="setHeartbeatTime()">Submit</button>
    <p>setHeartbeatTime</p>

    <input v-model="timeForLog" placeholder="timeForLog">
    <button @click="setTimeForLog()">Submit</button>
    <p>setTimeForLog</p>

    <input v-model="dateAutoSync" placeholder="dateAutoSync">
    <input v-model="timeAutoSync" placeholder="timeAutoSync">
    <button @click="setAutoSync()">Submit</button>
    <p>setAutoSync</p>


  </div>
</template>

<script>
import axios from "axios"
export default {
  name: 'App',
  data(){
    return {
      message: "",
      cmd:""
    }
  },
  methods: {
    async doCommand() {
      console.log(this.message);
      this.cmd = this.message;
      const res = await axios.get('http://localhost:5000/command/'+this.cmd)
      console.log(res)
    },
    async changeBoxStartTime() {
      console.log(this.boxStartTime);
      let time = this.boxStartTime;
      const res = await axios.put('http://localhost:5000/boxStartTime/' + time)
      console.log(res)
    },
    async changeBoxCloseTime() {
      console.log(this.boxCloseTime);
      let time = this.boxCloseTime;
      const res = await axios.put('http://localhost:5000/boxCloseTime/' + time)
      console.log(res)
    },
    async changeSilentBeforeOpen() {
      console.log(this.silentBeforeOpen);
      let time = this.silentBeforeOpen;
      const res = await axios.put('http://localhost:5000/silentBeforeOpen/' + time)
      console.log(res)
    },
    async changeSilentAfterClose() {
      console.log(this.silentAfterClose);
      let time = this.silentAfterClose;
      const res = await axios.put('http://localhost:5000/silentAfterClose/' + time)
      console.log(res)
    },
    async setMainVolume() {
      console.log(this.mainVolume);
      let vol = this.mainVolume;
      const res = await axios.put('http://localhost:5000/mainVolume/' + vol)
      console.log(res)
    },
    async setJingleVolume() {
      console.log(this.jingleVolume);
      let vol = this.jingleVolume;
      const res = await axios.put('http://localhost:5000/jingleVolume/' + vol)
      console.log(res)
    },
    async setMusicVolume() {
      console.log(this.musicVolume);
      let vol = this.musicVolume;
      const res = await axios.put('http://localhost:5000/musicVolume/' + vol)
      console.log(res)
    },
    async setSpotVolume() {
      console.log(this.spotVolume);
      let vol = this.spotVolume;
      const res = await axios.put('http://localhost:5000/spotVolume/' + vol)
      console.log(res)
    },
    async setStoreIdentityVolume() {
      console.log(this.storeIdentityVolume);
      let vol = this.storeIdentityVolume;
      const res = await axios.put('http://localhost:5000/storeIdentityVolume/' + vol)
      console.log(res)
    },
    async setOpenCloseHour() {
      if(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(this.day)){
        let payload = {'open':this.openTime,'close':this.closeTime, 'day':this.day}
        const res = await axios.put('http://localhost:5000/openCloseTime/',payload)
        console.log(res)
      }
      else{
        console.log('Not a day')
      }
    },
    async addHoliday() {
      console.log(this.holiday);
      let day = this.holiday;
      const res = await axios.put('http://localhost:5000/addHoliday/' + day)
      console.log(res)
    },
    async editCrossFade() {
      console.log(this.crossFade);
      let val = this.crossFade;
      const res = await axios.put('http://localhost:5000/editCrossFade' + val)
      console.log(res)
    },
    // async selectSpeechSoundBeforeOpen() {
    //   console.log(this.speechSoundBeforeOpen);
    //   let sound = this.speechSoundBeforeOpen;
    //   const res = await axios.put('http://localhost:5000/selectSpeechSoundBeforeOpen/' + sound)
    //   console.log(res)
    // },
    // async selectSpeechSoundAfterClose() {
    //   console.log(this.speechSoundAfterClose);
    //   let sound = this.speechSoundAfterClose;
    //   const res = await axios.put('http://localhost:5000/selectSpeechSoundAfterClose' + sound)
    //   console.log(res)
    // },

    async changeSpeechTimeBeforeOpen() {
      console.log(this.speechBeforeOpen);
      let sound = this.speechBeforeOpen;
      const res = await axios.put('http://localhost:5000/setSpeechTimeBeforeOpen/' + sound)
      console.log(res)
    },

    async changeSpeechTimeAfterClose() {
      console.log(this.speechAfterClose);
      let sound = this.speechAfterClose;
      const res = await axios.put('http://localhost:5000/setSpeechTimeAfterClose/' + sound)
      console.log(res)
    },

    

    // async editUploadLogFileSize() {
    //   console.log(this.uploadLogFileLogSize);
    //   let fileSize = this.uploadLogFileLogSize;
    //   const res = await axios.put('http://localhost:5000/editUploadLogFileSIze' + fileSize)
    //   console.log(res)
    // },

    // async resetVolumeTime() {
    //   console.log(this.resetVolumeTime);
    //   let number = this.resetVolumeTime;
    //   const res = await axios.put('http://localhost:5000/resetVolumeTime' + number)
    //   console.log(res)
    // },

    async interruptFile() {
      console.log(this.interrupt)
      let payload = {'file':this.interrupt,'time':this.timeToInterrupt}
      const res = await axios.put('http://localhost:5000/interrupt/',payload)
      console.log(res)
    },

    async setHeartbeatTime() {
      console.log(this.heartbeatTime)
      let time = this.heartbeatTime
      const res = await axios.put('http://localhost:5000/setHeartbeatTime' + time)
      console.log(res)
    },

    async setTimeForLog() {
      console.log(this.timeForLog)
      let time = this.timeForLog
      let arrayOfTime = time.split(',')
      let payload = {'timeForLog':arrayOfTime}
      const res = await axios.put('http://localhost:5000/setTimeForLog',payload)
      console.log(res)
    },

    async setAutoSync() {
      console.log(this.dateAutoSync)
      console.log(this.timeAutoSync)
      const date = this.dateAutoSync
      const time = this.timeAutoSync
      let payload = {'dateAutoSync':date,'timeAutoSync':time}
      const res = await axios.put('http://localhost:5000/setAutoSync/',payload)
      console.log(res)
    }

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>