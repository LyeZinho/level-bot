import { LevelingService } from '../leveling/leveling.service';
export declare class LevelRecalcWorker {
    private levelingService;
    private readonly logger;
    constructor(levelingService: LevelingService);
    handleLevelRecalculation(): Promise<void>;
}
//# sourceMappingURL=level-recalc.worker.d.ts.map