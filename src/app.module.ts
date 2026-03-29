import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { CliModule } from './cli/cli.module';
import { HttpModule } from './http/http.module';


@Module({
  imports: [DatabaseModule, CliModule, HttpModule],
})
export class AppModule {}
