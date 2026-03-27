import { Module } from '@nestjs/common';
import { EmbedGeneratorService } from './embed.generator';
import { SvgGeneratorService } from './svg.generator';
import { ImageService } from './image.service';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [EmbedGeneratorService, SvgGeneratorService, ImageService],
  exports: [EmbedGeneratorService, SvgGeneratorService, ImageService],
})
export class UtilsModule {}
