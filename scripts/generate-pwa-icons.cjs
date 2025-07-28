#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Required PWA icon sizes
const ICON_SIZES = [
  { size: 96, suffix: '96x96' },
  { size: 128, suffix: '128x128' },
  { size: 144, suffix: '144x144' },
  { size: 152, suffix: '152x152' },
  { size: 192, suffix: '192x192' },
  { size: 384, suffix: '384x384' },
  { size: 512, suffix: '512x512' }
];

const SOURCE_LOGO = 'public/logo/essentials_pt_logo.png';
const OUTPUT_DIR = 'public/icons';

console.log('🎨 Generating PWA Icons for Essentials');
console.log('================================');

// Check if source logo exists
if (!fs.existsSync(SOURCE_LOGO)) {
  console.error(`❌ Source logo not found: ${SOURCE_LOGO}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created directory: ${OUTPUT_DIR}`);
}

// Check if ImageMagick is available
let useSharp = false;
try {
  execSync('magick -version', { stdio: 'ignore' });
  console.log('✅ Using ImageMagick for image processing');
} catch (error) {
  console.log('⚠️  ImageMagick not found, trying Sharp...');
  try {
    require('sharp');
    useSharp = true;
    console.log('✅ Using Sharp for image processing');
  } catch (sharpError) {
    console.error('❌ Neither ImageMagick nor Sharp found!');
    console.error('Please install one of the following:');
    console.error('  ImageMagick: https://imagemagick.org/script/download.php');
    console.error('  Sharp: npm install sharp');
    process.exit(1);
  }
}

// Generate icons
async function generateIcons() {
  console.log('\n📱 Generating icon sizes...');
  
  for (const { size, suffix } of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${suffix}.png`);
    
    try {
      if (useSharp) {
        // Use Sharp for image processing
        const sharp = require('sharp');
        await sharp(SOURCE_LOGO)
          .resize(size, size, {
            kernel: sharp.kernel.lanczos3,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      } else {
        // Use ImageMagick for image processing
        execSync(`magick "${SOURCE_LOGO}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`);
      }
      
      console.log(`✅ Generated: ${suffix} → ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${suffix}:`, error instanceof Error ? error.message : String(error));
    }
  }
}

// Update manifest.json
function updateManifest() {
  console.log('\n📋 Updating manifest.json...');
  
  const manifestPath = 'public/manifest.json';
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Generate new icons array
    const icons = ICON_SIZES.map(({ size, suffix }) => ({
      src: `/icons/icon-${suffix}.png`,
      sizes: suffix,
      type: 'image/png',
      purpose: 'any maskable'
    }));
    
    // Update manifest
    manifest.icons = icons;
    
    // Write updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Updated manifest.json with new icon definitions');
    
  } catch (error) {
    console.error('❌ Failed to update manifest.json:', error instanceof Error ? error.message : String(error));
  }
}

// Create favicon sizes too
async function generateFavicons() {
  console.log('\n🌐 Generating favicon sizes...');
  
  const faviconSizes = [16, 32, 48];
  
  for (const size of faviconSizes) {
    const outputPath = `public/favicon-${size}x${size}.png`;
    
    try {
      if (useSharp) {
        const sharp = require('sharp');
        await sharp(SOURCE_LOGO)
          .resize(size, size, {
            kernel: sharp.kernel.lanczos3,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      } else {
        execSync(`magick "${SOURCE_LOGO}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`);
      }
      
      console.log(`✅ Generated favicon: ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Failed to generate favicon ${size}x${size}:`, error instanceof Error ? error.message : String(error));
    }
  }
}

// Main execution
async function main() {
  try {
    await generateIcons();
    updateManifest();
    await generateFavicons();
    
    console.log('\n🎉 PWA Icon Generation Complete!');
    console.log('\nGenerated files:');
    console.log('  📁 public/icons/ - PWA app icons');
    console.log('  📄 public/manifest.json - Updated with new icons');
    console.log('  🌐 public/favicon-*.png - Favicon sizes');
    console.log('\n✨ Your PWA now has complete icon coverage!');
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main(); 