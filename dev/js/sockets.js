liveChat.sockets = {
	io: false,
	initIo: function () {
		if (!this.io) {
			this.io = io(liveChat.settings.socketServerUrl + '/' + liveChat.settings.siteId );
		}
	},
	sendMessage: function (message, to) {
		liveChat.sockets.emit("sendMessage", {
			"from": liveChat.settings.current_user_id,
			"to": to,
			"msg": message,
			"display_name": liveChat.settings.current_user_display_name,
			"image_url": liveChat.settings.current_user_avatar
		});
	},
	emit: function (name, data) {
		liveChat.sockets.io.emit(name, data);
	},
	on: function (name, callback) {
		liveChat.sockets.io.on(name, callback);
	},
};