import { Module } from '@nestjs/common';
import { LevelingModule } from '../../leveling/leveling.module';
import { BadgesModule } from '../../badges/badges.module';
import { UtilsModule } from '../../utils/utils.module';
import { LevelTextCommand } from './level.text-command';
import { RankingTextCommand } from './ranking.text-command';
import { ProfileTextCommand } from './profile.text-command';

@Module({
  imports: [LevelingModule, BadgesModule, UtilsModule],
  providers: [LevelTextCommand, RankingTextCommand, ProfileTextCommand],
})
export class TextCommandsModule {}
