/*
 * Meterpreter commmands
 */
//
// File Systemn Commands
export const CAT = 'cat '
export const CD = 'cd '
export const LS = 'ls -la'
export const DOWNLOAD = 'download '
export const MKDIR = 'mkdir '
export const RM = 'rm '
export const RM_DIR = 'rmdir '
export const UPLOAD = 'upload '

// Networking Commands
export const IF_CONFIG = 'ifconfig'
export const NETSTAT = 'netstat'

// System Commands
export const REBOOT = 'reboot'
export const SHUTDOWN = 'shutdown'
export const SYSINFO = 'sysinfo'
export const PS = 'ps'

// User Interface commands
// screenshot -p /home/user/Documents/kage/[randomname].jpeg -v false
export const SCREENSHOT = 'screenshot '

// Webcam commands
// record_mic -d 1 -f /home/user/Documents/kage/[randomname].wav -p false
export const RECORD_MIC = 'record_mic'
export const WEBCAM_LIST = 'webcam_list'

// webcam_snap -i 1 -p /home/user/Documents/kage/[randomname].jpeg -v false
export const WEBCAM_SNAP = 'webcam_snap'

// android commands
export const DUMP_SMS = 'dump_sms'
export const DUMP_CONTACTS = 'dump_contacts'
// whitelisting commands that returns nothing
export const WHITELISTED = [CD, DOWNLOAD, MKDIR, RM, RM_DIR, REBOOT, SHUTDOWN, RECORD_MIC, DUMP_SMS, DUMP_CONTACTS]
