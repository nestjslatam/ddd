import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DddModule } from '@nestjslatam/ddd';
import {
  MemberTable,
  ProjectMemberTable,
  ProjectTable,
  TeamMemberTable,
  TeamTable,
} from './infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: true, // disabled in production
      }),
    }),
    TypeOrmModule.forFeature([
      ProjectTable,
      ProjectMemberTable,
      MemberTable,
      TeamMemberTable,
      TeamTable,
    ]),
    ,
    DddModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
