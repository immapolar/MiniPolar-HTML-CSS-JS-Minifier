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
                drop_console: false,
                drop_debugger: true,
                passes: 2,
                keep_classnames: hasReactContent,
                keep_fnames: hasReactContent,
                keep_infinity: true,
                keep_fargs: true
            },
            mangle: {
                toplevel: !hasReactContent && !hasCodeExamples,
                properties: false,
                keep_classnames: true,
                keep_fnames: true
            },
            output: {
                comments: false,
                quote_style: 1,
                preserve_annotations: true,
                beautify: hasCodeExamples,
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
            removeRedundantAttributes: false,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            useShortDoctype: true,
            ignoreCustomFragments: [
                /<%[\s\S]*?%>/,
                /<\?[\s\S]*?\?>/,
                /\{\{[\s\S]*?\}\}/,
                /{%[\s\S]*?%}/,
                /\${[\s\S]*?}/,
                /<jsx>[\s\S]*?<\/jsx>/,
                /(?<=^|\s)\.[\w-]+\s*{[\s\S]*?}/,
                /(?<=^|\s)#[\w-]+\s*{[\s\S]*?}/,
                /(?<=^|\s)@\w+[\s\S]*?{[\s\S]*?}/,
                /React\.createElement\([\s\S]*?\)/,
                /const\s+\w+\s*=\s*styled\.[\s\S]*?`[\s\S]*?`/,
                /import\s+.*\s+from\s+['"].*['"]/,
                /export\s+.*{[\s\S]*?}/
            ],
            caseSensitive: true,
            customAttrAssign: [/=/],
            preventAttributesEscaping: true,
            processScripts: ['application/ld+json'],
            minifyURLs: false,
            preserveLineBreaks: false,
            conservativeCollapse: true,
            quoteCharacter: "'",
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
                        await fs.copyFile(inputPath, outputPath);
                        console.log(`Copied: ${outputPath}`);
                }
            }
        }
    } catch (error) {
        console.error('Error processing directory:', error);
    }
}

async function main() {
    const inputDir = './src';
    const outputDir = './dist';
    
    console.log('Starting minification process...');
    await processDirectory(inputDir, outputDir);
    console.log('Minification complete!');
}

main().catch(console.error);
