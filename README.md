# Kage


<h1 align="center">
  <img width="460" height="300" src="https://github.com/WayzDev/Kage/blob/master/static/kage-logo.svg">
</h1>

   
Kage (ka-geh) is a tool inspired by [AhMyth](https://github.com/AhMyth/AhMyth-Android-RAT) designed for Metasploit RPC Server to interact with meterpreter sessions and generate payloads.<br>
For now it only supports `windows/meterpreter` & `android/meterpreter`.

## Getting Started
Please follow these instructions to get a copy of Kage running on your local machine without any problems.
### Prerequisites
* [Metasploit-framework](https://github.com/rapid7/metasploit-framework) must be installed and in your `PATH`:
    * Msfrpcd
    * Msfvenom
    * Msfdb


### Installing
You can install Kage binaries from [here](https://github.com/WayzDev/Kage/releases).
#### for developers
to run the app from source code:
```bash
# Download source code
git clone https://github.com/WayzDev/Kage.git

# Install dependencies and run kage
cd Kage
yarn # or npm install
yarn run dev # or npm run dev

# to build project
yarn run build
```
> [electron-vue](https://simulatedgreg.gitbooks.io/electron-vue/content/en/getting_started.html) officially recommends the [yarn](https://yarnpkg.com/en/) package manager as it handles dependencies much better and can help reduce final build size with `yarn clean`. 


##### For Generating APK Payload select `Raw` format in dropdown list. 

## Screenshots
<h1>
  <img src="https://github.com/WayzDev/Kage/blob/master/screenshots/dashboard.png"/>
</h1>
<h1>
  <img src="https://github.com/WayzDev/Kage/blob/master/screenshots/sessions.png"/>
</h1>
<h1>
  <img src="https://github.com/WayzDev/Kage/blob/master/screenshots/control-panel1.png"/>
</h1>
<h1>
  <img src="https://github.com/WayzDev/Kage/blob/master/screenshots/file-manager.png"/>
</h1>

## Video Tutorial

<a href="https://vimeo.com/319338721" target="_blank"><img src="https://github.com/WayzDev/Kage/blob/master/screenshots/server.png" />
</a>


## Disclaimer 
I will not be responsible for any direct or indirect damage caused due to the usage of this tool, it is for educational purposes only.

Twitter: [@iFalah](https://twitter.com/ifalah_)

Email: ifalah@protonmail.com

## Credits
Metasploit Framework - (c) Rapid7 Inc. 2012 (BSD License)<br>
http://www.metasploit.com/

node-msfrpc - (c) Tomas Gonzalez Vivo. 2017 (Apache License)<br>
https://github.com/tomasgvivo/node-msfrpc

electron-vue - (c) Greg Holguin. 2016 (MIT)<br>
https://github.com/SimulatedGREG/electron-vue

---
This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
