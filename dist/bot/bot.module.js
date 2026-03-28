"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotModule = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const discord_js_1 = require("discord.js");
const config_1 = require("@nestjs/config");
const database_module_1 = require("../database/database.module");
const cache_module_1 = require("../cache/cache.module");
const leveling_module_1 = require("../leveling/leveling.module");
const economy_module_1 = require("../economy/economy.module");
const vip_module_1 = require("../vip/vip.module");
const badges_module_1 = require("../badges/badges.module");
const seasonal_module_1 = require("../seasonal/seasonal.module");
const utils_module_1 = require("../utils/utils.module");
const commands_module_1 = require("./commands/commands.module");
let BotModule = class BotModule {
};
exports.BotModule = BotModule;
exports.BotModule = BotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            necord_1.NecordModule.forRootAsync({
                useFactory: (configService) => {
                    const token = configService.get('DISCORD_TOKEN');
                    if (!token) {
                        throw new Error('DISCORD_TOKEN is not set');
                    }
                    return {
                        token,
                        intents: [
                            discord_js_1.IntentsBitField.Flags.Guilds,
                            discord_js_1.IntentsBitField.Flags.GuildMembers,
                            discord_js_1.IntentsBitField.Flags.GuildMessages,
                            discord_js_1.IntentsBitField.Flags.DirectMessages,
                            discord_js_1.IntentsBitField.Flags.MessageContent,
                            discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
                        ],
                        prefix: configService.get('PREFIX') || '!',
                    };
                },
                inject: [config_1.ConfigService],
            }),
            database_module_1.DatabaseModule,
            cache_module_1.CacheModule,
            leveling_module_1.LevelingModule,
            economy_module_1.EconomyModule,
            vip_module_1.VipModule,
            badges_module_1.BadgesModule,
            seasonal_module_1.SeasonalModule,
            utils_module_1.UtilsModule,
            commands_module_1.CommandsModule,
        ],
        controllers: [],
        providers: [],
    })
], BotModule);
//# sourceMappingURL=bot.module.js.map