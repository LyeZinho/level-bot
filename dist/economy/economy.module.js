"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomyModule = void 0;
const common_1 = require("@nestjs/common");
const economy_service_1 = require("./economy.service");
const shop_service_1 = require("./shop.service");
const robux_service_1 = require("./robux.service");
let EconomyModule = class EconomyModule {
};
exports.EconomyModule = EconomyModule;
exports.EconomyModule = EconomyModule = __decorate([
    (0, common_1.Module)({
        providers: [economy_service_1.EconomyService, shop_service_1.ShopService, robux_service_1.RobuxService],
        exports: [economy_service_1.EconomyService, shop_service_1.ShopService, robux_service_1.RobuxService],
    })
], EconomyModule);
//# sourceMappingURL=economy.module.js.map