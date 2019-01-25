var instance_skel = require('../../instance_skel');
var tcp = require('../../tcp');
var debug;
var log;

function instance(system, id, config) {
		var self = this;

		// super-constructor
		instance_skel.apply(this, arguments);
		self.actions(); // export actions
		return self;
}

instance.prototype.init = function () {
		var self = this;

		debug = self.debug;
		log = self.log;

		self.status(self.STATUS_UNKNOWN);

		if (self.config.host !== undefined) {
			// EMT for XML listen to port 9876
			self.tcp = new tcp(self.config.host, 9876);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function () {
				// Ignore
			});
		}
};

instance.prototype.updateConfig = function (config) {
		var self = this;
		self.config = config;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
			delete self.tcp;
		}
		// Toolset for XML listen to port 9876
		if (self.config.host !== undefined) {
			self.tcp = new tcp(self.config.host, 9876);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function (message) {
				// ignore for now
			});
		}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
		var self = this;
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the Barco Eventmaster Toolset xml version. <br> Be Carefull, <strong>no support from Barco!</strong><br> You need to fill in the MAC address of the unit when you want to use multiviewer layout switch. You wil find it by pressing the arrow down next to IP address under discovered. <br><br>Hit Ctrl+o or Cmd+o for xml output from EMT'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: self.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'macAddress',
				label: 'Target MAC-Address',
				width: 18,
				regex: '/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/'
			}
		]
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
		}
		debug("destroy", self.id);
};

instance.prototype.CHOICES_LAYOUT = [
	{ label: '1', id: '0' },
	{ label: '2', id: '1' },
	{ label: '3', id: '2' },
	{ label: '4', id: '3' }
];

instance.prototype.actions = function (system) {
	var self = this;

	var actions = {
		'multiviewerlayout': {
			label: 'Change multiviewer layout',
			options: [
				{
					type: 'dropdown',
					label: 'Layout number',
					id: 'layoutNumber',
					default: '1',
					choices: self.CHOICES_LAYOUT
				}
			]
		},
		'userkeys': {
			label: 'Apply userkey',
			options: [
				{
					type: 'textinput',
					label: 'userkey number (sending -1)',
					id: 'userKey',
					default: '1',
					regex: '/^[1-9]*$/'
				},{
					type: 'textinput',
					label: 'Screen Destination (sending -1)',
					id: 'screenDest',
					default: '1',
					regex: '/^[1-9]*$/'
				},{
					type: 'textinput',
					label: 'Layer (sending -1)',
					id: 'layer',
					default: '1',
					regex: '/^[1-9]*$/'
				}
			]
		},
		'custom': {
			label: 'Custom XML',
			options: [
				{
					type: 'textinput',
					with: 50,
					label: 'Put your XML here',
					id: 'custom'
				}
			]
		}
	};

	self.setActions(actions);
};

instance.prototype.action = function (action) {
		var self = this;
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (id) {

			case 'custom':
				cmd = opt.custom ;
				break

			case 'userkeys':
				var screenDest = parseInt(opt.screenDest) - 1;
				var userKey = parseInt(opt.userKey) - 1;
				var layer = parseInt(opt.layer) - 1;
				cmd = `<System id="0" GUID="005056c00001-00617e"><DestMgr id="0"><ScreenDestCol id="0"><ScreenDest id="${screenDest}"><LayerCollection id="0"><Layer id="${layer}"><LastUserKeyIdx>${userKey}</LastUserKeyIdx><ApplyUserKey>${userKey}</ApplyUserKey></Layer></LayerCollection></ScreenDest></ScreenDestCol></DestMgr></System>`;
				break

			case 'multiviewerlayout':
				cmd = `<System id="0" GUID="542696d038d3-bcc201"><FrameCollection id="0"><Frame id="${self.config.macAddress}"><MultiViewer id="0"><LayoutSelect>${opt.layoutNumber}</LayoutSelect></MultiViewer></Frame></FrameCollection></System>`;
				log('log', 'sending multiviewer layout: ' + opt.layoutNumber);
				break
		}

		if (cmd !== undefined) {
			if (self.tcp !== undefined) {
				debug('sending ', cmd, "to", self.tcp.host);
				self.tcp.write(cmd);
			}
		}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
