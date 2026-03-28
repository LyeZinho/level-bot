"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextCommandsModule = void 0;
const common_1 = require("@nestjs/common");
const leveling_module_1 = require("../../leveling/leveling.module");
const badges_module_1 = require("../../badges/badges.module");
const utils_module_1 = require("../../utils/utils.module");
const level_text_command_1 = require("./level.text-command");
const ranking_text_command_1 = require("./ranking.text-command");
const profile_text_command_1 = require("./profile.text-command");
let TextCommandsModule = class TextCommandsModule {
};
exports.TextCommandsModule = TextCommandsModule;
exports.TextCommandsModule = TextCommandsModule = __decorate([
    (0, common_1.Module)({
        imports: [leveling_module_1.LevelingModule, badges_module_1.BadgesModule, utils_module_1.UtilsModule],
        providers: [level_text_command_1.LevelTextCommand, ranking_text_command_1.RankingTextCommand, profile_text_command_1.ProfileTextCommand],
    })
], TextCommandsModule);
//# sourceMappingURL=text-commands.module.js.map