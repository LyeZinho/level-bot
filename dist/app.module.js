"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config/config.module");
const database_module_1 = require("./database/database.module");
const cache_module_1 = require("./cache/cache.module");
const leveling_module_1 = require("./leveling/leveling.module");
const economy_module_1 = require("./economy/economy.module");
const vip_module_1 = require("./vip/vip.module");
const badges_module_1 = require("./badges/badges.module");
const seasonal_module_1 = require("./seasonal/seasonal.module");
const utils_module_1 = require("./utils/utils.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, database_module_1.DatabaseModule, cache_module_1.CacheModule, leveling_module_1.LevelingModule, economy_module_1.EconomyModule, vip_module_1.VipModule, badges_module_1.BadgesModule, seasonal_module_1.SeasonalModule, utils_module_1.UtilsModule],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map