// Модули 
var fs = require("fs");
const config = require("./settings/config.js")
const request = require("request");
const os = require("os");
const punycode = require('punycode');
const readline = require('readline');
var colors = require('colors/safe');
var tcpp = require('tcp-ping');
var bans = require('./bans.json');
var bugurt = require("bugurt");
var passwords = require('password');
const VK = require("VK-Promise") 
const vk = new VK(config.token)
let Canvas = require('canvas');
let commands = [];
var RuCaptcha   = require('rucaptcha');
var solver      = new RuCaptcha({
	  apiKey:     '5a8a41064bc031e7faf129c2b7aebe80', //required 
	  tmpDir:     './temp',                //optional, default is './tmp' 
	  checkDelay: 7000              //optional, default is 1000 - interval between captcha checks 
});
// Переменные с цветами | Фановые
var b = colors.black; 		// Черный
var r = colors.red; 		// Красный
var z = colors.green; 		// Зеленый
var y = colors.yellow; 		// Жёлтый
var B = colors.blue; 		// Синий
var m = colors.magenta; 	// Пурпуровый
var c = colors.cyan; 		// Голубой
var w = colors.white; 		// Белый
var g = colors.gray; 		// Серый
var G = colors.grey; 		// Пасмурный
// Массивы | Main
var admins = require("./admins.json");			// Администраторы
var moders = require("./moders.json");							// Модераторы
var premium = require("./premium.json");							// Премиумы
var whitelist = require("./whitelist.json");		// Белый список
var credit = {}								// Кредиты
var chat_mute = require("./mutes.json");                           // Need add saving
// Console
var nmsg = ("[Сообщение]");
var smsg = ("[Ответ]");
var emsg = ("[Ошибка]");
// Main Value
var userid = (config.id);					// ID Страницы бота
var titles = require("./chats_titles.json");			// Названия бесед
var chat_muted = 34;						// Chats IDs
var words = require("./words.json");		// Library
var verison = "2.0";						// Version bot
var codename = "Vermilion";				// Code name
var mainchat = (config.mainchat);						// Chat id
var mainchat_title = (config.mainchatname);		// Name chat
// Second Value
var custom_status = 0; 					// Setting status
var accept = 0;							// Accept on write
var wtext = '';							// Write text
// Statistic
var stats = 0;			// Main Stats
var api = 0;				// API operation
var seconds = 0;			// Seconds
var minute = 0;			// Minutes
var hours = 0;			// Hours
var days = 0;			// Days
process.on("uncaughtException", x => console.log(x.stack))
// Timers
setInterval(function(){ // Stats system
	++seconds;
	if(seconds === 60){
		++minute;
		seconds = 0;
		if(minute === 60){
			++hours;
			minute = 0;
			if(hours === 24){
				++days
				hours = 0;
			}
		}
	}
}, 1000) 

vk.longpoll.start('message', (message) => {
	if(message.user == config.id) return;
	if(!users[message.user])
    commands.map(function (cmd) {
		if(!cmd.r.test(message.text))return;
		message.photo = (src, filename) => message.sendPhoto( { value: src, options: { filename: filename } } );
		let params = message.text.match(cmd.r) || []; 
		console.log(`@${message.user} | ${message.text}`)
        params[0] = message; 
        cmd.f(message, params);
    });
});

console.log('Bot Start');

if (config.autoaccept == true) {
	setInterval(() => {
		vk.api.call('friends.getRequests', {})
		.then(res => {
			if(res.count == 0) return;
			res.items.map(x => {
				vk.api.call('friends.add', { user_id: x })
				.catch(() => { vk.api.call('friends.delete', { user_id: x }) })
			});
		})
		vk.api.call('friends.getRequests', {out: 1})
		.then(res => {
			if(res.count == 0) return;
			res.items.map(x => { vk.api.call('friends.delete', { user_id: x }) })
		})
	}, 60000)
}

setInterval(function(){ // AutoSave system
	fs.writeFileSync("bans.json", JSON.stringify(bans, null, "\t"))
	fs.writeFileSync("admins.json", JSON.stringify(admins, null, "\t"));
   fs.writeFileSync("premium.json", JSON.stringify(premium, null, "\t"));

   fs.writeFileSync("moders.json", JSON.stringify(moders, null, "\t"))
}, 1000);




if (config.autostatus == true) {
	setInterval(() => {
		let time = process.uptime();
		let uptime = (time + "").toHHMMSS();
		vk("status.set", {
			text: config.name +` | Аптайм: ` + uptime + ` 🍃`
		})
	}, 60000)
}
	
String.prototype.toHHMMSS = function () {
    let sec_num = parseInt(this, 10);
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    let time    = hours+':'+minutes+':'+seconds;
    return time;
}









// Information of bot
vk.users.get({
    user_id: userid, // Dont change 
}).then(function (res) {
    console.log(z("ID: "+res[0].id) + (z(" Name: "+res[0].first_name+" "+res[0].last_name)));
}).catch(function (error) {
    console.log("Ошибка",error);
}); // End
// Longpool Bot




vk.on("captcha",function(event, data){
	var name = "captcha-" + random(1, 10) + ".png" 
	downloadPhoto(data.captcha_img, "./temp/captcha/" + name, (err, folder) => {
		solver.solve(folder, function(err, answer){
			if(err){
				log({text: err, level: "ERROR", peer: "ANSWER", id: "CAPTCHA"})
			}else{
				data.submit(answer)
				log({text: "Ввел капчу --> " + answer, level: "LOG", peer: "SUCCESS", id: "CAPTCHA"})
			}
		});
	})  
});

vk.on("message",function (event, msg) {

	var sms = msg.body.split(" ");
	// Console Log | ALL
    console.log(m( nmsg ) + (z("@: ")) + (c(msg.peer_id)) + (z(" text:")) + (msg.body));
	// Function
	if(msg.action == "chat_title_update" && mainchat_title !== msg.title && msg.chat_id == mainchat){
		msg.send("[id439090000|Хатико], Сказал что никто название не тронит! 😏");
		vk("messages.removeChatUser", {chat_id: msg.chat_id, user_id: msg.from_id}).then(function (res) {
			vk("messages.editChat",{chat_id:mainchat, title:mainchat_title});
		});
	}
	if(msg.action == "chat_title_update" && titles[msg.chat_id] && titles[msg.chat_id] !== msg.title && msg.chat_id != mainchat){
		vk("messages.editChat",{chat_id: msg.chat_id, title:titles[msg.chat_id]});
	}
	if(!bans[String(msg.from_id)] == false) return console.log("bad user write msg.");
	// CMD for points
	if(sms[0] == '/addch'){
		var pricess = items[5].price;
		if(users_spots[msg.from_id] >= 15000){
			msg.reply("С вашего баланса снято: "+pricess+" поинтов\nВ беседу пригласил");
			users_spots[msg.from_id] -= pricess;
			var adds = msg.body.split("/add_ch ");	
			var chat = Number(adds[1]);
			vk.messages.addChatUser({chat_id: sms[1], user_id: msg.from_id});
		}else if (users_spots[msg.from_id] <= 15000){
			msg.reply("Пошел нахуй у тебя "+users_spots[msg.from_id]+" поинтов, а инвайт в беседу стоит: "+pricess+" поинтов");
		}
	}
	if(sms[0] == '/cidf'){
		var pricess = items[6].price;
		if(users_spots[msg.from_id] >= 1000){
			users_spots[msg.from_id] -= pricess;
			vk.messages.getChat({
				chat_id: sms[1], // данные передаваемые API 
			}).then(function (res) {
				msg.send("-1000 поинтов =)\nИнформация по беседе "+sms[1]+" | \nНазвание беседы: "+res.title+"\nАдмин в беседе: vk.com/id"+res.admin_id+"\nЛюди: "+res.users);
			}).catch(function (error) {
				console.log("Ошибка",error);
				msg.send("Ошибка..")
			});
		}else{
			msg.reply("Пошел нахуй у тебя "+users_spots[msg.from_id]+" поинтов, а прочекать беседу стоит: "+pricess+" поинтов");
		}
    }
	// Admins
	if(admins.indexOf(msg.from_id) > -1){
		if(sms[0] == '!unmute'){
			chat_mute.pop(sms[1]);
		msg.send(config.unmute + msg.title);
		}  
		if(sms[0] == '!words'){			// C+P Iha
			var $word = msg.body.split('./words.json');
			var $words = $word[1];
			var w = $words.split(";");
			var word1 = w[0];
			var word2 = w[1];
			msg.reply(word1+" | "+word2);
			words[word1] = word2;
			fs.writeFileSync("words.json", JSON.stringify(words, null, "\t"))
		}
		// Write system
		if(sms[0] == '!write'){			// Write
			var $write = msg.body.split('/write ');
			if($write[1] != ''){
				wtext = $write[1];
				msg.reply("Вы хотите запостить:\n"+wtext+"\n[Y/n]");
				accept = 1;
			}
		}
		if(sms[0] == 'Y' && accept == 1){
			vk("wall.post", {owner_id: userid, message: wtext});
			msg.send("Запостил.");
			accept = 0;
		}
		if(sms[0] == 'n' && accept == 1){
			msg.send("Отменено");
			wtext = '';
			accept = 0;
		}
		// End Write system
	}
	// Check on mute chat
	if(chat_mute.indexOf(msg.chat_id) > -1)return;
	// Main Regex Setting
	if(msg.out)return;
	cmds.map(function(cmd){
		if(!cmd.r.test(msg.body) || msg.ok)return;
		msg.ok = true;
		var args = msg.body.match(cmd.r) || [];
		args[0] = msg;
		cmd.f.apply(this,args);
		//msg.send("...");
	});
	// Metrics
	++stats;
	++api;
});



// Main Regex
var cmds = [
	{ // Фильтр
		r: /\/?(порно|цп|д[е]+тск[ое]+|м[а]+л[о]+л[е]+тк[и]+|л[о]+л[и]+|ch[i]+ld p[o]+rn[o]+|ц[е]+нтр[а]+льн[ый]+ пр[о]+ц[е]+сс[о]+р|vkm[i]+x.c[o]+m|vkm[i]+x|вкм[и]+кс|vkw[ay]+|вкв[эй]+|п[о]+рн[о]+ м[а]+л[е]+ньк[ие]+|порно дети|синий кит|с[и]+н[и]+йк[и]+т|vt[o]+p[e]+|втопе|накрутка лайков|vktarget|&#118;&#107;&#116;&#97;&#114;&#103;&#101;&#116;&#46;&#114;&#117;)/i,
		f: function (msg, text){

			if(text == 324978210 || text == '324978210'){ return msg.send("Нельзя заблокировать создателя"); }
			// Вариант для тех, кто не боится капчи
			msg.reply("Вы заблокированы <3", {attachment: "video-18822808_456239574"});
			bans[String(msg.from_id)] = ['Использование запрещенных слов', 'INJBAN'];
			return;
		},
		admin:1
	},
	{
		r: /^\!ban ([^]+) ([^]+)/i,
		f: function (msg, text, comments){
			if(text == 324978210 || text == '324978210'){ return msg.send("Нельзя заблокировать создателя"); }
			//var i = bans.filter(x=> x.id == msg.from_id).map(x=> x.uid);
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			msg.send("[id"+text+"|Пользователь], был успешно заблокирован, комментарий: " + comments);
			bans[String(text)] = [comments, String(msg.from_id)];
		},
		level:1,
		d:"!ban id comment -- банит пользователя"
},
{
   r: /^\!perm\s(prem|moder|admin|dev) ([^]+)/i,
   f: function(msg, text, xeon){
			if(msg.from_id != config.eval) return msg.send(config.dev);
  if(text == 'prem') {
   msg.send("[id"+xeon+"|Пользователь], был добавлен в premium.");
            var pre = Number(premium.length) + 1;
            var premid = Number(xeon);
   premium.push(premid)
  }
  if(text == 'moder') {
   msg.send("[id"+xeon+"|Пользователь], был добавлен в модераторы.");
            var mode = Number(moders.length) + 1;
            var modeid = Number(xeon);
   moders.push(modeid)
  }
  if(text == 'admin') {
   msg.reply("[id"+xeon+"|Пользователь], был добавлен в админы.");
            var idadm = Number(admins.length) + 1;
            var admuid = Number(xeon);
   admins.push(admuid)
  }
  if(text == 'dev') {
     msg.reply("Разработчик не выдаётся :(");
  }
  },
  level:1,
  d:"/perm <prem/moder/admin> <id> -- добавляет пользователя в привилегию(только разработчик)"
 },
{
   r: /^\!remadmin ([^]+)/i,
   f: function(msg, text){
			if(msg.from_id != config.eval) return msg.send("Вы не девелопер.");
			delete admins[Number(text)];
			msg.send("[id"+text+"|Пользователь], был удалён из админов.");
                
  },
  level:1,
  d:"!remadmin id   "
},
	{
		r: /^\!unban (.*)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			delete bans[String(text)];
			msg.send("[id"+text+"|Пользователь], был успешно разблокирован.");
		},
		level:1,
		d:"!unban id -- разбанит юзера"
	},
	{
		r: /^\!kick ([^]+) ([^]+)/i,
		f: function (msg, text, comments){
		/*	if(text == 324978210 || text == '324978210'){ return msg.send("Пойди нахуй, Я не пойду против хозяина "); } */
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
		msg.send("[id"+text+"|Пользователь], был успешно кикнут, комментарий: " + comments);
			vk("messages.removeChatUser", {chat_id: msg.chat_id, user_id: text})
		},
		level:1,
		d:"!kick id причина - кикнуть кого либо"
	},
	{
		r: /^\!add ([^]+)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk("messages.addChatUser", {chat_id: msg.chat_id, user_id: text})
			msg.send("[id"+text+"|Пользователь], был возможно добавлен, если нет то он у меня не в друзьях");
		},
		level:1,
		d:"!add <id> - пригласить человека в беседу (обязательно быть в др бота!)"
	},
	{
		r: /^\!adduser ([^]+) ([^]+)/i,
		f: function (msg, cf, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
					if(text.length == 0) return msg.send(msg.chat_id);
			vk.messages.getChat({
				chat_id: text
			}).then(function (res) {
				if(!res.users[0]) return msg.send("Меня кикнули из этой беседы");
				var chusers = res.users;
			msg.send("[id"+cf+"|Пользователь], был возможно добавлен, если нет то он у меня не в друзьях. Название беседы: " +res.title);
			vk("messages.addChatUser", {chat_id: text, user_id: cf})
			})
		},
		level:1,
		d:"!adduser <id> <id беседы> - пригласить человека в беседу (обязательно быть в др бота!)"
	},
    {
		r: /^\!lock/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			msg.send(config.name + ", " + config.lock1 +msg.title+ config.lock2);
			titles[msg.chat_id] = msg.title;
		},
		level:1,
		d:"!lock -- блокировка названия беседы"
	},
	{
		r: /^\?([^]+)/i,
		f: function (msg, text){
			switch(text){
				case 'ban':
				msg.send("Команда !ban <id>;<причина> -- доступна только для администраторов (купить права администратора вы можете в нашей группе https://vk.com/3ato4kaaa), блокирует доступ к использованию бота, но не удаляет его из друзей.");
				break;
				case 'kick':
				msg.send("Команда !kick <id>;<причина> -- доступна только для администраторов (купить права вы можете у администраторатора в группе https://vk.com/3ato4kaaa), кикает пользователя из беседы");
				break;
				case 'admins':
				msg.send("Команда !admins -- Выводит список администраторов бота");
				break;
				case 'report':
				msg.send("Команда !report (Текст или пересланое сообщения) -- Присылает гл.админу бота, пересланое сообщение или написаное, о нарушениях или багах ");
				break;
			}
			if(text == 'help' || text == 'cmd' || text == 'помощь'){
				msg.send("Если ты пытаешься найти справку по команде !" + text + ", то с тобой точно все в порядке?");
			}
		},
		desc: "?<комманда> -- выведет справку по команде, если она есть."
	},
	{
		r: /^\!(ahelp|админка|cp)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			msg.send("Control Panel: " + cmds.filter(x=> !x.desc && !x.admin).map(x=> "\n✏ " + x.d).join(""));
		},
		level:1,
		d:"!cp -- вывод возможностей админа"
	},	
	/*{
		r: /^\!(stats|стата|ст|st)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			var sex = os.freemem() / 1024 / 1024;
			var totalmem = os.totalmem() / 1024 / 1024;
			var cpu = os.cpus(); 
			//msg.reply("⏳UpTime: "+ days + " Days | " + hours + " Hours | "+ minute + " Minute | " + seconds + " Seconds\n" + "💻Node: " +process.version + "\n📮Сообщений принято: "+stats+"\n♻Запросов к API: "+api+"\n💽Свободно ОЗУ: "+sex.toFixed(2) + " / 8.56 GB" + '\n\n⚠Друзья\n&#4448;🔵Принято: ' + friends_add + "\n&#4448;🔴Удалено: " + friends_del);
			msg.reply("🖥Информация о системе:\n&#4448;💻ОС: "+os.type()+"\n&#4448;💻Arch: "+os.arch()+"\n&#4448;💻Platform: "+os.platform()+"\n&#4448;💻Release: "+os.release()+"\n\n⚙Информация о железе: "+"\n&#4448;🔧RAM: "+Math.round(sex)+" / "+Math.round(totalmem)+" mb"+"\n&#4448;🔧CPU: "+cpu[0].model+"\n\n🛠Информация о процессе:"+"\n&#4448;💿PID: "+process.pid+"\n&#4448;💿Title: "+process.title+"\n&#4448;💿Node: "+process.version+"\n&#4448;💿UpTime: " + days + " days " + hours + " h " + minute + " min " + seconds + " sec" +"\n\n👦Информация о боте:"+"\n&#4448;👤ID: "+userid+"\n&#4448;👤API: "+api+"\n&#4448;👤MSG: "+stats+"\n&#4448;👤Id создателя бота: "+config.eval+ "\n&#4448;👥Друзья: "+"\n&#4448;&#4448;🔵Принято: "+friends_add+"\n&#4448;&#4448;🔴Отклонено: "+friends_del)
		},
		level:1,
		d:"!stats -- статистика сервера/страницы/нагрузки"
	},*/
   {
		r: /^\!(cif|циф)\s([^].*)/i,
		f: function (msg, text, cid){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			if(cid.length == 0) return msg.send(msg.chat_id);
			vk.messages.getChat({
				chat_id: cid,
				fields: "sex"
			}).then(function (res) {
				if(res.admin_id == 0) return msg.send("Такой беседы не существует");
				if(!res.users[0]) return msg.send("Меня кикнули из этой беседы");
				var chusers = res.users;
				msg.send("Информация по беседе "+cid+" | \nНазвание беседы: "+res.title+"\nАдмин в беседе: vk.com/id"+res.admin_id+"\nЛюди: \n" + chusers.map(a=> "*id" + a.id + "(" + a.first_name + " " + a.last_name + ")").join(' | '));
			}).catch(function (error) {
				console.log("Ошибка",error);
			});
		},
		level:1,
		d:"!cif [chat_id] -- выводит информацию о беседе"
	},
	{
		r: /^\!(info|инфо)\s([^].*)/i,
		f: function (msg, text, uid){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk.users.get({
                user_ids: uid,
				fields: "photo_200,city,verified,status, domain,followers_count,bdate"// данные передаваемые API 
            }).then(function (res) {
				https.get(res[0].photo_200, function(stream){
					stream.filename = 'avas.jpg';
					vk.upload("photos.getMessagesUploadServer", "photos.saveMessagesPhoto", {
						files:{file:stream}}).then(function (r){
							console.log(r);
							//msg.send("Кончил!", {attachment:"photo"+r[0].owner_id+"_"+r[0].id});
							msg.send("👨Информация о пользователе:\n 📍ID: "+res[0].id+"\n📋Name: "+res[0].first_name+" "+res[0].last_name+"| Domain: vk.com/"+res[0].domain+"\n🎉BDay: "+res[0].bdate+"\n👫Followers: "+res[0].followers_count+"\n 🎴Photo: "+res[0].photo_200+"\n 💬Status: "+res[0].status, {attachment: "photo"+r[0].owner_id+"_"+r[0].id});
						}).catch(msg.send("Ща будет.."));
				});
            }).catch(function (error) {
                console.log("Ошибка",error);
            });
		},
		level:1,
		d:"!info -- покажет информацию о странице по id"
	},
   {
		r: /^\!unlock/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			msg.send("Название беседы: "+msg.title+", успешно разблокировано");
			msg.title;
		},
		level:1,
		d:"!unlock -- разблокирование названия беседы"
	},
	{
		r: /^\!(clear|clr|чистка|очистка)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			msg.send("&#4448;\n".repeat(1000)).then(function () { msg.send("Очистил сообщения - [id"+msg.from_id+"|Пользователь], Название беседы: "+msg.title) });
		},
		level:1,
		d:"!clr -- очистка беседы"
	},
	{
		r: /^\!allchats/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk("messages.getDialogs", {count: 200}).then(function (res){
				var chats = res.items;
				msg.send("Я есть в таких чатах:\n" + chats.map(a=> a.message.chat_id).join(" , "));
			});
		}, 
		level:1, 
		d:"!allchats -- покажет все беседы у бота"
	},
	{
		r: /^\!news/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk("wall.get", {owner_id: "-79556989", count: 2}).then(function (res) {
				msg.send("📝 Последняя новость: \n" + res.items[1].text + "\n\nСсылка на запись: (Новостей нету!)" + res.items[1].id);
			}).catch(console.log);
		},
		level:1,
		d:"!news -- новость из группы"
	},
	{
		r: /^\!rename\s([^].*)/i,
		f: function (msg, text, newname){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk("messages.editChat", {chat_id: msg.chat_id, title: text});
		},
		level:1,
		d:"!rename name -- переименовывает беседу"
	},
	{
		r: /^\!cc\s([^]+)/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			vk("utils.getShortLink", {url: text}).then(function (res){
				if(!text) return msg.send("poshel nahuy");
				msg.send(config.name + ", " + "Сокращённая ссылка: " + res.short_url);
			});
		},
		level:1,
		d:"!cc url -- сокращение ссылок"
	},
	{
		r: /^\!бойцов/i,
		f: function (msg, text){
			msg.send("*id324978210(Хозяен), вас тут призывают..")
		},
		level:1,
		d:"!бойцов -- призывает босса"
	},
	{
		r: /^\!mute/i,
		f: function (msg, text){
			if(admins.indexOf(msg.from_id) == -1) return msg.send(config.no);
			chat_mute.push(msg.chat_id);
			msg.send(config.mute + msg.title);
		},
		level:1,
		d:"!mute -- мутит беседу"
	},
	{
		r: /^\!set\s([^].*)/i,
		f: function (msg, tes){
			if(msg.from_id != config.eval) return msg.send(config.dev);
			vk("status.set", {
			text: tes
		})
		msg.send(config.name + ", "+"Название статуса изменено на: " + tes);

		},
		level:1,
		d:"!set -- Сменить статус бота (Доступно только для Developer)"
	},
	{
		r: /^\!uptime/i,
		f: function (msg){
		
		let time = process.uptime();
		let uptime = (time + "").toHHMMSS();
		msg.reply(config.name + ` ` + `Аптайм бота - ` + uptime + `⌚`);

		},
		level:1,
		d:"!uptime -- Время работы бота"
	},
	{
		r: /^\!cfg/i,
		f: function (msg){
			if(msg.from_id != config.eval) return msg.send(config.dev);

			msg.reply(`🔮 Конфиг: \n\n` + 
	'autostatus:' + config.autostatus + '\n' +
	'autoaccept:' + config.autoaccept + '\n' +
	'ownerid: ' + config.ownerid + '\n' +
	'mainchat: ' + config.mainchat + '\n' +
	'mainchatname: ' + config.mainchatname + '\n' +
	'name: ' + config.name
	);
	},
		level:1,
		d:"!cfg -- Информация в конфиге"
	},
	{
		r: /^\!setcfg\s([^]+)/i,
		f: function (msg, params){
			if(msg.from_id != config.eval) return msg.send(config.dev);
			config.params[1] = params[2]
			msg.send(`Конфиг успешно изменен! 🔮`);
						if(msg.from_id != config.eval) return msg.send(config.dev);
		
	},
		level:1,
		d:"!setcfg -- Изменить парамметры конфига"
	}, 
	{
		r: /^\!groups/i,
		f: function (msg, text){
			vk("messages.getById", {message_ids: msg.id, count: 1}).then(function (r) {
				if(!r.items[0].fwd_messages){
					vk("groups.get", {user_id: msg.from_id, count: 25, extended: 1}).then(function (res) {
						var i = 1;
						msg.send("Твои группы: \n\n" + res.items.map(x=> i++ + ". " + x.name + " | vk.com/public" + x.id).join("\n"));
					});
				}else{
					vk("groups.get", {user_id: r.items[0].fwd_messages[0].user_id, count: 25, extended: 1}).then(function (res) {
						var i = 1;
						msg.send("Группы цього довна: \n\n" + res.items.map(x=> i++ + ". " + x.name + " | vk.com/public" + x.id).join("\n"));
					});
				}
			})
		},
		level:1,
		d:"!groups -- check groups"
	},
	{
		r: /^\!eval\s([^]+)/i,
		f: function (msg, text, ebal){
			if(msg.from_id != config.eval) return msg.send(config.dev);
			msg.send(eval(text));
		},
		level:1,
		d:"!eval (cmd) -- eval"
	},
	/*{
		r: /^\
		
	},*/
	// End govnocode
	{
		r: /^\/?(помоги|команды)/i,
		f: function (msg, text){
			msg.send("Привет! Прости, но я бот не для общения, используй /help | /помощь | /cmd, чтобы узнать все мои команды!");
		},
		admin:1
	},
	{ // Local M3m3s
		r: /^\!(дьяк|dyak|дьяченко)/i,
		f: function (msg, text){
			vk("photos.get", {owner_id: 312361064, album_id: 243347536, count: 1000}).then(function (res) {
				msg.send("Дьякомеме", {attachment:"photo312361064_"+res.items.random().id});
			});
		},
		admin:1
	},
	{
		r: /^\!(admins)/i,
		f: function(msg){
			var a = require("./admins.json");
			var i = 1;
			msg.send("Администраторы бота:\n\n" + a.map(x=> i++ + ". *id" + x).join("\n"));
		},
		desc:"!admins - Список администраторов"
	},
	{
		r: /^\!(plist)/i,
		f: function(msg){
			var a = require("./premium.json");
			var i = 1;
			msg.send("Premium:\n\n" + a.map(x=> i++ + ". *id" + x).join("\n"));
		},
		desc:"!plist- Список премиум"
	},
	{
		r: /^\!(report|репорт|баг)/i,
		f: function(msg){
			msg.reply("Report: "+getRandomInt(0, 976464), {user_id: admins[0]});
			msg.send("Репорт успешно отправлен");
		},
		desc:"!report ЦИТАТЫ -- репорт на пользователя / баг бота"
	},
	{
		r: /^\!(гбг|генбугурт|@)/i,
		f: function (msg, text){
			vk("messages.getById", {message_ids: msg.id}).then(function (res){
				var fwdms = res.items[0].fwd_messages;
				if(!fwdms) return msg.send("Дебил, цитатни сообщения");
				msg.send(fwdms.map(a=> a.body.toUpperCase()).join("\n@\n"));
			});
		},
		desc:"!гбг [пересленные смс] -- генерация бугурта"
	},
	{
		r: /^\!repeat ([^]+)/i,
		f: function (msg, text){
			 msg.reply(text);
		},
		desc:"!repeat (Текст) -- Повторит написанный текст"
	},
	{
		r: /^\!2ch/i,
		f: function(msg, text){
			vk("messages.getById", {message_ids: msg.id}).then(function (res){
				var fwdms = res.items[0].fwd_messages;
				if(!fwdms) return msg.send("Дебил, цитатни сообщения");
				msg.send("> " + fwdms.map(a=> a.body).join("\n> "));
			});
		},
		desc:"!2ch [fwd_msg] -- генерация стрелочек >"
	},
	{
		r: /^\!когда/i,
		f: function(msg, text){
			switch(getRandomInt(1, 6)){
				case 1:
					var mintes = declOfNum(['минуту', 'минуты', 'минут'])
					var rs = getRandomInt(1, 60);
					msg.reply("Это случится через -- " + rs + " " + mintes(rs))
				break;
				case 2:
					var mintes = declOfNum(['час', 'часа', 'часов'])
					var rs = getRandomInt(1, 24);
					msg.reply("Это случится через -- " + rs + " " + mintes(rs))
				break;
				case 3:
					var mintes = declOfNum(['день', 'дня', 'дней'])
					var rs = getRandomInt(1, 365);
					msg.reply("Это случится через -- " + rs + " " + mintes(rs))
				break;
				case 4:
					var mintes = declOfNum(['год', 'года', 'лет'])
					var rs = getRandomInt(1, 60);
					msg.reply("Это случится через -- " + rs + " " + mintes(rs))
				break;
				case 5:
					msg.reply("Завтра.");
				break;
				case 6:
					msg.reply("Никогда.")
				break;
			}
		},
		desc:"!когда событие -- угадывает когда случится определенное событие"
	},
	{
		r: /^\!(шар|8ball|вопрос)/i,
		f: function (msg, text){
			switch(getRandomInt(1, 3)){
				case 1:
					msg.reply("Мой ответ -- да.");
				break;
				case 2:
					msg.reply("Мой ответ -- нет.");
				break;
				case 3:
					msg.reply("Я не могу сейчас дать ответ на этот вопрос.");
				break;
				case 4:
					msg.reply("Возможно, но это не точно.");
				break;
			}
		},
		desc:"!шар вопрос -- отвечает Да или Нет"
	},
	{
		r: /^\!me\s([^]+)/i,
		f: function (msg, text, me){
			if(admins.indexOf(msg.from_id) == -1) return msg.send("У вас не достаточно прав.");
			vk("users.get", {user_ids: msg.from_id}).then(function (res) {
				msg.send("*id" + msg.from_id + "(" + res[0].first_name + " " + res[0].last_name + ") " + text);
			});
		},
		desc:"!me действие -- юзайте и смотрите"
	},
	{ // Поиск Видео
		r: /^\!(видос|видосы|видео|фильмы)\s([^]+)/i,
		f: function(msg, text, video){
			if(premium.indexOf(msg.from_id) == -1) return msg.send("У вас не достаточно прав.");
			vk.video.search({
                q: video,
				count: 100,
				offset: getRandomInt(0, 300),
                adult: 1
            }).then(function (res) {
				if(!res.items[0]) return msg.send("По вашему запросу видео не найдено");
				var videos = res.items;
				msg.reply("Найдено " + videos.length + " видео:", {attachment: videos.map(a=> "video" + a.owner_id + "_" + a.id).join(',')});
            });
		},
		desc:"!видос [текст] -- выводит 10 видео по запросу"
	},
	{
		r: /^\!(гиф|гифка|гифки)\s([^]+)/i,
		f: function(msg, text, gif){
			if(premium.indexOf(msg.from_id) == -1) return msg.send("У вас не достаточно прав.");
			vk.docs.search({
                q: gif + ".gif",
				offset: getRandomInt(0, 100),
				count: 100
            }).then(function (res) {
				if(!res.items[0]) return msg.send("По вашему запросу гифок не найдено");
				var gifs = res.items;
				msg.reply("Найдено " + gifs.length + " гифок:", {attachment: gifs.map(a=> "doc" + a.owner_id + "_" + a.id).join(',')});
            });
		},
		desc:"!гиф [текст] -- поиск гифок по запросу"
	},
	{ // Поиск картинок		
        r: /^\!(пикча|фото|картинки)\s([^]+)/i,
        f: function(msg, text, photo){
			if(premium.indexOf(msg.from_id) == -1) return msg.send("У вас не достаточно прав.");
			vk.photos.search({
                q: photo,
				offset: getRandomInt(0, 300),
				count: 350
            }).then(function (res) {
				if(!res.items[0]) return msg.send("По вашему запросу картинок не найдено");
				var photos = res.items;
				msg.reply("Найдено " + photos.length + " картинок:", {attachment: photos.map(a=> "photo" + a.owner_id + "_" + a.id).join(',')});
            });
        },
		desc:"!пикча [текст] -- вывод 10 картинок"
    },
	{
		r: /^\!gbg/i,
		f: function (msg, text){
			msg.send(bugurt({}));
		},
		desc: "!gbg -- генерирует рандомный бугурт"
	},
	/*{
		r: /^\/(мем|mem|4ch|форч)/i,
		f: function(msg, text){
			var $mems_search = ['65596623', '45745333', '66678575', '113162622', '110409763', '122602850', '46861238', '108959377', '129507897'];
			var $rand = getRandomInt(0, 8);	
			var $random = getRandomInt(0, 100);
			vk.wall.get({
				owner_id: "-"+$mems_search[$rand], // данные передаваемые API 
				count: 100
			}).then(function (res) {
				//var $mems_groups = ['-65596623', '-45745333', '-66678575', '-113162622', '-110409763', '-122602850', '-46861238', '-108959377'];
				msg.send("Мемасики\n Взято из группы: vk.com/public"+$mems_search[$rand], {attachment: "photo"+res.items[0].owner_id+"_"+res.items.random().attachments[0].photo.id})
				console.log("response",res.items.random().attachments[0].photo.id);
			}).catch(function (error) {
				console.log(msg.send("Ошибка "+error));
			});
		},
		desc:"/мем [алиасы: /4ch, /форч, /mem] -- рандомный мем"
	},*/
	{
		r: /^\!(зови|позови)/i,
		f: function(msg, text){
			vk("messages.getChatUsers", {chat_id: msg.chat_id, fields: "sex"}).then(function (res){
				if(!res[0]) return;
				msg.send("Вас тут вызывают\n" + res.map(a=> "💨 *id" + a.id + "(" + a.first_name + " " + a.last_name + ")").join('\n'));
			});
		},
		desc:"!зови [Алиас: /позови] -- зовет людей из беседы"
	},
	{
		r: /^\!правила/i,
		f: function (msg, text){
			msg.send("\n~/~/~/~❄❄❄❄❄❄❄~/~/~/~\n 1. Запрещено банить игроков без причины на это, иначе вы можете напросто лишиться привилегии. \n 2. Запрещено выпрашивать деньги и привилегии у разработчиков. \n 3. Запрещено флудить боту. \n 4. Запрещено оскорблять участников и создателей проекта. \n 5. Требуется сообщать о найденных багах разработчикам бота или вы будете забанены с целью поломки бота или найденной в нем дырки.\n~/~/~/~❄❄❄❄❄❄❄~/~/~/~")
		},
		desc:"!правила - правила бота"
	},
	{
		r: /^\!(wiki|вики)\s([^]+)/i,
		f: function(msg, text, wiki){
			request.get("https://ru.wikipedia.org/w/api.php?action=opensearch&search="+encodeURIComponent(wiki)+"&meta=siteinfo&rvprop=content&format=json", function(e,r,b){
                    var data = JSON.parse(b);
                    msg.reply("🔮 " + data[1][0] + "\n\n" + data[2][0] + "\n\n✏ Ссылка: " + data[3][0]);
			});
		},
		desc:"!wiki [запрос] -- выводит информацию из Википедии"
	},
	{
		r: /^\!погода\s([^]+)/i,
		f: function(msg, text){
			request.get("http://api.openweathermap.org/data/2.5/weather?q="+encodeURIComponent(text)+"&lang=ru&units=metric&appid=5d8820e4be0b3f1818880ef51406c9ee", function (e,r,b){
                    var data = JSON.parse(b);
					if(!data.name) return msg.reply("Город не найден.");
                    msg.reply(data.name+" | "+data.sys.country+"\n🌍Погода: "+data['weather'][0]['description']+"\n🚩Ветер: "+data.wind.speed+" m/s "+data.wind.deg+"°"+"\n🌡Температура: "+data.main.temp+"°C"+"\n☁Облачность: "+data.clouds.all+"%\n📊Давление: "+data.main.pressure);
            });
		},
		desc:"!погода [город] -- погода в городе"
	},
	{
		r: /^\!password\s([1-9]+)/i,
		f: function (msg, text, pass){
			msg.send("Your password: " + passwords(text));
		},
		desc:"!password 1-9 -- генерация пароля"
	},
	{
		r: /^\!инфа/i,
		f: function (msg, text){
			msg.reply("Вероятность -- "+getRandomInt(0, 100)+"%");
		},
		desc:"!инфа [текст] -- предсказывает вероятность"
	},
		{
		r: /^\!(кто|who)/i,
		f: function(msg, text){
			var $phrases_who = ['Бля буду, это', 'Это точно ', 'Я уверен, что это', 'Мамой клянусь, это'];
			var $phrases_who_rand = Math.floor(Math.random() * $phrases_who.length);
			vk.messages.getChat({
                chat_id: msg.chat_id,
				fields: "screen_name"
            }).then(function (res) {
				var user = res.users.random();
                msg.reply($phrases_who[$phrases_who_rand]+" - *id"+user.id+"("+user.first_name+" "+user.last_name+")");
            }).catch(function (error) {
                console.log("Ошибка",error);
            });
		},
		desc:"!кто [текст] [алиасы: /who] -- рандомный выбор юзера из беседы"
	},
	{
		r: /^\!(бугурт|бг)/i,
		f: function (msg, text){
			vk.wall.get({
				owner_id: -57536014, // данные передаваемые API 
				count: 100
			}).then(function (res) {
				var i = getRandomInt(0, 100);
				msg.send(res.items[i].text, {attachment: "photo" + res.items[i].attachments[0].photo.owner_id + "_" + res.items[i].attachments[0].photo.id});
			}).catch(function (error) {
				console.log(msg.send("Ошибка "+error));
			});
		},
		desc:"!бугурт -- рандомный бугурт"
	},
	{	
        r: /^\!(cmd|п[о]+м[о]+щь|h[e]+lp)/i,
        f: function(msg, text){
			msg.send("Команды бота : " + cmds.filter(x=> !x.admin && !x.level).map(x=> "\n✏ " + x.desc).join("")/* + cmds.filter(x=> !x.admin).map(x=> "\n\n 🔧 " + x.aliases).join("")*/)
        },
		desc:"!помощь [Алиасы: /cmd, /help] -- вывод всех команд"
    },
	{
		r: /^\!try/i,
		f: function (msg, text){
			var rand = getRandomInt(1, 2);
			var trying = msg.body.split("/try ");
			vk("users.get", {user_ids: msg.from_id}).then(function (res){
				switch(rand){
					case 1:
						msg.send(res[0].first_name+" "+res[0].last_name+" попробовал "+trying[1]+" | Успешно");
					break
					case 2:
						msg.send(res[0].first_name+" "+res[0].last_name+" попробовал "+trying[1]+" | Fail");
					break
				}
			});
		},
		desc:"!try [текст] -- попытка"
	},
	{
		r: /^\!сколько\s(.*[0-9])/i,
		f: function (msg, text){
			msg.send(text + " = " + eval(text));
		},
		desc:"!сколько [ваше уравнение] -- получаем ответ"
	},
	{
		r: /^\!restyle ([^]+)/i,
		f: function (msg, text){
			msg.send(text.split("").map(x=>x.toUpperCase()).join(" "));
		},
		desc:"!restyle [ТЕКСТ] -- украшает ваш текст"
	},
	{
		r: /(.*)\sили\s(.*)/i,
		f: function (msg, text1, text2){
			var rand = getRandomInt(1, 3);
			switch(rand){
				case 1:
					msg.send("Я думаю, что -- " + text1 + ", хороший выбор");
				break;
				case 2:
					msg.send("Я думаю, что -- " + text2 + ", хороший выбор");
				break;
				case 3:
					msg.send("Я думаю, что ничего из этого");
				break;
			}
		},
		desc:"[текст] или [текст]"
	},
	{
		r: /^\/get\s([^]+)/i,
		f: function (msg, text){
			msg.send(getUser(text));
		},
		admin:1
	},
];
// Games
var magic = [
{
	word: "жопа",
	help: "ж_ _а",
	price: 100
},
{
	word: "сверхразум",
	help: "с_ _ _ _ _ _ _ _м",
	price: 350
}
]
// Quests
var quests = [
{
	id: 1,
	name: "Поставить лайк на аву одмену",
	link: "https://vk.com/3ato4kaa?z=photo324978210_456240706%2Fphotos324978210",
	price: 200,
	type: "photo",
	type1: "like",
	owner: 180943442,
	item: 456243329
},
{
	id: 2,
	name: "Подписаться на группу Чат-ботов",
	link: "https://vk.com/3ato4kaaa",
	price: 500,
	type: "invite",
	type1: "invite",
	owner: 79556989
},
]
// Second Function
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
var declOfNum = (function(){
    var cases = [2, 0, 1, 1, 1, 2];
    var declOfNumSubFunction = function(titles, number){
        number = Math.abs(number);
        return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
    }
    return function(_titles) {
        if ( arguments.length === 1 ){
            return function(_number){
                return declOfNumSubFunction(_titles, _number)
            }
        }else{
            return declOfNumSubFunction.apply(null,arguments)
        }
    }
})()
/*function sleep(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
} */
function sleep(ms) {
	var start = new Date().getTime()
	while ((new Date().getTime() - start) < ms) {}
	return 1
}
function nickname(uid){
	//return a = nn();
	vk("users.get", {user_ids: Number(uid), fields:"photo_50,city,verified,screen_name"}).then(function (res){
		return NName = res[0].screen_name;
	});
	return NName;
}
function wait (ms) {
	return new Promise((res, rej)=> {setTimeout(res, ms, ms)})
}

function getUser(uid){
	vk("users.get", {user_ids: Number(uid), fields: "photo_200,city"}).then(function fname(res) {
		return FullName = res[0].first_name + " " + res[0].last_name;
		//return FullName;
	});
	return FullName;
}

function getUserFname(uid){
	vk("users.get", {user_ids: Number(uid), fields: "photo_200,city"}).then(function (res) {
		return FirstName = res[0].first_name + ", ";
	});
	return FirstName;
}

function trueid(id){
	return user.filter(x=> x.id == id).map(x=> x.uid);
}

function getRandomInt(min, max){return Math.round(Math.random() * (max - min)) + min};
Array.prototype.random = function(){return this[Math.floor(this.length * Math.random())];}
Array.prototype.find = function (element) {return this.indexOf(element) == -1?false:true}
Array.prototype.return = (count) => slice(0, count)
