import { Module } from '@nestjs/common';
import { LevelingModule } from '../../leveling/leveling.module';
import { UtilsModule } from '../../utils/utils.module';
import { LevelCommand } from './level.command';

@Module({
  imports: [LevelingModule, UtilsModule],
  providers: [LevelCommand],
})
export class CommandsModule {}
