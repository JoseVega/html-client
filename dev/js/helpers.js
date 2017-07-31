liveChat.helpers = {
	setCookie: function (cname, cvalue, minutes) {
		var d = new Date();
		d.setTime(d.getTime() + (minutes * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	},
	getCookie: function (cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	},
	AddZero: function (num) {
		return (num >= 0 && num < 10) ? "0" + num : num + "";
	},
	findDif: function (time) {
		if ((time.slice(0, 4) < liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7)) + 12) > 1) || (time.slice(0, 4) == liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && liveChat.dateNow > parseInt(time.slice(8, 10)))) {
			return this.numberToMonth(parseInt(time.slice(5, 7))) + " " + time.slice(8, 10);
		} else if (((liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && (liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)))) > 7) || ((liveChat.monthNow - parseInt(time.slice(5, 7))) == 0 && (liveChat.dateNow - parseInt(time.slice(8, 10))) > 7)) {
			return this.numberToMonth(parseInt(time.slice(5, 7))) + " " + time.slice(8, 10);
		} else {
			var days = 0;
			if (liveChat.monthNow - parseInt(time.slice(5, 7)) > 0) {
				days = liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)));
			} else {
				days = liveChat.dateNow - parseInt(time.slice(8, 10));
			}
			if (days > 1) {
				var template = liveChat.settings.texts.daysAgo;
				var data = {
					unit: days,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
			} else {
				var hours = days * 24 + (liveChat.hoursNow - parseInt(time.slice(11, 13)));
				if (hours > 23) {
					return liveChat.settings.texts.yesterday;
				} else {
					if (hours > 1) {
						var template = liveChat.settings.texts.hoursAgo;
				var data = {
					unit: hours,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
					} else {
						var minutes = hours * 60 + (liveChat.minutesNow - parseInt(time.slice(14, 16)));
						if (minutes > 59) {
						var template = liveChat.settings.texts.hourAgo;
				var data = {
					unit: hours,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
						} else if (minutes > 1) {
						var template = liveChat.settings.texts.minutesAgo;
				var data = {
					unit: minutes,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);	
						} else if (minutes > 0) {
						var template = liveChat.settings.texts.minuteAgo;
				var data = {
					unit: 1,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);	
						} else {
							return liveChat.settings.texts.now;
						}
					}
				}
			}
		}
	},
	findDifLastOnline: function (time) {
		if (time === undefined) {
			return "";
		}
		if ((time.slice(0, 4) < liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7)) + 12) > 1) || (time.slice(0, 4) == liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && liveChat.dateNow > parseInt(time.slice(8, 10)))) {
			return this.numberToMonth(parseInt(time.slice(5, 7))) + " " + time.slice(8, 10);
		} else if (((liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && (liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)))) > 7) || ((liveChat.monthNow - parseInt(time.slice(5, 7))) == 0 && (liveChat.dateNow - parseInt(time.slice(8, 10))) > 7)) {
			return this.numberToMonth(parseInt(time.slice(5, 7))) + " " + time.slice(8, 10);
		} else {
			var days = 0;
			if (liveChat.monthNow - parseInt(time.slice(5, 7)) > 0) {
				days = liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)));
			} else {
				days = liveChat.dateNow - parseInt(time.slice(8, 10));
			}
			if (days > 1) {
				var template = liveChat.settings.texts.daysAgo;
				var data = {
					unit: days,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
			} else {
				var hours = days * 24 + (liveChat.hoursNow - parseInt(time.slice(11, 13)));
				if (hours > 23) {				
					return liveChat.settings.texts.yesterday;
				} else {
					if (hours > 1) {
						var template = liveChat.settings.texts.hoursAgo;
				var data = {
					unit: hours,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
					} else {
						var minutes = hours * 60 + (liveChat.minutesNow - parseInt(time.slice(14, 16)));
						if (minutes > 59) {
						var template = liveChat.settings.texts.hourAgo;
				var data = {
					unit: hours,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);
						} else if (minutes > 1) {
						var template = liveChat.settings.texts.minutesAgo;
				var data = {
					unit: minutes,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);		
						} else {
						var template = liveChat.settings.texts.minuteAgo;
				var data = {
					unit: 1,
				};
				Mustache.parse(template); // optional, speeds up future uses
				return Mustache.render(template, data);	
						}
					}
				}
			}
		}
	},
	numberToMonth: function (month) {
		switch (month) {
			case 1:
				return "Jan"
				break;
			case 2:
				return "Feb"
				break;
			case 3:
				return "Mar"
				break;
			case 4:
				return "Apr"
				break;
			case 5:
				return "May"
				break;
			case 6:
				return "June"
				break
			case 7:
				return "July"
				break;
			case 8:
				return "Aug"
				break;
			case 9:
				return "Sep"
				break;
			case 10:
				return "Oct"
				break;
			case 11:
				return "Nov"
				break;
			case 12:
				return "Dec"
				break;
		}
	},
	getMonthDays: function (year, month) {
		switch (month) {
			case 1:
				return 31
				break;
			case 2:
				if (year % 4 == 0) {
					return 29;
				} else {
					return 28;
				}
				break;
			case 3:
				return 31
				break;
			case 4:
				return 30
				break;
			case 5:
				return 31
				break;
			case 6:
				return 30
				break
			case 7:
				return 31
				break;
			case 8:
				return 31
				break;
			case 9:
				return 30
				break;
			case 10:
				return 31
				break;
			case 11:
				return 30
				break;
			case 12:
				return 31
				break;
		}
	},
	findDifBig: function (time) {
		if (!time) {
			return '';
		}
//		throw new Error( 'variable time can not be empty');
		if ((time.slice(0, 4) < liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7)) + 12) > 1) || (time.slice(0, 4) == liveChat.yearNow && (liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && liveChat.dateNow > parseInt(time.slice(8, 10)))) {
			return time.slice(0, 4) + "/" + time.slice(5, 7) + "/" + time.slice(8, 10) + " | " + time.slice(11, 16);
		} else if (((liveChat.monthNow - parseInt(time.slice(5, 7))) > 0 && (liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)))) > 7) || ((liveChat.monthNow - parseInt(time.slice(5, 7))) == 0 && (liveChat.dateNow - parseInt(time.slice(8, 10))) > 7)) {
			return time.slice(0, 4) + "/" + time.slice(5, 7) + "/" + time.slice(8, 10) + " | " + time.slice(11, 16);
		} else {
			var days = 0;
			if (liveChat.monthNow - parseInt(time.slice(5, 7)) > 0) {
				days = liveChat.dateNow - parseInt(time.slice(8, 10)) + this.getMonthDays(time.slice(0, 4), parseInt(time.slice(5, 7)));
			} else {
				days = liveChat.dateNow - parseInt(time.slice(8, 10));
			}
			if (days > 1) {
				return time.slice(0, 4) + "/" + time.slice(5, 7) + "/" + time.slice(8, 10) + " " + time.slice(11, 16);
			} else {
				var hours = days * 24 + (liveChat.hoursNow - parseInt(time.slice(11, 13)));
				if (hours > 23) {
					return "Yesterday";
				} else {
					if (hours > 1) {
						return hours + " hours";
					} else {
						var minutes = hours * 60 + (liveChat.minutesNow - parseInt(time.slice(14, 16)));
						if (minutes > 59) {
							return hours + " hour";
						} else if (minutes > 1) {
							return minutes + " mins";
						} else if (minutes > 0) {
							return minutes + " min";
						} else {
							return "now";
						}
					}
				}
			}
		}
	},
	scrollToBottom: function ( $messagesContainer ) {
//		console.log( $messagesContainer);
		if ( $messagesContainer.length > 1 ) {
			$messagesContainer = $messagesContainer.first();
		}
//		console.log( $messagesContainer);
		for (var i = 0; i < 6; i++) {
			setTimeout(function () {
//				console.log( $messagesContainer);
				console.log( $( $messagesContainer).height() );
				$( $messagesContainer).scrollTop( $( $messagesContainer)[0].scrollHeight );
			}, 400 * i);
		}
	},
	getQueryStringValue: function (field, url) {
		var href = url ? url : window.location.href;
		var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
		var string = reg.exec(href);
		return string ? string[1] : null;
	},
	// new
	setDateNow: function () {
		now = new Date();
		liveChat.strDateTime = [
			[now.getFullYear(), liveChat.helpers.AddZero(now.getMonth() + 1), liveChat.helpers.AddZero(now.getDate())].join("-"), [liveChat.helpers.AddZero(now.getHours()), liveChat.helpers.AddZero(now.getMinutes()), liveChat.helpers.AddZero(now.getSeconds())].join(":")
		].join(" ");
		liveChat.yearNow = now.getFullYear();
		liveChat.monthNow = now.getMonth() + 1;
		liveChat.dateNow = now.getDate();
		liveChat.hoursNow = now.getHours();
		liveChat.minutesNow = now.getMinutes();
	},
	waitForUpload: function (message, to, isFloatingChat, textarea) {
		if (isFloatingChat) {
			if (liveChat.filesNumCB[to] > 0) {
				setTimeout(liveChat.api.waitForUpload, 500, message, to, true, textarea);
			} else {
				$("#loadingDivChatBox" + to).removeClass("loadingChatBox");
				liveChat.api.sendMessage(message, to);
				$(textarea).val('').prop("disabled", false);
			}
		} else {
			if (liveChat.filesNum > 0) {
				setTimeout(liveChat.api.waitForUpload, 500, message, to);
			} else {
				$(".loading").removeClass("loading");
				liveChat.api.sendMessage(message, to);
				$("#newMessage").val('').prop("disabled", false);
			}
		}
	},
	replaceImageShortcode: function (shortcode) {
		var outImage = "<br><a href='#' class='open-image-lightbox'><img src=" + liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_image&image=$1 class=messageImage></a><br>";
		var outFile = "<a target='_blank' href='" + liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=download_proxy&file=$1'>$3</a><br>";
		shortcode = shortcode.replaceAll('&quot;', '"');
		return shortcode.replace(/\[linked_file="(.+)" type="(.+)" filename="(.+)"\]/i, (shortcode.indexOf('type="image"') < 0) ? outFile : outImage);

	},
};