import { Cache } from 'cache-manager';
export declare class CacheService {
    private cacheManager;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
//# sourceMappingURL=cache.service.d.ts.map