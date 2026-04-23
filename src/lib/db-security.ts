import { PrismaClient } from '@prisma/client';
import { sanitizeDbQuery, logSecurityEvent } from './security-enhanced';
import { validator, dbSchemas } from './input-validation';

// Secure database wrapper with input validation and query sanitization
class SecureDatabase {
  private prisma: PrismaClient;
  private queryLog: Array<{ query: string; timestamp: number; duration: number }> = [];

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log all queries for security monitoring
    (this.prisma as any).$on('query', (e: any) => {
      this.queryLog.push({
        query: e.query,
        timestamp: Date.now(),
        duration: e.duration
      });

      // Keep only last 1000 queries
      if (this.queryLog.length > 1000) {
        this.queryLog.shift();
      }

      // Log suspicious queries
      if (this.isSuspiciousQuery(e.query)) {
        console.warn('[DB SECURITY] Suspicious query detected:', e.query);
      }
    });

    (this.prisma as any).$on('error', (e: any) => {
      console.error('[DB SECURITY] Database error:', e);
    });
  }

  private isSuspiciousQuery(query: string): boolean {
    const suspiciousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i,
      /UNION\s+SELECT/i,
      /INSERT\s+INTO.*VALUES.*\(/i,
      /UPDATE.*SET.*WHERE\s+1\s*=\s*1/i,
      /--/,
      /\/\*/,
      /xp_cmdshell/i,
      /sp_executesql/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(query));
  }

  // Secure admin operations
  async findAdminByEmail(email: string) {
    const validation = validator.validateEmail(email);
    if (!validation.isValid) {
      throw new Error(`Invalid email: ${validation.errors.join(', ')}`);
    }

    return this.prisma.admin.findUnique({
      where: { email: validation.sanitizedValue },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async createAdmin(data: { email: string; passwordHash: string }) {
    const validation = validator.validateObject(data, dbSchemas.admin);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.admin.create({
      data: validation.sanitizedData as any,
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
  }

  // Secure announcement operations
  async createAnnouncement(data: any) {
    const validation = validator.validateObject(data, dbSchemas.announcement);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.announcement.create({
      data: {
        ...validation.sanitizedData,
        date: new Date(validation.sanitizedData.date || Date.now()),
        active: Boolean(validation.sanitizedData.active ?? true)
      } as any
    });
  }

  async updateAnnouncement(id: string, data: any) {
    const idValidation = validator.validateId(id);
    if (!idValidation.isValid) {
      throw new Error('Invalid announcement ID');
    }

    const validation = validator.validateObject(data, dbSchemas.announcement);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.announcement.update({
      where: { id: idValidation.sanitizedValue },
      data: validation.sanitizedData
    });
  }

  async deleteAnnouncement(id: string) {
    const validation = validator.validateId(id);
    if (!validation.isValid) {
      throw new Error('Invalid announcement ID');
    }

    return this.prisma.announcement.delete({
      where: { id: validation.sanitizedValue }
    });
  }

  async getAnnouncements(options: {
    active?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { active = true, category, limit = 50, offset = 0 } = options;

    // Validate inputs
    if (limit > 100) throw new Error('Limit cannot exceed 100');
    if (offset < 0) throw new Error('Offset cannot be negative');
    if (category && !validator.validate('category', category, 'category').isValid) {
      throw new Error('Invalid category');
    }

    const where: any = { active };
    if (category) {
      where.category = category;
    }

    return this.prisma.announcement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        category: true,
        coverImage: true,
        date: true,
        createdAt: true
      }
    });
  }

  // Secure gallery operations
  async createGalleryCategory(data: any) {
    const validation = validator.validateObject(data, dbSchemas.galleryCategory);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.galleryCategory.create({
      data: {
        ...validation.sanitizedData,
        active: Boolean(validation.sanitizedData.active ?? true),
        order: parseInt(validation.sanitizedData.order) || 0
      } as any
    });
  }

  async createGalleryItem(data: any) {
    const validation = validator.validateObject(data, dbSchemas.galleryItem);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.galleryItem.create({
      data: {
        ...validation.sanitizedData,
        order: parseInt(validation.sanitizedData.order) || 0
      } as any
    });
  }

  async getGalleryCategories(activeOnly: boolean = true) {
    return this.prisma.galleryCategory.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          take: 10 // Limit items per category for performance
        }
      }
    });
  }

  // Secure resource operations
  async createResource(data: any) {
    const validation = validator.validateObject(data, dbSchemas.resource);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.resource.create({
      data: {
        ...validation.sanitizedData,
        order: parseInt(validation.sanitizedData.order) || 0
      } as any
    });
  }

  async getResources(limit: number = 50) {
    if (limit > 100) throw new Error('Limit cannot exceed 100');

    return this.prisma.resource.findMany({
      orderBy: { order: 'asc' },
      take: limit
    });
  }

  // Secure testimony operations
  async createTestimony(data: any) {
    const validation = validator.validateObject(data, dbSchemas.testimony);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.testimony.create({
      data: {
        ...validation.sanitizedData,
        active: Boolean(validation.sanitizedData.active ?? true),
        order: parseInt(validation.sanitizedData.order) || 0
      } as any
    });
  }

  async getTestimonies(activeOnly: boolean = true, limit: number = 20) {
    if (limit > 50) throw new Error('Limit cannot exceed 50');

    return this.prisma.testimony.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { order: 'asc' },
      take: limit
    });
  }

  // Secure contribution operations
  async createContribution(data: any) {
    const validation = validator.validateObject(data, dbSchemas.contribution);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.contribution.create({
      data: {
        ...validation.sanitizedData,
        status: 'pending' // Always start as pending
      } as any
    });
  }

  async getContributions(options: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { type, status = 'pending', limit = 50, offset = 0 } = options;

    if (limit > 100) throw new Error('Limit cannot exceed 100');
    if (offset < 0) throw new Error('Offset cannot be negative');

    const where: any = { status };
    if (type) {
      const typeValidation = validator.validate('type', type, 'category');
      if (!typeValidation.isValid) {
        throw new Error('Invalid contribution type');
      }
      where.type = typeValidation.sanitizedValue;
    }

    return this.prisma.contribution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  // Secure archive operations
  async createArchiveDocument(data: any) {
    const validation = validator.validateObject(data, dbSchemas.archiveDocument);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    return this.prisma.archiveDocument.create({
      data: validation.sanitizedData as any
    });
  }

  async getArchiveDocuments(category?: string, limit: number = 50) {
    if (limit > 100) throw new Error('Limit cannot exceed 100');

    const where: any = {};
    if (category) {
      // Validate enum value
      const validCategories = ['PASTORAL_LETTERS', 'CIRCULARS', 'OTHERS'];
      if (!validCategories.includes(category)) {
        throw new Error('Invalid archive category');
      }
      where.category = category;
    }

    return this.prisma.archiveDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Generic secure operations
  async secureCount(model: string, where: any = {}) {
    const sanitizedWhere = sanitizeDbQuery(where);
    
    switch (model) {
      case 'announcement':
        return this.prisma.announcement.count({ where: sanitizedWhere });
      case 'gallery':
        return this.prisma.gallery.count({ where: sanitizedWhere });
      case 'resource':
        return this.prisma.resource.count({ where: sanitizedWhere });
      case 'testimony':
        return this.prisma.testimony.count({ where: sanitizedWhere });
      case 'contribution':
        return this.prisma.contribution.count({ where: sanitizedWhere });
      case 'archiveDocument':
        return this.prisma.archiveDocument.count({ where: sanitizedWhere });
      default:
        throw new Error('Invalid model for count operation');
    }
  }

  // Transaction wrapper with security
  async secureTransaction<T>(
    callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      try {
        return await callback(tx);
      } catch (error) {
        console.error('[DB SECURITY] Transaction error:', error);
        throw error;
      }
    });
  }

  // Get query statistics for monitoring
  getQueryStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentQueries = this.queryLog.filter(q => now - q.timestamp < oneHour);

    return {
      totalQueries: recentQueries.length,
      averageDuration: recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length || 0,
      slowQueries: recentQueries.filter(q => q.duration > 1000).length,
      suspiciousQueries: recentQueries.filter(q => this.isSuspiciousQuery(q.query)).length
    };
  }

  // Cleanup old data (for maintenance)
  async cleanupOldData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Clean up old contributions that are rejected
    await this.prisma.contribution.deleteMany({
      where: {
        status: 'rejected',
        createdAt: { lt: thirtyDaysAgo }
      }
    });

    console.log('[DB SECURITY] Cleanup completed');
  }

  // Close connection
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Persist singleton on globalThis so it survives Next.js hot-module reloads
// and Hostinger worker restarts without creating extra PrismaClient instances.
declare global {
  // eslint-disable-next-line no-var
  var __kavukattuSecureDbInstance: SecureDatabase | undefined;
}

if (!globalThis.__kavukattuSecureDbInstance) {
  globalThis.__kavukattuSecureDbInstance = new SecureDatabase();
}

export const secureDb: SecureDatabase = globalThis.__kavukattuSecureDbInstance;

// Export the Prisma client for direct access when needed (use carefully)
export { PrismaClient } from '@prisma/client';