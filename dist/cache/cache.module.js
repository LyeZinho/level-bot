"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_redis_yet_1 = __importDefault(require("cache-manager-redis-yet"));
const cache_service_1 = require("./cache.service");
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    store: cache_manager_redis_yet_1.default,
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                    password: configService.get('REDIS_PASSWORD') || undefined,
                    ttl: 3600,
                }),
            }),
        ],
        providers: [cache_service_1.CacheService],
        exports: [cache_service_1.CacheService],
    })
], CacheModule);
//# sourceMappingURL=cache.module.js.map