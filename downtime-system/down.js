//A System for tracking Downtime Activities
//Made by Julexar (https://app.roll20.net/users/9989180/julexar)

//API Commands:
/* !down - will give you the menu
    --Options--
    --sel - use the selected character token
    --name - use the character name
    --charid - use the character id
*/

var Downtime = Downtime || (function(){
    'use strict';
    
    var version='0.8c',
    
    setDefaults = function() {
        state.down = {
            now: {
                time: 0,
                type: "Week",
                substr: "s",
                dc: 0,
                crimeval: 0,
                train: "",
                potion: "",
                item: "",
            }
        };
    },
    
    handleInput = function(msg) {
        var args=msg.content.split(/\s+--/);
        if (msg.type!=="api") {
            return;
        }
        if (playerIsGM(msg.playerid)) {
            switch (args[0]) {
                case '!setdown':
                    setdown(args[1],args[2],args[3],msg);
                    downmenu(args[1],msg);
                    return;
            }
        }
        switch (args[0]) {
            case '!down':
                downmenu(args[1],msg);
                return;
            case '!brewmenu':
                brewmenu(args[1],args[2],args[3],msg);
                return;
            case '!brew':
                brew(args[1],args[2],args[3],msg);
            case '!craftmenu':
                craftmenu(args[1],args[2],args[3],args[4],msg);
                return;
            case '!craft':
                craft(args[1],args[2],args[3],msg);
                return;
            case '!trainmenu':
                trainmenu(args[1],args[2],msg);
                return;
            case '!train':
                train(args[1],args[2],args[3],msg);
                return;
            case '!crimemenu':
                crimemenu(args[1],args[2],msg);
                return;
            case '!commit':
                crime(args[1],args[2],msg);
                return;
            case '!setitem':
                state.down.now.item=args[1];
                craftmenu(args[2],args[3],args[4],args[5],msg);
                return;
        }
    },
    
    downmenu = function(option,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let speakingName = msg.who;
        let char;
        if (option) {
            if (option.includes('sel')) {
                option.replace("sel","");
                option=msg.selected;
                let charid=getIDsFromTokens(option)[0];
                char=findObjs({
                    _type: 'character',
                    _id: charid
                })[0];
                if (playerIsGM(msg.playerid)) {
                    let name=option;
                    char.get('gmnotes',function(gmnotes) {
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --type ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    });
                } else {
                    char.get("gmnotes",function(gmnotes) {
                        if (gmnotes="") {
                            sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                        } else {
                            sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                'Downtime: ' + gmnotes + //--
                                '</table>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --time ?{Time?|1}">Craft Items</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + '--skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!research --charid ' + charid + ' --time ?{Time?|7}">Research</a></div>' + //--
                                '</div>'
                            );
                        }
                    });
                }
            } else if (option.includes('name')) {
                option.replace("name ","");
                char=findObjs({
                    _type: 'character',
                    name: option
                }, {caseInsensitive: true});
                if (char.length>1) {
                    sendChar("Downtime","/w "+msg.who+" Multiple Characters with the same name exist, please select the token and use >>!down --sel<< instead");
                }
            } else if (option.includes('charid')) {
                option.replace("charid ","");
                char=findObjs({
                    _type: 'character',
                    _id: option
                }, {caseInsensitive: true})[0];
            }
            if (option.includes("type")) {
                option=option.replace("type ","");
                if (option=="All") {
                    
                } else {
                    if (playerIsGM(msg.playerid)) {
                        let name=option;
                        char.get('gmnotes',function(gmnotes) {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --type ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        });
                    }
                }
            }
        } else {
            if (playerIsGM(msg.playerid)) {
                sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                    '<div ' + headstyle + '>Downtime</div>' + //--
                    '<div ' + substyle + '>Menu</div>' + //--
                    '<div ' + arrowstyle + '></div>' + //--
                    '<table>' + //--
                    '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --type ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + '</a></td></tr>' + //--
                    '</table>' + //--
                    '</div>'
                );
            } else {
                let char = findObjs({
                    _type: 'character',
                    name: msg.who
                }, {caseInsensitive: true})[0];
                let charid=char.get('_id');
                if (char) {
                    char.get("gmnotes",function(gmnotes) {
                        let time=String(gmnotes);
                        if (time=="") {
                            sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                        } else {
                            sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                'Downtime: ' + time + //--
                                '</table>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --time ?{Time?|1}">Craft Items</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + '--skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!research --charid ' + charid + ' --time ?{Time?|7}">Research</a></div>' + //--
                                '</div>'
                            );
                        }
                    });
                } else {
                    sendChat("Downtime","/w "+msg.who+" Please select a character either as the one you're speaking as or by using one of these Options:<br>--sel (select the character token)<br>--name {Character Name}<br>--charid {Character ID}");
                }
            }
        }
    },
    
    getIDsFromTokens = function (selected) {
		return (selected || []).map(obj => getObj("graphic", obj._id))
			.filter(x => !!x)
			.map(token => token.get("represents"))
			.filter(id => getObj("character", id || ""));
	},
    
    setdown = function(player,amount,type,msg) {
        amount=Number(amount.replace("amount ",""));
        type=type.replace("type ","");
        player=player.replace("type ","");
        if (player=="All") {
            state.down.now.time=amount;
            state.down.now.type=type;
            let characters=findObjs({
                _type: 'character'
            });
            var realamount=0;
            switch (type) {
                case 'Week':
                    realamount+=amount*7;
                    break;
                case 'Month':
                    realamount+=amount*30;
                    break;
                case 'Year':
                    realamount+=amount*360;
                    break;
                case 'Day':
                    realamount=amount;
                    break;
            }
            _.each(characters,function(attr) {
                if (realamount>1) {
                    attr.set('gmnotes',realamount+" Days");
                } else if (realamount==1) {
                    attr.set('gmnotes',realamount+" Day");
                } else {
                    attr.set('gmnotes',"");
                }
            });
        } else {
            let char=findObjs({
                _type: 'character',
                name: player
            }, {caseInsensitive: true})[0];
            var realamount=0;
            switch (type) {
                case 'Week':
                    realamount+=amount*7;
                    break;
                case 'Month':
                    realamount+=amount*30;
                    break;
                case 'Year':
                    realamount+=amount*360;
                    break;
                case 'Day':
                    realamount=amount;
                    break;
            }
            if (realamount>1) {
                char.set('gmnotes',realamount+" Days");
            } else if (realamount==1) {
                char.set('gmnotes',realamount+" Day");
            } else {
                char.set('gmnotes',"");
            }
        }
    },
    
    brewmenu = function(charid,type,amount,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let potionlist;
        let price;
        let time;
        type=type.replace("rarity ","");
        charid=charid.replace("charid ","");
        amount=Number(amount.replace("amount ",""));
        switch (type) {
            case 'Common':
                potionlist="Potion of Climbing,Potion of Healing";
                time=1;
                price=25;
                break;
            case 'Uncommon':
                potionlist="Oil of Slipperiness,Philter of Love,Potion of Advantage,Potion of Animal Friendship,Potion of Fire Breath,Potion of Hill Giant Strength,Potion of Growth,Potion of Healing (Greater),Potion of Poison,Potion of Resistance,Potion of Water Breathing";
                time=5;
                price=100;
                break;
            case 'Rare':
                potionlist="Elixir of Health,Oil of Etherealness,Potion of Aqueous Form,Potion of Clairvoyance,Potion of Diminution,Potion of Gaseous Form,Potion of Frost Giant Strength,Potion of Stone Giant Strength,Potion of Fire Giant Strength,Potion of Cloud Giant Strength,Potion of Healing (Superior),Potion of Heroism,Potion of Invulnerability,Potion of Maximum Power,Potion of Mind Control (Beast),Potion of Mind Control (Humanoid),Potion of Mind Reading";
                time=25;
                price=1000;
                break;
            case 'Very Rare':
                potionlist="Oil of Sharpness,Potion of Flying,Potion of Healing (Supreme),Potion of Invisibility,Potion of Longevity,Potion of Mind Control (Monster),Potion of Possibility,Potion of Speed,Potion of Vitality";
                time=60;
                price=10000;
                break;
            case 'Legendary':
                potionlist="Potion of Dragon\'s Majesty,Potion of Storm Giant Strength";
                time=125;
                price=50000;
                break;
        }
        let list;
        for (let i=0;i<15;i++) {
            list=potionlist.replace(',','|');
        }
        time*=amount;
        price*=amount;
        let char=findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        char.get("gmnotes",function(gmnotes){
            let ntime=gmnotes.replace(" Days","");
            if (Number(ntime)<time) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let gold=findObjs({
                    _type: 'attribute',
                    _characterid: charid,
                    _name: "gp"
                }, {caseInsensitive: true})[0];
                let cur=gold.get('current');
                if (Number(cur)<price) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
                } else {
                    sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Brewing</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<table>' + //--
                        '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!brewmenu --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                        '<tr><td>Potion: </td><td><a ' + astyle1 + '" href="!setpotion --potion ?{Potion?|' + list + '} --type ' + type + ' --amount ' + amount + '">' + state.down.now.potion + '</a></td></tr>' + //--
                        '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!brewmenu --rarity ' + type + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<br>Price: ' + price + ' GP<br>' + //--
                        'Time needed: ' + time + ' Days<br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!brew --potion ' + state.down.now.potion + ' --amount ' + amount + '">Brew Potion</a></div>' + //--
                        '</div>'
                    );
                }
            }
        })
    },
    
    brew = function(charid,potion,amount,msg) {
        charid=charid.replace("charid ","");
        let char=findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: "gp"
        }, {caseInsensitive: true})[0];
        let description;
        let modifiers="Item Type: Potion";
        let price;
        let neededtime;
        switch (potion) {
            case 'Potion of Climbing':
                description="When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour. During this time, you have advantage on Strength (Athletics) checks you make to climb. The potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors.";
                price=25;
                time=2;
                break;
            case 'Potion of Healing':
                description="When you drink this potion, you regain 2d4 + 2 Hit Points.";
                modifiers+=", Damage: 2d4+2,Damage Type: Healing";
                price=25;
                time=2;
                break;
            case 'Oil of Slipperiness':
                description="This sticky black unguent is thick and heavy in the container, but it flows quickly when poured. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of a Freedom of Movement spell for 8 hours.\nAlternatively, the oil can be poured on the ground as an action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours.";
                price=100;
                time=5;
                break;
            case 'Philter of Love':
                description="The next time you see a creature within 10 minutes after drinking this philter, you become charmed by that creature for 1 hour. If the creature is of a species and gender you are normally attracted to, you regard it as your true love while you are charmed. This potion's rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart.";
                price=100;
                time=5;
                break;
            case 'Potion of Advantage':
                description="When you drink this potion, you gain advantage on one ability check, attack roll, or saving throw of your choice that you make within the next hour.<br> This potion takes the form of a sparkling, golden mist that moves and pours like water";
                price=100;
                time=5;
                break;
            case 'Potion of Animal Friendship':
                description="When you drink this potion, you can cast the Animal Friendship spell (save DC 13) for 1 hour at will. Agitating this muddy liquid brings little bits into view: a fish scale, a hummingbird tongue, a cat claw, or a squirrel hair.";
                price=100;
                time=5;
                break;
            case 'Potion of Fire Breath':
                description="After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.<br>This potion\'s orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.";
                price=100;
                time=5;
                break;
            case 'Potion of Hill Giant Strength':
                description="When you drink this potion, your Strength score changes to 21 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=100;
                time=5;
                break;
            case 'Potion of Growth':
                description="When you drink this potion, you gain the enlarge effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously expands from a tiny beat to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process.";
                price=100;
                time=5;
                break;
            case 'Potion of Healing (Greater)':
                potion="Potion of Greater Healing";
                modifiers+=", Damage: 4d4+4,Damage Type: Healing";
                description="You regain 4d4 + 4 hit points when you drink this potion.";
                price=100;
                time=5;
                break;
            case 'Potion of Poison':
                description="This concoction looks, smells, and tastes like a Potion of Healing or other beneficial potion. However, it is actually poison masked by illusion magic. An Identify spell reveals its true nature.<br><br> If you drink it, you take 3d6 poison damage, and you must succeed on a DC 13 Constitution saving throw or be poisoned. At the start of each of your turns while you are poisoned in this way, you take 3d6 poison damage. At the end of each of your turns, you can repeat the saving throw. On a successful save, the poison damage you take on your subsequent turns decreases by 1d6. The poison ends when the damage decreases to 0.";
                modifiers+=", Damage: 3d6, Damage Type: Poison";
                price=100;
                time=5;
                break;
            case 'Potion of Resistance':
                description="When you drink this potion, you gain resistance to one type of damage for 1 hour. The DM chooses the type or determines it randomly.";
                price=100;
                time=5;
                break;
            case 'Potion of Water Breathing':
                description="You can breathe underwater for 1 hour after drinking this potion. Its cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it.";
                price=100;
                time=5;
                break;
            case 'Elixir of Health':
                description="When you drink this potion, it cures any disease afflicting you, and it removes the blinded, deafened, paralyzed, and poisoned conditions. The clear red liquid has tiny bubbles of light in it.";
                price=1000;
                time=25;
                break;
            case 'Oil of Etherealness':
                description="Beads of this cloudy gray oil form on the outside of its container and quickly evaporate. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour.";
                price=1000;
                time=25;
                break;
            case 'Potion of Aqueous Form':
                description="When you drink this potion, you transform into a pool of water. You return to your true form after 10 minutes or if you are incapacitated or die. You\'re under the following effects while in this form:<br><br> Liquid Movement. You have a swimming speed of 30 feet. You can move over or through other liquids. You can enter and occupy the space of another creature. You can rise up to your normal height, and you can pass through even Tiny openings. You extinguish nonmagical flames in any space you enter.<br><br> Watery Resilience. You have resistance to nonmagical damage. You also have advantage on Strength, Dexterity, and Constitution saving throws.<br><br> Limitations. You can\'t talk, attack, cast spells, or activate magic items. Any objects you were carrying or wearing meld into your new form and are inaccessible, though you continue to be affected by anything you\'re wearing, such as armor.";
                price=1000;
                time=25;
                break;
            case 'Potion of Clairvoyance':
                description="When you drink this potion, you gain the effect of the Clairvoyance spell. An eyeball bobs in this yellowish liquid but vanishes when the potion is opened.";
                break;
            case 'Potion of Diminution':
                description="When you drink this potion, you gain the reduce effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion\'s liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process";
                break;
            case 'Potion of Gaseous Form':
                description="When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no concentration required) or until you end the effect as a bonus action. This potion's container seems to hold fog that moves and pours like water";
                price=1000;
                time=25;
                break;
            case 'Potion of Frost Giant Strength':
                description="When you drink this potion, your Strength score changes to 23 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Stone Giant Strength':
                description="When you drink this potion, your Strength score changes to 23 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Fire Giant Strength':
                description="When you drink this potion, your Strength score changes to 25 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Cloud Giant Strength':
                description="When you drink this potion, your Strength score changes to 27 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Healing (Superior)':
                potion="Potion of Superior Healing";
                modifiers+=", Damage: 8d4+8,Damage Type: Healing";
                description="You regain 8d4 + 8 hit points when you drink this potion.";
                price=1000;
                time=25;
                break;
            case 'Potion of Heroism':
                description="For 1 hour after drinking it, you gain 10 temporary hit points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no concentration required). This blue potion bubbles and steams as if boiling.";
                price=1000;
                time=25;
                break;
            case 'Potion of Invulnerability':
                description="For 1 minute after you drink this potion, you have resistance to all damage. The potion\'s syrupy liquid looks like liquified iron.";
                price=1000;
                time=25;
                break;
            case 'Potion of Maximum Power':
                description="The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion, instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Control (Beast)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Beast spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Control (Humanoid)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Person spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Reading':
                description="When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13). The potion's dense, purple liquid has an ovoid cloud of pink floating in it.";
                price=1000;
                time=25;
                break;
            case 'Oil of Sharpness':
                description="This clear, gelatinous oil sparkles with tiny, ultrathin silver shards. The oil can coat one slashing or piercing weapon or up to 5 pieces of slashing or piercing ammunition. Applying the oil takes 1 minute. For 1 hour, the coated item is magical and has a +3 bonus to attack and damage rolls.";
                price=10000;
                time=60;
                break;
            case 'Potion of Flying':
                description="When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're in the air when the potion wears off, you fall unless you have some other means of staying aloft. This potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it.";
                price=10000;
                time=60;
                break;
            case 'Potion of Healing (Supreme)':
                potion="Potion of Supreme Healing";
                modifiers+=", Damage: 10d4+20,Damage Type: Healing";
                description="You regain 10d4 + 20 hit points when you drink this potion.";
                price=10000;
                time=60;
                break;
            case 'Potion of Invisibility':
                description="This potion's container looks empty but feels as though it holds liquid. When you drink it, you become invisible for 1 hour. Anything you wear or carry is invisible with you. The effect ends early if you attack or cast a spell.";
                price=10000;
                time=60;
                break;
            case 'Potion of Longevity':
                description="When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a potion of longevity, there is a 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid are a scorpion\'s tail, an adder's fang, a dead spider, and a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened.";
                price=10000;
                time=60;
                break;
            case 'Potion of Mind Control (Monster)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Monster spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=10000;
                time=60;
                break;
            case 'Potion of Possibility':
                description="When you drink this clear potion, you gain two Fragments of Possibility, each of which looks like a Tiny, grayish bead of energy that follows you around, staying within 1 foot of you at all times. Each fragment lasts for 8 hours or until used.<br><br> When you make an attack roll, an ability check, or a saving throw, you can expend your fragment to roll an additional d20 and choose which of the d20s to use. Alternatively, when an attack roll is made against you, you can expend your fragment to roll a d20 and choose which of the d20s to use, the one you rolled or the one the attacker rolled.<br><br> If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll.<br><br> While you have one or more Fragments of Possibility from this potion, you can\'t gain another Fragment of Possibility from any source.";
                price=10000;
                time=60;
                break;
            case 'Potion of Speed':
                description="When you drink this potion, you gain the effect of the Haste spell for 1 minute (no concentration required). The potion\'s yellow fluid is streaked with black and swirls on its own.";
                price=10000;
                time=60;
                break;
            case 'Potion of Vitality':
                description="When you drink this potion, it removes any exhaustion you are suffering and cures any disease or poison affecting you. For the next 24 hours, you regain the maximum number of hit points for any Hit Die you spend. The potion\'s crimson liquid regularly pulses with dull light, calling to mind a heartbeat.";
                price=10000;
                time=60;
                break;
            case 'Potion of Dragon\'s Majesty':
                description="This potion looks like liquid gold, with a single scale from a chromatic, gem, or metallic dragon suspended in it. When you drink this potion, you transform into an adult dragon of the same kind as the dragon the scale came from. The transformation lasts for 1 hour. Any equipment you are wearing or carrying melds into your new form or falls to the ground (your choice). For the duration, you use the game statistics of the adult dragon instead of your own, but you retain your languages, personality, and memories. You can\’t use a dragon\’s Change Shape or its legendary or lair actions.";
                price=50000;
                time=125;
                break;
            case 'Potion of Storm Giant Strength':
                description="When you drink this potion, your Strength score changes to 29 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=50000;
                time=125;
                break;
        }
        let cur=gold.get('current');
        cur=Number(cur)-price;
        gold.set('current',cur);
        char.get("gmnotes",function(gmnotes) {
            let ntime=Number(gmnotes.replace(' Days',''));
            ntime-=time;
            let notes="";
            if (ntime>0) {
                if (ntime>1) {
                    notes+=String(time)+" Days";
                } else {
                    notes+=String(time)+" Day";
                }
            }
            char.set("gmnotes",notes);
            return;
        });
        let inventory=findObjs({
            _type: 'attribute',
            _characterid: charid
        });
        let row=-1;
        let itemid;
        let rownum;
        let count;
        _.each(inventory,function(object) {
            let name = object.get('_name');
            if (name.includes('repeating_inventory')) {
                if (name.includes('_itemname')) {
                    row+=1;
                    if (object.get('current')==potion) {
                        let test=name.replace("repeating_inventory_","");
                        test=test.replace("_itemname","");
                        itemid=test;
                        rownum=row;
                    }
                }
            }
        });
        _.each(inventory,function(object) {
            let name=object.get('_name');
            if (name.includes('_itemcount')) {
                let test=name.replace("repeating_inventory_","");
                test=test.replace("_itemcount","");
                if (test==itemid) {
                    count=object.get('current');
                }
            }
        });
        if (itemid) {
            if (count) {
                amount=Number(amount)+Number(count);
            }
            sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_"+itemid+"_itemcount|"+amount);
        } else {
            sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_-CREATE_itemname|"+potion+" --repeating_inventory_-CREATE_itemcount|"+amount+" --repeating_inventory_-CREATE_itemcontent|"+description+" --repeating_inventory_-CREATE_itemmodifiers|"+modifiers+" --repeating_inventory_-CREATE_itemweight|0");
            if (potion=="Potion of Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|2d4+2 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Greater Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|4d4+4 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Poison") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|3d6 --repeating_attack_-CREATE_dmgtype|Poison --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Constitution --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|Damage reduced by 1d6");
            } else if (potion=="Potion of Superior Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|8d4+8 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Supreme Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|10d4+20 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Fire Breath") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Fire Breath --repeating_attack_-CREATE_dmgbase|4d6 --repeating_attack_-CREATE_dmgtype|Fire --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Dexterity --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|Half Damage");
            } else if (potion=="Potion of Mind Control (Beast)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Beast --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Control (Humanoid)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Person --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Control (Monster)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Monster --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Reading") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Detect Thoughts --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|No effect");
            }
        }
    },
    
    craftmenu = function(charid,type,rarity,amount,msg) {
        let itemlist;
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let price;
        let neededtime;
        type=type.replace("type ","");
        charid=charid.replace("charid ","");
        rarity=rarity.replace("rarity ","");
        amount=Number(amount.replace("amount ",""));
        switch (rarity) {
            case 'Common':
                price=50;
                neededtime=5;
                return;
            case 'Uncommon':
                price=200;
                neededtime=10;
                return;
            case 'Rare':
                price=2000;
                neededtime=50;
                return;
            case 'Very Rare':
                price=20000;
                neededtime=125;
                return;
            case 'Legendary':
                price=100000;
                return;
        }
        if (type=="Weapon") {
            itemlist=[];
        } else if (type=="Armor") {
            itemlist=[];
        } else if (type=="Accessoires") {
            itemlist=[];
        } else if (type=="Scroll") {
            price=Math.floor(price/2);
            neededtime=Math.floor(price/2);
        }
        let list=String(itemlist);
        for (let i=0;i<itemlist.length;i++) {
            list=list.replace(",","|");
        }
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        char.get("gmnotes",function(gmnotes) {
            let time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
            if (time<neededtime) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let gold=findObjs({
                    _type: 'attribute',
                    _characterid: charid,
                    _name: 'gp'
                }, {caseInsensitive: true})[0]
                let cur=gold.get('current');
                if (cur<price) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
                } else {
                    let test=false;
                    for (let i=0;i<itemlist.length;i++) {
                        if (itemlist[i]==state.down.now.item) {
                            test=true;
                        }
                    }
                    if (test==false) {
                        state.down.now.item="";
                    }
                    sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Crafting</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<div style="text-align:center;">' + "Available " + type + "s" + //--
                        '<table>' + //--
                        '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary}' + ' --amount ' + amount + '">' + rarity + '</a></td></tr>' + //--
                        '<tr><td>Item Type: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll} --rarity ' + rarity + ' --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                        '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                        '<tr><td>Item: </td><td><a ' + astyle1 + '" href="!setitem --item ?{Item?|' + list + '} --charid ' + charid + '--type ' + type + ' --rarity ' + rarity + ' --amount ' + amount + '">' + state.down.now.item + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!craft --charid ' + charid + ' --item ' + state.down.now.item + ' --amount ' + amount + '">Craft Item</a></div>' + //--
                        '</div>'
                    );
                }
            }
        })
    },
    
    craft = function(charid,item,amount,msg) {
        charid=charid.replace("charid ","");
        item=item.replace("item ","");
        amount=Number(amount.replace("amount ",""));
    },
    
    work = function(charid,type,amount,msg) {
        type=type.replace("skill ","");
        type=type.replace(" ","_");
        type=type.replace(" ","_");
        type=type.toLowerCase();
        type=type+"_bonus";
        amount=amount.replace("time ","");
        charid=charid.replace("charid ","");
        let char=findObjs({ 
            _type: 'character', 
            _id: charid
        }, {caseInsensitive: true})[0];
        if (char) {
            let attr=getAttrByName(charid,type)
            var gp=0;
            for (let i=0;i<Number(amount);i++) {
                gp+=randomInteger(20)+Number(attr);
            }
            char.get("gmnotes",function(gmnotes) {
                let time;
                time=gmnotes.replace(" Days","");
                
                if (!(Number(time)<amount)) {
                    time=Number(time)-amount;
                }
                let nnotes="";
                if (time && time!=0) {
                    nnotes+=String(time)+" Days";
                }
                char.set("gmnotes",nnotes);
            });
            var gold=findObjs({
                _type: 'attribute',
                _characterid: charid,
                _name: "gp"
            }, {caseInsensitive: true})[0];
            var cur=Number(gold.get('current'));
            sendChat("Downtime","/w "+msg.who+" You worked for "+amount+" Days and gained "+gp+" GP!");
            gp+=cur;
            gold.set('current',gp);
        }
    },
    
    crimemenu = function(charid,type,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let speakingName = msg.who;
        let dc=state.down.now.dc;
        type=type.replace("type ","");
        charid=charid.replace("charid ","");
        var amount=7;
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        let mod;
        let type1;
        if (type=='Thieves\' Tools') {
            mod=Number(getAttrByName(charid,"dexterity_mod"));
            mod+=Number(getAttrByName(charid,"pb"));
        } else {
            type1=type.toLowerCase();
            type1=type+"_bonus";
            mod=Number(getAttrByName(charid,type1));
        }
        if (state.down.now.crimeval>=1000) {
            state.down.now.dc=25;
        } else if (state.down.now.crimeval>=200) {
            state.down.now.dc=20;
        } else if (state.down.now.crimeval>=100) {
            state.down.now.dc=15;
        } else if (state.down.now.crimeval>0) {
            state.down.now.dc=10;
        }
        sendChat("Downtime","/w " + msg.who + " <div " + divstyle + ">" + //--
            '<div ' + headstyle + '>Crime</div>' + //--
            '<div ' + substyle + '>Menu</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            'DC: ' + state.down.now.dc + //--
            '<br>' + //--
            '<table>' + //--
            '<tr><td>Skill/Tool: </td><td><a ' + astyle1 + '" href="!crime --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">' + type + '</a></td></tr>' + //--
            '<tr><td>Time used: </td><td>' + amount + ' Days</td></tr>' + //--
            '<tr><td>Targetted Value: </td><td><a ' + astyle1 + '" href="!setvalue --amount ?{Amount?|1} --' + type + '">' + state.down.now.crimeval + ' GP</a></td></tr>' + //-- 
            '</table>' + //--
            '<br>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!commit --type ' + type1 + ' --amount ' + amount + '">Commit Crime</a></div>' + //--
            '</div>'
        );
    },
    
    crime = function(charid,type,msg) {
        type=type.replace("type ","");
        charid=charid.replace("charid ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        var gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: "gp"
        }, {caseInsensitive: true})[0];
        var cur=Number(gold.get('current'));
        char.get("gmnotes",function(gmnotes){
            let ntime=Number(gmnotes.replace(" Days",""));
            if (ntime<7) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let cur=gold.get('current');
                if (cur<25) {
                    sendChat("Downtime","/w " + msg.who + " You don\'t have enough GP to do that!");
                } else {
                    let notes="";
                    ntime-=7;
                    if (ntime>0) {
                        notes+=String(ntime)+" Days";
                    }
                    char.set("gmnotes",notes);
                    cur-=25;
                    gold.set('current',cur);
                    var bonus=Number(getAttrByName(charid,type));
                    var passnum=0;
                    for (let j=1;j<=3;j++) {
                        var check=randomInteger(20)+bonus;
                        if (check>Number(state.down.now.dc)) {
                            passnum+=1;
                            sendChat("Downtime","/w gm Check "+j+" passed!");
                        } else {
                            sendChat("Downtime","/w gm Check "+j+" failed!");
                        }
                    }
                    gold=findObjs({
                        _type: 'attribute',
                        _characterid: charid,
                        _name: "gp"
                    }, {caseInsensitive: true})[0];
                    if (passnum==0) {
                        var weeknum=Math.floor(state.down.now.crimeval/25);
                        sendChat("Downtime","/w "+msg.who+" The Heist fails and you are caught, forced to pay a fine of " + state.down.now.crimeval + " GP and are locked into Jail for "+weeknum+" Weeks");
                        if ((cur-Number(state.down.now.crimeval))<0) {
                            cur=0;
                            gold.set('current',0);
                        } else {
                            cur-=Number(state.down.now.crimeval);
                            gold.set('current',cur);
                        }
                        let days=Number(weeknum*7);
                        char=findObjs({
                            _type: 'character',
                            name: msg.who
                        }, {caseInsensitive: true})[0];
                        char.get("gmnotes",function(gmnotes) {
                            let time;
                            time=gmnotes.replace(" Days","");
                            time=Number(time);
                            let notes="";
                            if (time<days) {
                                let newdays=Number(days-time);
                                notes="Must spend "+String(newdays)+" Days in Jail.";
                            } else {
                                time-=days;
                                if (time!==0) {
                                    notes=String(time)+" Days";
                                }
                            }
                            char.set("gmnotes",notes);
                        });
                    } else if (passnum==1) {
                        sendChat("Downtime","/w "+msg.who+" You fail the Heist but manage to get away.");
                    } else if (passnum==2) {
                        let crimeval=Number(state.down.now.crimeval)/2;
                        sendChat("Downtime","/w "+msg.who+" You manage to pull off the Heist but could only get away with "+crimeval+" GP.");
                        cur+=crimeval;
                        gold.set('current',cur);
                    } else if (passnum==3) {
                        let crimeval=Number(state.down.now.crimeval);
                        sendChat("Downtime","/w "+msg.who+" You pull off the Heist successfully and gain "+crimeval+" GP.");
                        cur+=crimeval;
                        gold.set('current',cur);
                    }
                }
            }
        });
    },
    
    trainmenu = function(charid,type,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        charid=charid.replace("charid ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        type=type.replace("type ","");
        let list;
        switch (type) {
            case 'Tool':
                list="Alchemist\'s Supplies,Brewer\'s Supplies,Calligrapher\'s Supplies,Carpenter\'s Tools,Cartographer\'s Tools,Cobbler\'s Tools,Cook\'s Utensils,Glasblower\'s Tools,Jeweler\'s Tools,Leatherworker\'s Tools,Mason\'s Tools,Painter\'s Supplies,Potter\'s Tools,Smith\'s Tools,Tinker\'s Tools,Weaver\'s Tools,Woodcarver\'s Tools,Disguise Kit,Forgery Kit,Dice Set,Dragonchess set,Playing Card Set,Three-Dragon Ante Set,Herbalism Kit,Bagpipes,Drum,Dulcimer,Flute,Lute,Lyre,Horn,Pan Flute,Shawm,Viol,Navigator\'s Tools,Poisoner\'s Kit,Thieves\' Tools,Land Vehicles,Water Vehicles";
                break;
            case 'Language':
                list="Common,Dwarvish,Elvish,Giant,Gnomish,Goblin,Halfling,Orc,Abyssal,Celestial,Draconic,Deep Speech,Infernal,Primordial,Sylvan,Undercommon";
                break;
        }
        list=list.split(',');
        let attribute = findObjs({
            _type: 'attribute',
            _characterid: charid
        }, {caseInsensitive: true});
        let count=0;
        let attrlist=[];
        if (type=="Tool") {
            _.each(attribute,function(attr) {
                let attrname = attr.get('_name');
                if (attrname.includes('repeating_tool') && attrname.includes('_toolname')) {
                    for (let i=0;i<list.length;i++) {
                        if (list[i]==attr.get('current')) {
                            attrlist[count]=list[i];
                            count+=1;
                        }
                    }
                }
            });
            for (let i=0;i<list.length;i++) {
                for (let j=0;j<attrlist.length;j++) {
                    if (list[i]==attrlist[j]) {
                        list[i]="";
                    }
                }
            }
            list=String(list);
            for (let i=0;i<37;i++) {
                list=list.replace(",,",",");
            }
            list=list.split(',');
        } else {
            _.each(attribute,function(attr) {
                let attrname = attr.get('_name');
                if (attrname.includes('repeating_traits') && attrname.includes('_name')) {
                    for (let i=0;i<list.length;i++) {
                        if (list[i]==attr.get('current')) {
                            attrlist[count]=list[i];
                            count+=1;
                        }
                    }
                }
            });
            for (let i=0;i<list.length;i++) {
                for (let j=0;j<attrlist.length;j++) {
                    if (list[i]==attrlist[j]) {
                        list[i]="";
                    }
                }
            }
            list=String(list);
            for (let i=0;i<37;i++) {
                list=list.replace(",,",",");
            }
            list=list.split(',');
        }
        let mintime=50;
        let cost=25*5;
        list=String(list);
        for (let i=0;i<37;i++) {
            list=list.replace(',','|');
        }
        log(list);
        let player = findObjs({
            _type: 'player',
            _id: msg.playerid
        })[0];
        let playerName = player.get('_displayname');
        char.get('gmnotes',function(gmnotes) {
            let time=gmnotes.replace(" Days","");
            if (Number(time)<mintime) {
                sendChat("Downtime","/w " + playerName + " You do not have enough time left to train.");
            } else {
                if (type=="Tool") {
                    sendChat("Downtime","/w " + playerName + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Training</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<div style="text-align:center;">Tools</div>' + //--
                        '<table>' + //--
                        '<tr><td>Available Downtime: </td><td>' + gmnotes + '</td></tr>' + //--
                        '<tr><td>Needed Downtime: </td><td>' + mintime + ' Days</td></tr>' + //--
                        '</table>' + //--
                        '<td><tr>Current Tool: </td><td><a ' + astyle1 + '" href="!settrain --?{Tool?|' + list + '}">' + state.down.now.train + '</a></td></tr>' + //--
                        '<br><br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!train --' + type + ' --' + state.down.now.train + '">Train now</a></div>' + //--
                        '</div>'
                    );
                } else {
                    let test=false;
                    _.each(list, function(item) {
                        if (String(state.down.now.train).includes(item)) {
                            test=true;
                        }
                    });
                    if (test==false) {
                        state.down.now.train="";
                    }
                    sendChat("Downtime","/w " + playerName + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Training</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<div style="text-align:center;">Languages</div>' + //--
                        '<br>' + //--
                        '<table>' + //--
                        '<tr><td>Available Downtime: </td><td>' + gmnotes + '</td></tr>' + //--
                        '<tr><td>Needed Downtime: </td><td>' + mintime + ' Days</td></tr>' + //--
                        '<td><tr>Current Tool: </td><td><a ' + astyle1 + '" href="!settrain --?{Language?|' + list + '}">' + state.down.now.train + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!train --' + type + ' --' + state.down.now.train + '">Train now</a></div>' + //--
                        '</div>'
                    );
                }
            }
        });
    },
    
    train = function(charid,type,name,msg) {
        charid=charid.replace("charid ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        type=type.replace(" ","");
        if (type=="Tool") {
            let attributes = findObjs({
                _type: 'attribute',
                _characterid: charid
            });
            let count=0;
            _.each(attributes,function(attr) {
                let attrname = attr.get('_name');
                if (attrname.includes('repeating_tool') && attrname.includes('_toolname')) {
                    count+=1;
                }
            });
            char.get('gmnotes',function(gmnotes) {
                let num=Number(gmnotes.replace(' Days',''));
                num-=50;
                let notes=String(num)+" Days";
                char.set('gmnotes',notes);
            });
            sendChat("Downtime",'!setattr --charid '+charid+' --repeating_tool_-CREATE_toolname|'+name);
            sendChat("Downtime",'!setattr --charid '+charid+' --repeating_tool_$'+count+'_toolattr|QUERY');
        } else {
            char.get('gmnotes',function(gmnotes) {
                let num=Number(gmnotes.replace(' Days',''));
                num-=50;
                let notes=String(num)+" Days";
                char.set('gmnotes',notes);
            });
            sendChat("Downtime",'!setattr --charid '+charid+' --repeating_proficiencies_-CREATE_name|'+name);
        }
    }, 
    
    checkInstall = function() {
        if (!state.down) {
            setDefaults();
        }
    },
    
    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());
on('ready', function(){
    Downtime.CheckInstall();
    Downtime.RegisterEventHandlers();
});