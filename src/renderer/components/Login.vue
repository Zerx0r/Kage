<template>
      <div class="outter">
        <div class="inner">
          <div id="login-logo" style="text-align: center; margin-top: 20px; margin-bottom: 10px; margin-left: -10px;">
            <img src="./../assets/logo.png" style="width: 100px;" alt="">
          </div>
          <h2 class="title">Connect to <span>metasploit RPC</span></h2>
          <el-form :model="LoginForm" :rules="rules" ref="LoginForm" :disabled="disableForm">
            <el-form-item>
                  <el-tooltip class="item" effect="dark" content="Start server" placement="top" :enterable="false">
                    <el-button type="primary" circle size="mini" @click="startServer">
                      <font-awesome-icon icon="power-off"/>
                    </el-button>
                  </el-tooltip>
            </el-form-item>
            <el-form-item prop="username">
              <el-input v-model="LoginForm.username" placeholder="Username">
                <font-awesome-icon slot="prefix" icon="user" class="el-input__icon"/>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input :type="passwordField" v-model="LoginForm.password" placeholder="Password">
                <font-awesome-icon slot="prefix" icon="lock" class="el-input__icon"/>
                <i slot="suffix" class="el-input__icon el-icon-view" @click="showPass()" style="cursor: pointer;"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="host">
              <el-input  v-model="LoginForm.host" placeholder="127.0.0.1:55553">
                <font-awesome-icon slot="prefix" icon="link" class="el-input__icon"/>
              </el-input>
            </el-form-item>
            <el-form-item prop="isHttps">
              <el-switch v-model="LoginForm.isHttps" active-text="Over https" inactive-color="#283443" active-color="#13ce66">
              </el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width:100%;" :loading="loadingStatus" @click="onSubmit('LoginForm')">Connect</el-button>
            </el-form-item>
              <small style="color:#f3f3f3;">Remember to terminate msfrpcd before starting server <code style="background-color: #232e3b;  user-select: auto;">&gt; sudo kill -9 $(sudo lsof -t -i:55552)</code></small>

          </el-form>
        </div>
        <el-dialog
                custom-class="dialog-for-commands"
                title="starting server"
                :visible.sync="showDialog"
                width="70%">
          <el-steps :active="activeStep" :finish-status="processStatus" align-center>
            <el-step title="Database"></el-step>
            <el-step title="Server"></el-step>
            <el-step title="Done"></el-step>
          </el-steps>
       <pre style="user-select:text;">
         <code>
{{dialogText}}
         </code>
       </pre>
          <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="showDialog = false">Cancel</el-button>
       </span>
        </el-dialog>
      </div>
</template>
<script>
import MsfRpc from '@/msfrpc'
import fs from 'fs'
import { exec } from 'child_process'
import Promise from 'bluebird'
const msfrpc = new MsfRpc()
export default {
  name: 'Login',
  data () {
    // custom validation
    let checkURL = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('Metasploit host'))
      }
      let port = (value).split(':')[1]
      if (!port) {
        return callback(new Error('Please provide the port number along with ip:[port]'))
      } else {
        callback()
      }
    }
    return {
      disableForm: false,
      passwordField: 'password',
      loadingStatus: false,
      LoginForm: {
        username: '',
        password: '',
        host: '127.0.0.1:55552',
        isHttps: true
      },
      rules: {
        username: [
          {required: true, message: 'Metasploit username', trigger: 'blur'}
        ],
        password: [
          {required: true, message: 'Metasploit password', trigger: 'blur'}
        ],
        host: [
          {validator: checkURL, trigger: 'blur'}
        ]
      },
      dialogText: '',
      showDialog: false,
      activeStep: 0,
      processStatus: 'success'
    }
  },
  methods: {
    onSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        this.$message.closeAll()
        if (valid) {
          this.$refs[formName].clearValidate()
          this.loadingStatus = true
          msfrpc._login(this.LoginForm).then((res) => {
            setTimeout(() => {
              // some network error
              if (res.result === 'unsuccessful') {
                this.loadingStatus = false
                this.$message({
                  showClose: true,
                  message: 'Network error, please check if msfrpcd is running and on which protocol, if all fine then double check port host:[port]',
                  type: 'error',
                  duration: 0
                })
              } else {
                // success
                if (res.result === 'success') {
                  msfrpc._saveToken(res.token)
                  const [_ip, _port] = (this.LoginForm.host).split(':')
                  // storing host information > refer to vuex
                  this.$store.dispatch('settings', {
                    token: res.token,
                    ip: _ip,
                    port: _port,
                    ssl: this.LoginForm.isHttps
                  })
                  this.$router.push({
                    path: '/dashboard'
                  })
                  // creating folder at home
                  let pathTo = this.$electron.remote.app.getPath('home')
                  fs.mkdir(pathTo + `/kage`, { recursive: true }, (err) => {
                    if (err) {
                      console.log('folder already exists')
                    }
                  })
                } else {
                  // 401 wrong username or password
                  if (res.error_code === 401) {
                    this.$message({
                      showClose: true,
                      message: 'Login failed, wrong credentials',
                      type: 'error',
                      duration: 0
                    })
                  }
                }
                this.loadingStatus = false
              }
            }, 1500)
          })
        } else {
          this.$message({
            showClose: true,
            message: 'Oops, check your input please.',
            type: 'error',
            duration: 2000
          })
          return false
        }
      })
    },
    async startServer () {
      this.activeStep = 0
      this.disableForm = true
      this.showDialog = true
      this.dialogText = ''
      let response
      // used --component database to start only msfdb without web services
      // change it if needed to 'msfdb start'
      response = await this.executeServerCommands('msfdb start --component database')
      if (response === 0) {
        this.activeStep++
      } else {
        this.processStatus = 'error'
        this.activeStep++
        this.disableForm = false
        return false
      }
      let username = 'msf'
      let password = Math.random().toString(36).substr(2, 7)
      response = await this.executeServerCommands(`msfrpcd -U ${username} -P ${password} -p 55552`)
      if (response === 0) {
        this.activeStep++
      } else {
        this.processStatus = 'error'
        this.activeStep++
        this.disableForm = false
        return false
      }
      this.activeStep++
      this.dialogText += `Username: ${username}\n`
      this.dialogText += `Password: ${password}\n`
      this.dialogText += 'You can login now!\n'
      this.LoginForm.username = username
      this.LoginForm.password = password
      this.disableForm = false
    },
    executeServerCommands (cmd) {
      const child = exec(`${cmd}`)
      const self = this
      child.stdout.on('data', function (data) {
        self.dialogText = data.toString()
        console.log(data)
      })
      child.stderr.on('data', function (data) {
        self.dialogText += data.toString()
        console.log(data)
      })
      child.on('close', function (code) {
        console.log('closing code: ' + code)
      })
      return this.promiseFromChildProcess(child)
    },
    promiseFromChildProcess (child) {
      return new Promise(function (resolve, reject) {
        child.addListener('error', reject)
        child.addListener('exit', resolve)
      })
    },
    showPass () {
      // to show password field
      this.passwordField = this.passwordField === 'password' ? 'text' : 'password'
    }
  }
}
</script>
<style>
   .outter{
      display: grid;
      background-color:#2d3a4b;
      height: 100%;
   }
   .inner {
       margin: auto;
       width: 400px;
   }
   .inner .is-active > span {
     color: #13ce66;
   }
   .inner span {
     color:#fff;
   }
   .inner input{
      background-color:#283443 !important;
      border: 1px solid hsla(0,0%,100%,.1) !important;
      color:#fff;
   }
   .inner .el-input__icon {
     margin-left: 5px;
   }
   .inner .title {
     text-align: center;
     color:#fff;
   }
   .inner .title span {
     color: #e95f26;
   }
   .el-dropdown-menu__item {
     color: #fff !important;
   }
   .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
     background-color: #66b1ff !important;
     color: #fff !important;
   }
   .el-dropdown-menu.el-popper[x-placement^=bottom] .popper__arrow::after {
     border-bottom-color: #283443 !important;
   }
   .el-dropdown-menu.el-popper[x-placement^=bottom] .popper__arrow {
     border-bottom-color: hsla(0,0%,100%,.1) !important;
   }
  .inner .el-input.is-disabled .el-input__inner {
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .inner .el-input.is-disabled span {
    color: #c0c4cc;
  }
</style>
<style scoped>
  .el-dialog__wrapper >>> .dialog-for-commands {
    background-color:#37465b !important; color:rgba(255, 255, 255, 0.7);
  }
  .el-dialog__wrapper >>> .el-dialog__header span {
    color:rgba(255, 255, 255, 0.7);
  }
  .el-dialog__wrapper >>> .el-dialog__body pre{
    border:1px solid hsla(0,0%,100%,.1);
    background-color: rgba(34, 34, 34, 0.7);
    padding:0 10px;
    color: #fff;
    overflow-x: auto;
  }
  .el-step.is-horizontal >>> .el-step__head.is-process {
    color: #fff !important;
    border-color: hsla(0,0%,100%,.5) !important;
  }
  .el-step.is-horizontal >>> .el-step__icon {
    background: #37465b !important;
  }
  .el-step.is-horizontal >>> .el-step__line {
    background-color: hsla(0,0%,100%,.1);
  }
  .el-step.is-horizontal >>> .el-step__head.is-wait {
    border-color: hsla(0,0%,100%,.1)
  }
  .el-step.is-horizontal >>> .el-step__title.is-process {
    color: #fff !important;
  }
</style>
