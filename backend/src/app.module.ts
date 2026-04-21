import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { FinancialService } from './financial/financial.service';
import { FinancialController } from './financial/financial.controller';
import { ReportsService } from './reports/reports.service';
import { OperationsService } from './common/operations.service';
import { OperationsController } from './common/operations.controller';
import { ManagementService } from './common/management.service';
import { ManagementController } from './common/management.controller';
import { UnitsController } from './common/units.controller';
import { UnitsService } from './common/units.service'; // <--- Añadido
import { AutomationService } from './automations/automation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
  ],
  controllers: [
    AppController, 
    FinancialController, 
    OperationsController, 
    ManagementController,
    UnitsController
  ],
  providers: [
    AppService, 
    PrismaService, 
    FinancialService, 
    ReportsService, 
    OperationsService, 
    ManagementService,
    UnitsService, // <--- Añadido
    AutomationService
  ],
})
export class AppModule {}
