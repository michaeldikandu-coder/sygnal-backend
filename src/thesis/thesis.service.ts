import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThesisDto } from './dto/create-thesis.dto';
import axios from 'axios';

@Injectable()
export class ThesisService {
  constructor(private prisma: PrismaService) {}

  async createThesis(signalId: string, createThesisDto: CreateThesisDto) {
    const { url } = createThesisDto;

    // Verify signal exists
    const signal = await this.prisma.signal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    try {
      // Simple metadata scraping
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      const html = response.data;
      
      // Extract title using regex
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'External Link';
      
      // Extract og:image using regex
      const imageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
      const imageUrl = imageMatch ? imageMatch[1] : null;
      
      const source = this.extractDomain(url);

      // Create thesis record
      const thesis = await this.prisma.thesis.create({
        data: {
          signalId,
          url,
          title: title.substring(0, 200), // Limit title length
          source,
          imageUrl,
        },
      });

      return thesis;
    } catch (error) {
      // If scraping fails, create thesis with basic info
      const source = this.extractDomain(url);
      
      const thesis = await this.prisma.thesis.create({
        data: {
          signalId,
          url,
          title: 'External Link',
          source,
          imageUrl: null,
        },
      });

      return thesis;
    }
  }

  async getSignalThesis(signalId: string) {
    const thesis = await this.prisma.thesis.findMany({
      where: { signalId },
      orderBy: { createdAt: 'desc' },
    });

    return thesis;
  }

  async trackClick(thesisId: string) {
    const thesis = await this.prisma.thesis.findUnique({
      where: { id: thesisId },
    });

    if (!thesis) {
      throw new NotFoundException('Thesis not found');
    }

    // Increment click count
    const updatedThesis = await this.prisma.thesis.update({
      where: { id: thesisId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Click tracked successfully',
      clicks: updatedThesis.clicks,
    };
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'Unknown';
    }
  }
}