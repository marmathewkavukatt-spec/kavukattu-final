import { PrismaClient } from '@prisma/client';
import { productionSecurity } from './security-production';

// Enhanced database security layer
class SecureDatabase {
  private static instance: SecureDatabase;
  private prisma: PrismaClient;
  private queryLog: QueryLog[] = [];
  private slowQueryThreshold = 5000; // 5 seconds

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.setupLogging();
  }

  static getInstance(): SecureDatabase {
    if (!SecureDatabase.instance) {
      SecureDatabase.instance = new SecureDatabase();
    }
    return SecureDatabase.instance;
  }

  private setupLogging() {
    // Type assertion to handle Prisma event types
    (this.prisma as any).$on('query', (e: any) => {
      const log: QueryLog = {
        timestamp: new Date().toISOString(),
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target
      };

      this.queryLog.push(log);

      // Keep only last 1000 queries
      if (this.queryLog.length > 1000) {
        this.queryLog.shift();
      }

      // Log slow queries
      if (e.duration > this.slowQueryThreshold) {
        console.warn(`[DB] Slow query detected (${e.duration}ms):`, e.query);
      }
    });

    (this.prisma as any).$on('error', (e: any) => {
      console.error('[DB] Database error:', e);
    });
  }

  // Secure query wrapper with input sanitization and monitoring
  async secureQuery<T>(
    operation: () => Promise<T>,
    context: QueryContext
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Validate query context
      this.validateQueryContext(context);

      // Execute query with timeout
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise<T>(context.timeout || 30000)
      ]) as T;

      // Log successful query
      const duration = Date.now() - startTime;
      this.logQueryExecution(context, true, duration);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logQueryExecution(context, false, duration, error);
      
      // Re-throw the error
      throw error;
    }
  }

  // Sanitized database operations
  async findMany<T>(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<T[]> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].findMany(sanitizedArgs);
    }, { ...context, operation: 'findMany', model });
  }

  async findUnique<T>(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<T | null> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].findUnique(sanitizedArgs);
    }, { ...context, operation: 'findUnique', model });
  }

  async create<T>(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<T> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].create(sanitizedArgs);
    }, { ...context, operation: 'create', model });
  }

  async update<T>(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<T> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].update(sanitizedArgs);
    }, { ...context, operation: 'update', model });
  }

  async delete<T>(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<T> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].delete(sanitizedArgs);
    }, { ...context, operation: 'delete', model });
  }

  async count(
    model: string,
    args: any,
    context: QueryContext
  ): Promise<number> {
    return this.secureQuery(async () => {
      const sanitizedArgs = this.sanitizeQueryArgs(args);
      return (this.prisma as any)[model].count(sanitizedArgs);
    }, { ...context, operation: 'count', model });
  }

  // Transaction wrapper with security
  async secureTransaction<T>(
    operations: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>,
    context: QueryContext
  ): Promise<T> {
    return this.secureQuery(async () => {
      return this.prisma.$transaction(operations, {
        timeout: context.timeout || 30000,
        maxWait: 5000,
        isolationLevel: 'ReadCommitted'
      });
    }, { ...context, operation: 'transaction' });
  }

  // Raw query with extra security (use sparingly)
  async secureRawQuery<T>(
    query: string,
    params: any[],
    context: QueryContext
  ): Promise<T> {
    return this.secureQuery(async () => {
      // Extra validation for raw queries
      if (this.containsSuspiciousSQL(query)) {
        throw new Error('Suspicious SQL query detected');
      }

      const sanitizedParams = params.map(param => 
        productionSecurity.sanitizeSQLInput(param)
      );

      return this.prisma.$queryRawUnsafe(query, ...sanitizedParams);
    }, { ...context, operation: 'rawQuery', rawQuery: query });
  }

  // Input sanitization
  private sanitizeQueryArgs(args: any): any {
    if (!args) return args;

    // Deep sanitization of query arguments
    return productionSecurity.sanitizeSQLInput(args);
  }

  // Query context validation
  private validateQueryContext(context: QueryContext) {
    if (!context.userId && !context.isSystemOperation) {
      throw new Error('Query context must include userId or be marked as system operation');
    }

    if (context.operation === 'delete' && !context.allowDelete) {
      throw new Error('Delete operations must be explicitly allowed');
    }

    if (context.operation === 'rawQuery' && !context.allowRawQuery) {
      throw new Error('Raw queries must be explicitly allowed');
    }
  }

  // Suspicious SQL detection
  private containsSuspiciousSQL(query: string): boolean {
    const suspiciousPatterns = [
      /\b(DROP|TRUNCATE|ALTER)\s+TABLE\b/i,
      /\bDROP\s+DATABASE\b/i,
      /\bGRANT\b.*\bALL\b/i,
      /\bREVOKE\b/i,
      /\bSHUTDOWN\b/i,
      /\bEXEC\b.*\bxp_/i,
      /\bUNION\b.*\bSELECT\b.*\bFROM\b/i,
      /\bINTO\s+OUTFILE\b/i,
      /\bLOAD_FILE\b/i,
      /\bINTO\s+DUMPFILE\b/i,
      /--.*$/m, // SQL comments
      /\/\*[\s\S]*?\*\//, // Block comments
    ];

    return suspiciousPatterns.some(pattern => pattern.test(query));
  }

  // Timeout promise
  private createTimeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Database operation timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  // Query execution logging
  private logQueryExecution(
    context: QueryContext,
    success: boolean,
    duration: number,
    error?: any
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      operation: context.operation,
      model: context.model,
      success,
      duration,
      error: error?.message,
      ip: context.ip
    };

    // Log to security system
    if (!success) {
      console.error('[DB] Query failed:', logEntry);
    } else if (duration > this.slowQueryThreshold) {
      console.warn('[DB] Slow query:', logEntry);
    }

    // Store in query log
    this.queryLog.push({
      timestamp: logEntry.timestamp,
      query: `${context.operation} on ${context.model}`,
      params: '',
      duration,
      target: context.model || 'unknown'
    });
  }

  // Get query statistics
  getQueryStats(): QueryStats {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentQueries = this.queryLog.filter(log => 
      now - new Date(log.timestamp).getTime() < oneHour
    );

    const totalQueries = recentQueries.length;
    const slowQueries = recentQueries.filter(log => log.duration > this.slowQueryThreshold);
    const avgDuration = totalQueries > 0 
      ? recentQueries.reduce((sum, log) => sum + log.duration, 0) / totalQueries 
      : 0;

    return {
      totalQueries,
      slowQueries: slowQueries.length,
      averageDuration: Math.round(avgDuration),
      slowestQuery: slowQueries.length > 0 
        ? Math.max(...slowQueries.map(q => q.duration))
        : 0,
      queriesPerMinute: Math.round(totalQueries / 60)
    };
  }

  // Get recent query logs
  getRecentQueries(limit: number = 50): QueryLog[] {
    return this.queryLog.slice(-limit);
  }

  // Health check
  async healthCheck(): Promise<DatabaseHealth> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      const stats = this.getQueryStats();

      return {
        status: 'healthy',
        responseTime,
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Cleanup old logs
  cleanupLogs() {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneWeek;
    
    this.queryLog = this.queryLog.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
  }

  // Get Prisma client for direct access (use carefully)
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // Disconnect
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Type definitions
interface QueryContext {
  userId?: string;
  ip?: string;
  operation?: string;
  model?: string;
  timeout?: number;
  isSystemOperation?: boolean;
  allowDelete?: boolean;
  allowRawQuery?: boolean;
  rawQuery?: string;
}

interface QueryLog {
  timestamp: string;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  averageDuration: number;
  slowestQuery: number;
  queriesPerMinute: number;
}

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  stats?: QueryStats;
  error?: string;
  timestamp: string;
}

// Export singleton instance
export const secureDb = SecureDatabase.getInstance();

// Convenience functions for common operations
export async function secureFind<T>(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<T[]> {
  return secureDb.findMany<T>(model, args, { userId, ip });
}

export async function secureFindUnique<T>(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<T | null> {
  return secureDb.findUnique<T>(model, args, { userId, ip });
}

export async function secureCreate<T>(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<T> {
  return secureDb.create<T>(model, args, { userId, ip });
}

export async function secureUpdate<T>(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<T> {
  return secureDb.update<T>(model, args, { userId, ip });
}

export async function secureDelete<T>(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<T> {
  return secureDb.delete<T>(model, args, { 
    userId, 
    ip, 
    allowDelete: true 
  });
}

export async function secureCount(
  model: string,
  args: any,
  userId?: string,
  ip?: string
): Promise<number> {
  return secureDb.count(model, args, { userId, ip });
}