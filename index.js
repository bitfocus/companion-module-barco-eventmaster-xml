const { InstanceBase, runEntrypoint, TCPHelper, InstanceStatus } = require('@companion-module/base')

class EventmasterXmlInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.tcp = null
  }

  async init(config) {
    this.config = config
    this.updateStatus(InstanceStatus.Connecting)
    this.initTCP()
    this.initActions()
  }

  async destroy() {
    if (this.tcp) {
      this.tcp.destroy()
      this.tcp = null
    }
  }

  async configUpdated(config) {
    this.config = config
    this.initTCP()
  }

  getConfigFields() {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Target IP',
        width: 6,
        default: '',
      },
      {
        type: 'textinput',
        id: 'macAddress',
        label: 'Target MAC Address',
        width: 6,
        default: '',
      },
    ]
  }

  initTCP() {
    if (this.tcp) {
      this.tcp.destroy()
      this.tcp = null
    }

    if (this.config.host) {
      this.tcp = new TCPHelper(this.config.host, 9876)

      this.tcp.on('status_change', (status, message) => {
        this.updateStatus(status, message)
      })

      this.tcp.on('error', (err) => {
        this.log('error', `TCP Error: ${err.message}`)
      })
    }
  }

  initActions() {
    this.setActionDefinitions({
      multiviewerlayout: {
        name: 'Change multiviewer layout',
        options: [
          {
            type: 'dropdown',
            label: 'Layout number',
            id: 'layoutNumber',
            default: '0',
            choices: [
              { id: '0', label: '1' },
              { id: '1', label: '2' },
              { id: '2', label: '3' },
              { id: '3', label: '4' },
            ],
          },
        ],
        callback: async (event) => {
          const cmd = `<System id="0" GUID="542696d038d3-bcc201"><FrameCollection id="0"><Frame id="${this.config.macAddress}"><MultiViewer id="0"><LayoutSelect>${event.options.layoutNumber}</LayoutSelect></MultiViewer></Frame></FrameCollection></System>`
          this.log('info', `Sending multiviewer layout: ${event.options.layoutNumber}`)
          this.sendCommand(cmd)
        },
      },

      userkeys: {
        name: 'Apply userkey',
        options: [
          {
            type: 'textinput',
            label: 'Userkey number (sending -1)',
            id: 'userKey',
            default: '1',
          },
          {
            type: 'textinput',
            label: 'Screen Destination (sending -1)',
            id: 'screenDest',
            default: '1',
          },
          {
            type: 'textinput',
            label: 'Layer (sending -1)',
            id: 'layer',
            default: '1',
          },
        ],
        callback: async (event) => {
          const screenDest = parseInt(event.options.screenDest) - 1
          const userKey = parseInt(event.options.userKey) - 1
          const layer = parseInt(event.options.layer) - 1

          const cmd = `<System id="0" GUID="005056c00001-00617e"><DestMgr id="0"><ScreenDestCol id="0"><ScreenDest id="${screenDest}"><LayerCollection id="0"><Layer id="${layer}"><LastUserKeyIdx>${userKey}</LastUserKeyIdx><ApplyUserKey>${userKey}</ApplyUserKey></Layer></LayerCollection></ScreenDest></ScreenDestCol></DestMgr></System>`
          this.sendCommand(cmd)
        },
      },

      custom: {
        name: 'Custom XML',
        options: [
          {
            type: 'textinput',
            label: 'XML content',
            id: 'custom',
            default: '',
          },
        ],
        callback: async (event) => {
          this.sendCommand(event.options.custom)
        },
      },
    })
  }

  sendCommand(cmd) {
    if (this.tcp && cmd) {
      this.log('debug', `Sending: ${cmd}`)
      this.tcp.send(cmd)
    }
  }
}

runEntrypoint(EventmasterXmlInstance)
