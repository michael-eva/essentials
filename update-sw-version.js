#!/usr/bin/env node

/**
 * Service Worker Version Updater
 * 
 * Automatically updates version numbers in sw.js file
 * 
 * Usage:
 *   node update-sw-version.js                 # Interactive mode
 *   node update-sw-version.js major           # Update major version (e.g. 5.5.0 -> 6.0.0)
 *   node update-sw-version.js minor           # Update minor version (e.g. 5.5.0 -> 5.6.0)
 *   node update-sw-version.js patch           # Update patch version (e.g. 5.5.0 -> 5.5.1)
 *   node update-sw-version.js minor --force   # Skip confirmation prompt
 * 
 * The script updates all version references in sw.js:
 * - Header comments (V5.5 -> V5.6)
 * - Cache names (essentials-safari-v5.5 -> essentials-safari-v5.6)
 * - SW_VERSION constant (5.5.0 -> 5.6.0)
 * - Console logs (V5.5 -> V5.6)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SW_FILE_PATH = path.join(__dirname, 'public', 'sw.js');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getCurrentVersion() {
  try {
    const swContent = fs.readFileSync(SW_FILE_PATH, 'utf8');
    const versionMatch = swContent.match(/const SW_VERSION = '(\d+)\.(\d+)\.(\d+)'/);
    
    if (versionMatch) {
      return {
        major: parseInt(versionMatch[1]),
        minor: parseInt(versionMatch[2]),
        patch: parseInt(versionMatch[3]),
        full: `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`
      };
    }
    
    throw new Error('Could not parse current version from sw.js');
  } catch (error) {
    console.error('Error reading sw.js:', error.message);
    process.exit(1);
  }
}

function updateVersion(currentVersion, updateType) {
  let newVersion = { ...currentVersion };
  
  switch (updateType.toLowerCase()) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
      newVersion.patch += 1;
      break;
    default:
      throw new Error('Invalid update type. Use major, minor, or patch.');
  }
  
  newVersion.full = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
  newVersion.shortVersion = `${newVersion.major}.${newVersion.minor}`;
  
  return newVersion;
}

function updateSwFile(currentVersion, newVersion) {
  try {
    let swContent = fs.readFileSync(SW_FILE_PATH, 'utf8');
    
    // Update all version references
    swContent = swContent.replace(
      /ESSENTIALS PWA SERVICE WORKER V\d+\.\d+/g,
      `ESSENTIALS PWA SERVICE WORKER V${newVersion.shortVersion}`
    );
    
    swContent = swContent.replace(
      /essentials-safari-v\d+\.\d+/g,
      `essentials-safari-v${newVersion.shortVersion}`
    );
    
    swContent = swContent.replace(
      /essentials-static-v\d+\.\d+/g,
      `essentials-static-v${newVersion.shortVersion}`
    );
    
    swContent = swContent.replace(
      /essentials-dynamic-v\d+\.\d+/g,
      `essentials-dynamic-v${newVersion.shortVersion}`
    );
    
    swContent = swContent.replace(
      /const SW_VERSION = '\d+\.\d+\.\d+'/g,
      `const SW_VERSION = '${newVersion.full}'`
    );
    
    swContent = swContent.replace(
      /SERVICE WORKER V\d+\.\d+/g,
      `SERVICE WORKER V${newVersion.shortVersion}`
    );
    
    swContent = swContent.replace(
      /V\d+\.\d+ SERVICE WORKER/g,
      `V${newVersion.shortVersion} SERVICE WORKER`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(SW_FILE_PATH, swContent, 'utf8');
    
    console.log(`✅ Successfully updated sw.js from v${currentVersion.full} to v${newVersion.full}`);
    console.log(`📝 Updated references:`);
    console.log(`   - Cache names: v${newVersion.shortVersion}`);
    console.log(`   - SW_VERSION constant: ${newVersion.full}`);
    console.log(`   - Comments and logs: V${newVersion.shortVersion}`);
    
  } catch (error) {
    console.error('Error updating sw.js:', error.message);
    process.exit(1);
  }
}

function askForUpdateType() {
  return new Promise((resolve) => {
    process.stdout.write('What type of update? (major/minor/patch): ');
    rl.once('line', (answer) => {
      resolve(answer.trim());
    });
  });
}

function askForConfirmation(currentVersion, newVersion) {
  return new Promise((resolve) => {
    console.log(`\n📋 Update Summary:`);
    console.log(`   Current version: ${currentVersion.full}`);
    console.log(`   New version: ${newVersion.full}`);
    console.log(`   Short version: ${newVersion.shortVersion}`);
    
    process.stdout.write('\nProceed with update? (y/N): ');
    rl.once('line', (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  try {
    console.log('🚀 Service Worker Version Updater');
    console.log('=====================================\n');
    
    // Get current version
    const currentVersion = getCurrentVersion();
    console.log(`📦 Current version: ${currentVersion.full}`);
    
    // Check for command line argument
    const args = process.argv.slice(2);
    let updateType = args[0];
    
    if (!updateType) {
      // Ask for update type
      updateType = await askForUpdateType();
    }
    
    // Validate update type
    if (!['major', 'minor', 'patch'].includes(updateType.toLowerCase())) {
      console.log('❌ Invalid update type. Please use: major, minor, or patch');
      console.log('💡 Usage: node update-sw-version.js [major|minor|patch]');
      rl.close();
      return;
    }
    
    // Calculate new version
    const newVersion = updateVersion(currentVersion, updateType);
    
    // Ask for confirmation (or auto-confirm if --force flag is present)
    const forceFlag = args.includes('--force') || args.includes('-f');
    let confirmed = forceFlag;
    
    if (!confirmed) {
      confirmed = await askForConfirmation(currentVersion, newVersion);
    }
    
    if (confirmed) {
      updateSwFile(currentVersion, newVersion);
    } else {
      console.log('❌ Update cancelled');
    }
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();