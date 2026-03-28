import { VipService } from '../vip/vip.service';
export declare class VipExpirationWorker {
    private vipService;
    private readonly logger;
    constructor(vipService: VipService);
    handleVipExpiration(): Promise<void>;
}
//# sourceMappingURL=vip-expiration.worker.d.ts.map