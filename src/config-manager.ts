import { z } from 'zod';
import { configSchema, Config, defaultConfig } from './config.js';
import { logger } from './logger.js';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface ConfigValidationResult {
  valid: boolean;
  config?: Config;
  errors?: string[];
  warnings?: string[];
}

export class ConfigManager {
  private currentConfig: Config;
  private configPath?: string;
  private watchers: Array<(config: Config) => void> = [];

  constructor(initialConfig: Config = defaultConfig) {
    this.currentConfig = { ...initialConfig };
  }

  // Get current configuration
  getConfig(): Config {
    return { ...this.currentConfig };
  }

  // Validate configuration object
  validateConfig(config: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const validatedConfig = configSchema.parse(config);
      
      // Additional validation rules
      if (validatedConfig.privateKey) {
        if (validatedConfig.privateKey.length < 64) {
          warnings.push('Private key appears to be too short for a valid Ethereum private key');
        }
        if (!validatedConfig.privateKey.startsWith('0x') && validatedConfig.privateKey.length === 64) {
          warnings.push('Private key should start with 0x prefix');
        }
      }

      if (validatedConfig.rpcUrl) {
        try {
          new URL(validatedConfig.rpcUrl);
        } catch {
          errors.push('RPC URL is not a valid URL');
        }
      }

      // Network-specific validation
      if (validatedConfig.network === 'mainnet' && !validatedConfig.privateKey && !validatedConfig.rpcUrl) {
        warnings.push('Mainnet usage without custom RPC or private key may have limitations');
      }

      return {
        valid: errors.length === 0,
        config: validatedConfig,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        errors.push(...zodErrors);
      } else {
        errors.push(`Configuration validation failed: ${(error as Error).message}`);
      }

      return {
        valid: false,
        errors
      };
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<Config>): ConfigValidationResult {
    const mergedConfig = { ...this.currentConfig, ...newConfig };
    const validation = this.validateConfig(mergedConfig);

    if (validation.valid && validation.config) {
      const oldConfig = { ...this.currentConfig };
      this.currentConfig = validation.config;

      logger.info('Configuration updated', {
        oldConfig,
        newConfig: this.currentConfig,
        warnings: validation.warnings
      });

      // Notify watchers
      this.notifyWatchers(this.currentConfig);

      // Log warnings if any
      if (validation.warnings) {
        validation.warnings.forEach(warning => {
          logger.warn('Configuration warning', { warning });
        });
      }
    } else {
      logger.error('Configuration update failed', {
        errors: validation.errors,
        attemptedConfig: mergedConfig
      });
    }

    return validation;
  }

  // Load configuration from file
  async loadFromFile(filePath: string): Promise<ConfigValidationResult> {
    this.configPath = filePath;

    try {
      if (!existsSync(filePath)) {
        logger.info('Configuration file not found, creating default', { filePath });
        await this.saveToFile(filePath);
        return { valid: true, config: this.currentConfig };
      }

      const fileContent = await readFile(filePath, 'utf-8');
      const parsedConfig = JSON.parse(fileContent);

      const validation = this.validateConfig(parsedConfig);
      if (validation.valid && validation.config) {
        this.currentConfig = validation.config;
        this.notifyWatchers(this.currentConfig);
      }

      logger.info('Configuration loaded from file', {
        filePath,
        valid: validation.valid,
        warnings: validation.warnings,
        errors: validation.errors
      });

      return validation;

    } catch (error) {
      const errorMessage = `Failed to load configuration from ${filePath}: ${(error as Error).message}`;
      logger.error(errorMessage);
      
      return {
        valid: false,
        errors: [errorMessage]
      };
    }
  }

  // Save configuration to file
  async saveToFile(filePath?: string): Promise<boolean> {
    const targetPath = filePath || this.configPath;
    if (!targetPath) {
      logger.error('No configuration file path specified');
      return false;
    }

    try {
      const configJson = JSON.stringify(this.currentConfig, null, 2);
      await writeFile(targetPath, configJson, 'utf-8');
      
      logger.info('Configuration saved to file', { filePath: targetPath });
      return true;
    } catch (error) {
      logger.error('Failed to save configuration', {
        filePath: targetPath,
        error: (error as Error).message
      });
      return false;
    }
  }

  // Watch for configuration changes
  onConfigChange(callback: (config: Config) => void): () => void {
    this.watchers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.watchers.indexOf(callback);
      if (index > -1) {
        this.watchers.splice(index, 1);
      }
    };
  }

  private notifyWatchers(config: Config): void {
    this.watchers.forEach(watcher => {
      try {
        watcher(config);
      } catch (error) {
        logger.error('Configuration watcher error', {
          error: (error as Error).message
        });
      }
    });
  }

  // Get configuration summary for monitoring
  getConfigSummary(): Record<string, any> {
    return {
      network: this.currentConfig.network,
      hasPrivateKey: !!this.currentConfig.privateKey,
      hasCustomRpc: !!this.currentConfig.rpcUrl,
      analyticsEnabled: this.currentConfig.enableAnalytics,
      configPath: this.configPath || 'not set'
    };
  }

  // Validate environment variables
  static validateEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      issues.push(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
    }

    // Check for required environment variables (if any)
    const requiredEnvVars = ['NODE_ENV'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        // This is just a warning, not an error
        logger.warn(`Environment variable ${envVar} is not set`);
      }
    }

    // Check memory limits
    const memUsage = process.memoryUsage();
    const memLimitMB = 1024; // 1GB limit
    if (memUsage.heapTotal > memLimitMB * 1024 * 1024) {
      issues.push(`High memory usage detected: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Create a configuration template
  static createTemplate(): Config {
    return {
      network: 'testnet',
      privateKey: '', // Leave empty for security
      rpcUrl: '', // Leave empty to use defaults
      enableAnalytics: false
    };
  }

  // Merge configurations with priority
  static mergeConfigs(base: Config, override: Partial<Config>): Config {
    return {
      ...base,
      ...override
    };
  }
}

// Global configuration manager instance
export const configManager = new ConfigManager();