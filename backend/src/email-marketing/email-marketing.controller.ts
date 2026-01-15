import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmailMarketingService } from './email-marketing.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { SendTestDto } from './dto/send-test.dto';

@ApiTags('email-marketing')
@Controller('email-marketing')
export class EmailMarketingController {
  constructor(private readonly svc: EmailMarketingService) {}

  // --- Public: unsubscribe ---
  @Get('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe (public)' })
  async unsubscribe(@Query('e') email: string, @Query('t') token: string) {
    return this.svc.unsubscribe(email, token);
  }

  // --- Admin: subscribers ---
  @Get('admin/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List newsletter subscribers (Admin)' })
  async listSubscribers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listSubscribers({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('admin/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add/subscribe an email (Admin)' })
  async upsertSubscriber(@Body() dto: CreateSubscriberDto) {
    return this.svc.upsertSubscriber(dto, 'ADMIN');
  }

  @Patch('admin/subscribers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscriber (Admin)' })
  async updateSubscriber(@Param('id') id: string, @Body() dto: UpdateSubscriberDto) {
    return this.svc.updateSubscriber(id, dto);
  }

  // --- Admin: campaigns ---
  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns (Admin)' })
  async listCampaigns(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listCampaigns({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign (Admin)' })
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return this.svc.createCampaign(dto);
  }

  @Get('admin/campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign (Admin)' })
  async getCampaign(@Param('id') id: string) {
    return this.svc.getCampaign(id);
  }

  @Patch('admin/campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign (Admin)' })
  async updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.svc.updateCampaign(id, dto);
  }

  @Post('admin/campaigns/:id/send-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test email (Admin)' })
  async sendTest(@Param('id') id: string, @Body() dto: SendTestDto) {
    return this.svc.sendTest(id, dto.to);
  }

  @Post('admin/campaigns/:id/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Start sending campaign to subscribers (Admin)' })
  async sendCampaign(@Param('id') id: string) {
    return this.svc.startSendCampaign(id);
  }
}

