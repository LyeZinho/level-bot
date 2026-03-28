"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsModule = void 0;
const common_1 = require("@nestjs/common");
const leveling_module_1 = require("../../leveling/leveling.module");
const economy_module_1 = require("../../economy/economy.module");
const badges_module_1 = require("../../badges/badges.module");
const utils_module_1 = require("../../utils/utils.module");
const level_command_1 = require("./level.command");
const ranking_command_1 = require("./ranking.command");
const profile_command_1 = require("./profile.command");
const coins_command_1 = require("./coins.command");
let CommandsModule = class CommandsModule {
};
exports.CommandsModule = CommandsModule;
exports.CommandsModule = CommandsModule = __decorate([
    (0, common_1.Module)({
        imports: [leveling_module_1.LevelingModule, economy_module_1.EconomyModule, badges_module_1.BadgesModule, utils_module_1.UtilsModule],
        providers: [level_command_1.LevelCommand, ranking_command_1.RankingCommand, profile_command_1.ProfileCommand, coins_command_1.CoinsCommand],
    })
], CommandsModule);
//# sourceMappingURL=commands.module.js.map