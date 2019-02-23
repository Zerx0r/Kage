/*
 * This is a modification of node-msfrpc by tomasgvivo.
 */
import MsgPack5 from 'msgpack5'
import axios from 'axios'
import Promise from 'bluebird'
import * as Cmd from './../constants/commands/cmd'

const msgpack = MsgPack5()
export default class MsfRpc {
  /**
   *
   * @param settings
   */
  constructor (settings) {
    // Get all settings needed
    settings = settings || {}
    this.token = settings.token
    this.ip = settings.ip
    this.port = settings.port
    this.ssl = settings.ssl
  }

  /**
   * @method login
   * @param {object} credentials
   * @return Promise
   */
  _login (credentials) {
    credentials = credentials || {}
    const [ip, port] = (credentials.host).split(':')
    this.user = credentials.username
    this.pass = credentials.password
    this.ip = ip
    this.port = port
    this.ssl = credentials.isHttps
    return this._send('auth.login', this.user, this.pass)
  }
  /**
   * @method _send
   * @param {string} apiMethod
   * @param {...[any]} args
   * @private
   */
  _send (apiMethod, ...args) {
    // Encode parameters to msgpack, it is required because metasploit rpc understand this format
    const buffer = msgpack.encode([apiMethod, ...args])
    return new Promise((resolve) => {
      axios({
        method: 'post',
        url: `${this.ssl ? 'https' : 'http'}://${this.ip}:${this.port}/api/1.0`,
        data: buffer,
        responseType: 'arraybuffer',
        headers: {'Content-Type': 'binary/message-pack'},
        timeout: 5000
      }).then((response) => {
        // return the decoded msgpack payload
        const res = this._parseBuffer(response.data)
        resolve(res)
      }).catch((error) => {
        if (error.response) {
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        } else if (error.request) {
          console.log(error.request)
          let status = {
            result: 'unsuccessful'
          }
          resolve(status)
        } else {
          console.log(`${this.ssl ? 'https' : 'http'}://${this.ip}:${this.port}/api/1.0`, this.name)
          console.log('Error', error.message)
        }
      })
    })
  }

  /**
   *
   * @param method
   * @param args
   * @private
   */
  _exec (method, ...args) {
    return this._send(method, this.token, ...args)
  }

  /**
   *
   * @param token
   * @private
   */
  _saveToken (token) {
    /*
     * We will always store the token returned from metasploit to make it permanent until we logout
     */
    return this._send('auth.token_add', token, token)
  }

  /**
   *
   * @param args
   * @private
   */
  _startUpCommand (...args) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._send('session.meterpreter_read', this.token, arguments[0]).then((res) => {
          resolve(res)
        })
      //  At beginning when retrieving data it is better to delay 1 sec before requesting meterpreter_read to retrieve complete data
      //  timeout 1s
      }, 1000)
    })
  }
  // When accessing session workspace for the first time
  async _startUp (...args) {
    let wrote = await this._writeCommand(...args)
    let read
    read = ''
    const check = Cmd.WHITELISTED.some((x) => (arguments[1].indexOf(x) > -1))
    if (check) {
      read = await this._startUpCommand(arguments[0])
    } else if (wrote.result === 'success') {
      while (read.length === 0) {
        read = await this._startUpCommand(arguments[0])
        if (this._commandsError(read.data)) {
          return read.data
        } else {
          read = this._formater(read.data, arguments[1])
        }
      }
    }
    return read
  }
  // writing commands here
  async _writeCommand (...args) {
    let response = await this._send('session.meterpreter_run_single', this.token, ...args)
    return response
  }
  // reading commands from here
  _readCommand (...args) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._send('session.meterpreter_read', this.token, arguments[0]).then((res) => {
          resolve(res)
        })
      //  timeout 200ms
      }, 200)
    })
  }
  // Used for commands, more faster than startup
  async executeCommand (...args) {
    let wrote = await this._writeCommand(...args)
    let read
    read = ''
    const check = Cmd.WHITELISTED.some((x) => (arguments[1].indexOf(x) > -1))
    if (check) {
      // refer to comments in constants/commands/cmd.js
      read = await this._readCommand(arguments[0])
      return read
    } else {
      if (wrote.result === 'success') {
        // We keep looping till we get all data
        while (read.length === 0) {
          read = await this._readCommand(arguments[0])
          if (read.data.length === 1) {
            // this statement to handle data length return only \n linebreak
            read.data = ''
          }
          // If any error shows please stop looping and retrieve data
          if (this._commandsError(read.data)) {
            return read.data
          } else {
            read = this._formater(read.data, arguments[1])
          }
        }
      }
    }
    return read
  }
  // Checking any errors.
  _commandsError (value) {
    return (value.indexOf('Operation') > -1 || value.indexOf('No entries') > -1)
  }
  // Formater to convert plain text to objects
  _formater (value, cmd) {
    let formated
    switch (cmd) {
      case 'ls -la':
        let Dir = []
        let line
        let list = []
        // Breaking each line from promise
        console.log(value)
        let breakedResponse = value.split('\n')
        breakedResponse.shift()
        for (line in breakedResponse) {
          if (breakedResponse.hasOwnProperty(line)) {
            // Check if data is dir or file
            if (breakedResponse[line].indexOf('fil') !== -1 || breakedResponse[line].indexOf('dir') !== -1) {
              list = breakedResponse[line].replace(/ +/g, ' ').split(' ')
              // Name start at position 6 so we concat all white spaced words into one string
              // insert it into position 6
              list[6] = list.splice(6, list.length - 1).join(' ')
              Dir.push({
                name: list[6],
                file: list[2],
                size: (parseInt(list[1]) / 1000),
                mode: list[0]
              })
            }
          }
        }
        formated = Dir
        break
      case 'sysinfo':
        value = value.replace(/ +:/g, ':').split('\n')
        if (value[value.length - 1] === '') {
          value.pop()
        }
        formated = value
        break
      case 'sms':
        value = value.split('\n')
        let sms
        let smses = value.splice(9, value.length - 1)
        let titles = ''
        let msgs = ''
        let dates = ''
        for (sms in smses) {
          if (smses.hasOwnProperty(sms)) {
            titles += smses[sms].indexOf('Address') > -1 ? smses[sms].replace('Address\t: ', '') : '~'
            msgs += smses[sms].indexOf('Message') > -1 ? smses[sms].replace('Message\t: ', '') : '~'
            dates += smses[sms].indexOf('Date') > -1 ? smses[sms].replace('Date\t: ', '') : '~'
          }
        }
        let titlesGroup = titles.replace(/~+/g, '~').split('~')
        let msgsGroup = msgs.replace(/~+/g, '~').split('~')
        let datesGroup = dates.replace(/~+/g, '~').split('~')
        let smsResult = []
        for (let j = 1; titlesGroup.length - 1 > j; j++) {
          smsResult.push({
            title: titlesGroup[j],
            msg: msgsGroup[j],
            date: datesGroup[j]
          })
        }
        formated = smsResult
        break
      case 'contact':
        value = value.split('\n')
        let contact
        let contacts = value.splice(9, value.length - 1)
        let names = ''
        let numbers = ''
        for (contact in contacts) {
          if (contacts.hasOwnProperty(contact)) {
            names += contacts[contact].indexOf('Name') > -1 ? contacts[contact].replace('Name\t: ', '') : ','
            numbers += contacts[contact].indexOf('Number') > -1 ? contacts[contact].replace('Number\t: ', '') : ','
          }
        }
        let namesGroup = names.replace(/,+/g, ',').split(',')
        let numbersGroup = numbers.replace(/,+/g, ',').split(',')
        let result = []
        // start at 1 and length - 1 because first and last element is always empty
        for (let i = 1; namesGroup.length - 1 > i; i++) {
          result.push({
            name: namesGroup[i],
            number: numbersGroup[i]
          })
        }
        formated = result
        break
      default:
        formated = value
        break
    }
    return formated
  }
  /**
   * _parseBuffer
   * @param {object} value
   */
  _parseBuffer (value) {
    const pack = msgpack.decode(new Uint8Array(value))
    return this._toObject(pack)
  }

  /**
   * _toObject
   * @param {object} value
   */
  _toObject (value) {
    if (value instanceof Buffer) {
      return value.toString()
    } else if (value instanceof Array) {
      const arr = []
      value.forEach((val) => {
        arr.push(this._toObject(val))
      })
      return arr
    } else if (value instanceof Object) {
      const obj = {}
      Object.keys(value).forEach((key) => {
        if (value.hasOwnProperty(key)) {
          obj[key] = this._toObject(value[key])
        }
      })
      return obj
    } else {
      return value
    }
  }
}
