const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier-terser');

const BANNER = `
__________      .__               .__        
\\______   \\____ |  | _____ _______|__| ______
 |     ___/  _ \\|  | \\__  \\\\_  __ \\  |/  ___/
 |    |  (  <_> )  |__/ __ \\|  | \\/  |\\___ \\ 
 |____|   \\____/|____(____  /__|  |__/____  >
                          \\/              \\/ 
`;

async function minifyJavaScript(inputPath, outputPath) {
    try {
        const code = await fs.readFile(inputPath, 'utf8');
        
        // Check if file contains code examples or React content
        const hasCodeExamples = code.includes('code:') || 
                              code.includes('`') ||
                              code.includes('language-');
        const hasReactContent = code.includes('React') || 
                              code.includes('jsx') || 
                              code.includes('styled') ||
                              code.includes('component') ||
                              /class.*extends React/.test(code);

        const terserOptions = {
            compress: {
                dead_code: true,
                drop_console: false, // Keep console logs for code examples
                drop_debugger: true,
                passes: 2,
                keep_classnames: hasReactContent,
                keep_fnames: hasReactContent,
                keep_infinity: true,
                keep_fargs: true
            },
            mangle: {
                toplevel: !hasReactContent && !hasCodeExamples,
                properties: false, // Don't mangle properties to preserve code examples
                keep_classnames: true,
                keep_fnames: true
            },
            output: {
                comments: false,
                quote_style: 1,
                preserve_annotations: true,
                beautify: hasCodeExamples, // Keep code examples readable
                keep_quoted_props: true
            },
            nameCache: hasReactContent ? {} : null,
            ecma: 2022,
            safari10: true
        };
        
        
        const result = await terser.minify(code, terserOptions);
        
        const outputContent = `/*${BANNER}*/\n${result.code}`;
        await fs.writeFile(outputPath, outputContent);
        console.log(`JavaScript minified: ${outputPath}`);
    } catch (error) {
        console.error('Error minifying JavaScript:', error);
    }
}

async function minifyCSS(inputPath, outputPath) {
    try {
        const css = await fs.readFile(inputPath, 'utf8');
        const minifier = new CleanCSS({
            level: {
                1: {
                    all: true
                },
                2: {
                    all: true,
                    removeUnusedAtRules: true,
                    restructureRules: true
                }
            }
        });
        
        const result = minifier.minify(css);
        const outputContent = `/*${BANNER}*/\n${result.styles}`;
        await fs.writeFile(outputPath, outputContent);
        console.log(`CSS minified: ${outputPath}`);
    } catch (error) {
        console.error('Error minifying CSS:', error);
    }
}

async function minifyHTML(inputPath, outputPath) {
    try {
        const html = await fs.readFile(inputPath, 'utf8');
        const result = await htmlMinifier.minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: false, // Don't remove potentially important attributes
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            useShortDoctype: true,
            ignoreCustomFragments: [
                /<%[\s\S]*?%>/,         // EJS
                /<\?[\s\S]*?\?>/,       // PHP-style
                /\{\{[\s\S]*?\}\}/,     // Handlebars/Mustache/Vue
                /{%[\s\S]*?%}/,         // Liquid/Django/Nunjucks
                /\${[\s\S]*?}/,         // Template literals
                /<jsx>[\s\S]*?<\/jsx>/, // Custom JSX blocks
                /(?<=^|\s)\.[\w-]+\s*{[\s\S]*?}/, // CSS class definitions in JS
                /(?<=^|\s)#[\w-]+\s*{[\s\S]*?}/, // CSS ID definitions in JS
                /(?<=^|\s)@\w+[\s\S]*?{[\s\S]*?}/, // CSS @rules in JS
                /React\.createElement\([\s\S]*?\)/, // React.createElement
                /const\s+\w+\s*=\s*styled\.[\s\S]*?`[\s\S]*?`/, // Styled-components
                /import\s+.*\s+from\s+['"].*['"]/, // Import statements
                /export\s+.*{[\s\S]*?}/ // Export statements
            ],
            caseSensitive: true,   // Important for template tags
            customAttrAssign: [/=/], // Preserve React props
            preventAttributesEscaping: true, // Important for React/JSX
            processScripts: ['application/ld+json'], // Process JSON-LD
            minifyURLs: false, // Don't minify URLs to prevent breaking paths
            preserveLineBreaks: false,
            conservativeCollapse: true, // More conservative whitespace collapse
            quoteCharacter: "'", // Use single quotes for consistency
        });
        
        const outputContent = `<!--${BANNER}-->\n${result}`;
        await fs.writeFile(outputPath, outputContent);
        console.log(`HTML minified: ${outputPath}`);
    } catch (error) {
        console.error('Error minifying HTML:', error);
    }
}

async function processDirectory(inputDir, outputDir) {
    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });
        
        const files = await fs.readdir(inputDir);
        
        for (const file of files) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, file);
            
            const stat = await fs.stat(inputPath);
            
            if (stat.isDirectory()) {
                await processDirectory(inputPath, outputPath);
            } else {
                const ext = path.extname(file).toLowerCase();
                
                switch (ext) {
                    case '.js':
                        await minifyJavaScript(inputPath, outputPath);
                        break;
                    case '.css':
                        await minifyCSS(inputPath, outputPath);
                        break;
                    case '.html':
                    case '.ejs':
                        await minifyHTML(inputPath, outputPath);
                        break;
                    default:
                        // Copy other files as-is
                        await fs.copyFile(inputPath, outputPath);
                        console.log(`Copied: ${outputPath}`);
                }
            }
        }
    } catch (error) {
        console.error('Error processing directory:', error);
    }
}

// Example usage
async function main() {
    const inputDir = './src';
    const outputDir = './dist';
    
    console.log('Starting minification process...');
    await processDirectory(inputDir, outputDir);
    console.log('Minification complete!');
}

// Add to package.json:
// {
//   "dependencies": {
//     "terser": "^5.16.0",
//     "clean-css": "^5.3.2",
//     "html-minifier-terser": "^7.2.0"
//   }
// }

main().catch(console.error);