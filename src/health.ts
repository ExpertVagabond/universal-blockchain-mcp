import { executeZetaChainCommand } from './tools.js';
import { Config } from './config.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    zetachainCli: HealthCheck;
    configuration: HealthCheck;
    dependencies: HealthCheck;
  };
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  responseTime?: number;
  lastChecked: string;
}

class HealthMonitor {
  private startTime: number;
  private lastHealthCheck: HealthStatus | null = null;

  constructor() {
    this.startTime = Date.now();
  }

  async performHealthCheck(config: Config): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const checks = await this.runHealthChecks(config);
    
    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail').length;
    const warnChecks = Object.values(checks).filter(check => check.status === 'warn').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks > 0) {
      status = 'unhealthy';
    } else if (warnChecks > 0) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp,
      version: '1.0.0',
      checks,
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage()
    };

    this.lastHealthCheck = healthStatus;
    return healthStatus;
  }

  private async runHealthChecks(config: Config): Promise<HealthStatus['checks']> {
    const checks: HealthStatus['checks'] = {
      zetachainCli: await this.checkZetaChainCli(),
      configuration: this.checkConfiguration(config),
      dependencies: this.checkDependencies()
    };

    return checks;
  }

  private async checkZetaChainCli(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await executeZetaChainCommand('--version');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'pass',
        message: 'ZetaChain CLI is accessible and responsive',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'fail',
        message: `ZetaChain CLI check failed: ${error.message}`,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private checkConfiguration(config: Config): HealthCheck {
    try {
      // Validate configuration completeness
      if (!config.network) {
        return {
          status: 'fail',
          message: 'Network configuration is missing',
          lastChecked: new Date().toISOString()
        };
      }

      if (config.network !== 'testnet' && config.network !== 'mainnet') {
        return {
          status: 'warn',
          message: `Unusual network configuration: ${config.network}`,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: 'pass',
        message: 'Configuration is valid',
        lastChecked: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: `Configuration validation failed: ${error.message}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private checkDependencies(): HealthCheck {
    try {
      // Check critical dependencies
      const criticalDeps = [
        '@modelcontextprotocol/sdk',
        'zetachain',
        'zod'
      ];

      for (const dep of criticalDeps) {
        try {
          require.resolve(dep);
        } catch {
          return {
            status: 'fail',
            message: `Critical dependency missing: ${dep}`,
            lastChecked: new Date().toISOString()
          };
        }
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;
      
      if (memUsageMB > 500) {
        return {
          status: 'warn',
          message: `High memory usage: ${memUsageMB.toFixed(2)}MB`,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: 'pass',
        message: 'All dependencies are available and memory usage is normal',
        lastChecked: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: `Dependency check failed: ${error.message}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}

export const healthMonitor = new HealthMonitor();