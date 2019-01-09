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
			// Toolset for XML listen to port 9876
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
				value: 'This module is for the Barco Eventmaster Toolset xml version. Be Carefull, no suport from Barco!'
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
				width: 18
				/*regex: '/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/'*/
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

	self.system.emit('instance_actions', self.id, {
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
		},/* choices need some work
		'userkeys': {
			label: 'Apply userkey',
			options: [
				{
					type: 'textinput',
					label: 'userkey number',
					id: 'userkeyNumber',
					default: '1'
				}
			]
		},*/
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
	});
};


instance.prototype.action = function (action) {
		var self = this;
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (action.action) {

			case 'custom':
			if (self.tcp !== undefined) {
				cmd = opt.custom ;
				debug('sending ', cmd, "to", self.tcp.host);
				self.tcp.write(cmd);
			}
			break;

			case 'userkeys':
			if (self.tcp !== undefined) {
				//debug('sending ', cmd, "to", self.tcp.host);
				self.tcp.write('<System id="0" GUID="542696d038d3-240352"><DestMgr id="0"><ScreenDestCol id="0"><ScreenDest id="0"><LayerCollection id="0"><Layer id="0"><LastUserKeyIdx>0</LastUserKeyIdx><ApplyUserKey>'+opt.userkeyNumber+'</ApplyUserKey></Layer></LayerCollection></ScreenDest></ScreenDestCol></DestMgr></System>');
			}
			break;

			case 'multiviewerlayout':
			if (self.tcp !== undefined) {
				debug('sending multiviewer change to', self.config.macAddress);
				self.tcp.write('<System id="0" GUID="542696d038d3-bcc201"><FrameCollection id="0"><Frame id="' + self.config.macAddress + '"><MultiViewer id="0"><LayoutSelect>' + opt.layoutNumber + '</LayoutSelect></MultiViewer></Frame></FrameCollection></System>');

			}
			break;

		}

		if (cmd !== undefined) {
			if (self.tcp !== undefined) {
				//debug('sending ', cmd, "to", self.tcp.host);
				//self.tcp.send(cmd);
			}
		}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
