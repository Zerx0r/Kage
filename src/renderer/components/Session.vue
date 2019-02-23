<template>
  <div class="Session">
    <div id="sessionTable" v-if="this.$route.name !== 'Workspace'">
      <el-row>
        <el-col :lg="24" :md="24" :sm="24" :xs="24">
      <el-table
              :data="tableData.filter(data => !search || data.platform.toLowerCase().includes(search.toLowerCase()) || data.sessionPort.toString().includes(search) || data.sessionHost.toString().includes(search) || data.username.toString().includes(search))"
              fit
              v-loading="loadingSessionTable"
              element-loading-text="Fetching sessions..."
              element-loading-background="rgba(45, 58, 75, 0.8)"
              :cell-style="tableCellStyle"
              :header-cell-style="tableHeaderColor">
        <el-table-column
                type="index"
                :index="indexMethod"
                width="60">
        </el-table-column>
        <el-table-column
                prop="platform"
                label="Platform"
                >
        </el-table-column>
        <el-table-column
                prop="arch"
                label="Architecture"
                >
        </el-table-column>
        <el-table-column
                prop="computerName"
                label="Computer Name"
                >
        </el-table-column>
        <el-table-column
                prop="sessionHost"
                label="Host"
                >
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.sessionHost }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="sessionPort"
                label="Port"
                >
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag type="warning" size="medium">{{ scope.row.sessionPort }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                prop="payload"
                label="Payload"
                >
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-tag type="danger" size="medium">{{ scope.row.payload }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
                align="right"
                min-width="200">
          <template slot="header" slot-scope="scope">
            <el-input
                    v-model="search"
                    class="inline-input"
                    size="mini"
                    placeholder="Search"
                    style="width: 90%; padding-top:10px; "/>
          </template>
          <template slot-scope="scope">
            <el-button
                    type="primary"
                    size="mini"
                    @click="interactWithSession(scope.$index, scope.row)"><font-awesome-icon icon="bolt" size="xs" style="padding-right: 5px;"/> Interact</el-button>
            <el-button
                    size="mini"
                    type="danger"
                    @click="removeSession(scope.$index, scope.row)"><font-awesome-icon icon="times" size="xs" style="padding-right: 5px;"/> Remove</el-button>
          </template>
        </el-table-column>
        <el-table-column align="right" width="50">
          <template slot="header" slot-scope="scope">
            <el-tooltip content="Refresh" placement="top" slot="reference">
              <el-button
                      type="primary"
                      size="mini"
                      icon="el-icon-refresh"
                      circle
                      @click="loadSessions()">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
        </el-col>
      </el-row>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import MsfRpc from '@/msfrpc'
  export default {
    name: 'session-view',
    component: {

    },
    data () {
      return {
        loadingSessionTable: false,
        tableData: [],
        search: ''
      }
    },
    methods: {
      indexMethod (index) {
        return index * 1
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
      interactWithSession (index, row) {
        this.$router.push({
          path: '/sessions/workspace/' + row.sessionId + '/' + row.platform
        })
      },
      removeSession (index, row) {
        this.msfrpc._exec('session.stop', row.sessionId).then((res) => {
          console.log(res)
          if (res.result === 'success') {
            this.tableData.splice(index, 1)
          }
        })
      },
      loadSessions () {
        this.tableData = []
        this.loadingSessionTable = true
        setTimeout(() => {
          this.msfrpc._exec('session.list').then((res) => {
            let session
            for (session in res) {
              if (res.hasOwnProperty(session)) {
                this.tableData.push({
                  'platform': res[session].platform,
                  'arch': res[session].arch,
                  'computerName': res[session].info,
                  'sessionHost': res[session].session_host,
                  'sessionPort': res[session].session_port,
                  'payload': res[session].type,
                  'sessionId': session
                })
              }
            }
            this.loadingSessionTable = false
          })
        }, 500)
      }
    },
    mounted () {
      this.msfrpc = new MsfRpc(this.$store.getters.getInfo)
      this.loadSessions()
    }
  }
</script>

<style>
  #sessionTable .el-table {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    background-color: transparent !important;
    overflow: hidden;
    margin: 30px 0;
  }
  #sessionTable .el-table th {
    padding: 1px 0 !important;
  }
  #sessionTable .el-table::before {
    content: none;
  }
  #sessionTable .el-table::after {
    content: none;
  }
  #sessionTable input{
    background-color:#2d3a4b;
    border: 1px solid hsla(0,0%,100%,.1);
    color:#fff;
  }
</style>