
liveChat.api.data = {
	connectWith: function (id) {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=addFriend",
			data: {
				"id": id
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}
		});
	},
	getUnreadMessagesCount: function () {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=unread_messages_count",
			data: {
//                id: liveChat.settings.current_user_id,
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}
		});
	},
	isConnectedWith: function (userId) {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=check_user",
			data: {
				"id": userId
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}
		});
	},
	// mark messages as read on the server
	markAllMessagesAsReadFrom: function (user_id) {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_messages",
			data: {
				"id": user_id
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}.bind(this)
		});
	},
	searchContacts: function (search_term, isFloatingChat) {

		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=search_users",
			data: {
				"timeNow": liveChat.strDateTime,
				"like": search_term
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}.bind(this)
		});
	},
	searchContactsByFirstLetter: function (search_term) {

		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=search_users_one_letter",
			data: {
				"timeNow": liveChat.strDateTime,
				"like": search_term
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}.bind(this)
		});
	},
	searchMessages: function (search_term, id, display_name, image) {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=search_messages",
			data: {
				"user_id": id,
				"timeNow": liveChat.strDateTime,
				"search": search_term
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}.bind(this)
		});

	},
	updateLastOnline: function () {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=update_last_online",
			data: {
			}
		});
	},
	getMessagesWith: function (id, isFloatingChat) {
		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=get_all_messages",
			data: {
				"user_id": id,
				"timeNow": liveChat.strDateTime,
				"page": (isFloatingChat) ? liveChat.pages[id] : liveChat.page
			}
		});
	},
	getUserLastOnline: function (id, callback) {

		$.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=get_user_last_online",
			data: {
				"id": id,
				"timeNow": liveChat.strDateTime
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
				var out;
				if (result < 0) {
					out = false;
				}
				out = {
					full_time: result["m_time"].slice(0, 4) + "/" + result["m_time"].slice(5, 7) + "/" + result["m_time"].slice(8, 10) + " " + result["m_time"].slice(11, 16),
					friendly_time: liveChat.helpers.findDifLastOnline(result["m_time"])
				};
				callback(out);
			}.bind(this)
		});
	},
	getContacts: function () {

		return $.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_users",
			data: {
				"timeNow": liveChat.strDateTime
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
				console.log(textStatus);
				console.log(jqXHR.responseText);
			},
			success: function (result) {
				console.log(result);
			}
		});
	},
	saveMessage: function (to, message) {

		$.ajax({
			type: "POST",
			dataType: "json",
			url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=send_message",
			data: {
				"to": to,
				"message": message
			},
			error: function (jqXHR, textStatus, errorThrown) {
			},
			success: function (result) {
				console.log(result);
			}
		});
	},
};