import { existsSync, readFileSync, mkdtempSync, rmSync, lstatSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { XMLParser } from 'fast-xml-parser';

export interface DiagnosticReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    manifestFound: boolean;
    resourceCount: number;
    itemCount: number;
    testFound: boolean;
  };
}

export interface ValidatorOptions {
  /** Strict mode for New Quizzes compatibility */
  strict?: boolean;
}

export class QtiValidator {
  private parser: XMLParser;
  private options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.options = options;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name) => {
        // Force array for repeated elements
        const arrayFields = ['resource', 'file', 'dependency', 'assessmentItemRef', 'simpleChoice', 'value'];
        return arrayFields.includes(name);
      }
    });
  }

  /**
   * Extract raw HTML content from mattext element (preserves HTML tags)
   */
  private extractMattextHtml(rawXml: string): Map<string, string> {
    const mattextMap = new Map<string, string>();
    const regex = /<mattext[^>]*texttype="text\/html"[^>]*>([\s\S]*?)<\/mattext>/g;
    let match;
    let index = 0;
    while ((match = regex.exec(rawXml)) !== null) {
      mattextMap.set(`mattext_${index}`, match[1]);
      index++;
    }
    return mattextMap;
  }

  async validatePackage(path: string, options?: ValidatorOptions): Promise<DiagnosticReport> {
    // Allow per-call options override
    const opts = { ...this.options, ...options };
    const report: DiagnosticReport = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {
        manifestFound: false,
        resourceCount: 0,
        itemCount: 0,
        testFound: false
      }
    };

    if (!existsSync(path)) {
      report.isValid = false;
      report.errors.push(`File not found: ${path}`);
      return report;
    }

    // Create temp directory for extraction/inspection
    const tempDir = mkdtempSync(join(tmpdir(), 'qti-validate-'));
    
    try {
      let checkDir = path;
      const stats = lstatSync(path);
      
      if (stats.isFile() && path.endsWith('.zip')) {
        // Unzip
        try {
          execSync(`unzip -o -q "${path}" -d "${tempDir}"`);
          checkDir = tempDir;
        } catch (e) {
          report.isValid = false;
          report.errors.push(`Failed to unzip file. Is it a valid zip archive?`);
          return report;
        }
      } else if (stats.isDirectory()) {
         checkDir = path;
      } else {
        report.isValid = false;
        report.errors.push('Input must be a directory or .zip file');
        return report;
      }

      // First, check for QTI 1.2 format (single XML file with <questestinterop>)
      const xmlFiles = execSync(`find "${checkDir}" -maxdepth 1 -name "*.xml" -type f`, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(f => f.length > 0);
      
      // Check if any XML file is QTI 1.2 format
      for (const xmlFile of xmlFiles) {
        try {
          const content = readFileSync(xmlFile, 'utf-8');
          const json = this.parser.parse(content);

          if (json.questestinterop) {
            // This is QTI 1.2 format - validate it (pass raw XML for HTML extraction)
            return this.validateQti12(json, xmlFile, report, opts, content);
          }
        } catch (e) {
          // Continue checking other files
        }
      }

      // Check for imsmanifest.xml (QTI 2.1 format)
      const manifestPath = join(checkDir, 'imsmanifest.xml');
      if (!existsSync(manifestPath)) {
        report.isValid = false;
        report.errors.push('imsmanifest.xml not found in root (QTI 2.1) and no valid QTI 1.2 XML file found');
        return report;
      }
      report.details.manifestFound = true;

      const manifestContent = readFileSync(manifestPath, 'utf-8');
      
      let manifestJson;
      try {
        manifestJson = this.parser.parse(manifestContent);
      } catch (e: any) {
        report.isValid = false;
        report.errors.push(`Invalid XML in imsmanifest.xml: ${e.message}`);
        return report;
      }

      // Track unique identifiers
      const identifiers = new Set<string>();
      const checkIdentifier = (id: string, source: string) => {
        if (!id) return;
        if (identifiers.has(id)) {
          report.errors.push(`Duplicate identifier used: '${id}' in ${source}`);
        } else {
          identifiers.add(id);
        }
      };

      if (manifestJson.manifest['@_identifier']) {
        checkIdentifier(manifestJson.manifest['@_identifier'], 'Manifest');
      }

      if (!manifestJson.manifest) {
        report.errors.push('imsmanifest.xml missing root <manifest> element');
      }

      const resources = manifestJson.manifest?.resources?.resource || [];
      report.details.resourceCount = resources.length;

      // 2. Resource Checks
      for (const resource of resources) {
        const type = resource['@_type'];
        const resId = resource['@_identifier'];
        const href = resource['@_href']; // Main entry point
        const files = resource.file || [];

        if (resId) checkIdentifier(resId, `Resource`);

        if (type === 'imsqti_item_xmlv2p1') {
          report.details.itemCount++;
        }
        if (type === 'imsqti_test_xmlv2p1') {
          report.details.testFound = true;
        }

        // Check if main href exists
        if (href && !existsSync(join(checkDir, href))) {
             report.errors.push(`Resource main file not found: ${href}`);
        }

        // Check all file dependencies
        for (const file of files) {
          const fileHref = file['@_href'];
          const fullPath = join(checkDir, fileHref);
          
          if (!existsSync(fullPath)) {
            report.errors.push(`Missing resource file: ${fileHref}`);
          } else if (fileHref.endsWith('.xml')) {
             // 3. XML Content Validation
             try {
               const xmlContent = readFileSync(fullPath, 'utf-8');
               const xmlJson = this.parser.parse(xmlContent);
               
               if (type === 'imsqti_item_xmlv2p1') {
                 if (!xmlJson.assessmentItem) {
                    report.errors.push(`Invalid Item XML (missing assessmentItem): ${fileHref}`);
                 } else {
                   const item = xmlJson.assessmentItem;
                   if (item['@_identifier']) checkIdentifier(item['@_identifier'], `Item ${fileHref}`);

                   // Check for explicit points/score
                   const outcomes = item.outcomeDeclaration;
                   const score = Array.isArray(outcomes) 
                      ? outcomes.find((o: any) => o['@_identifier'] === 'SCORE') 
                      : (outcomes?.['@_identifier'] === 'SCORE' ? outcomes : null);
                   
                   if (!score) {
                     report.warnings.push(`Item missing SCORE outcomeDeclaration: ${fileHref}`);
                   }
                   // CANVAS CHECK: Empty or very short stem
                   const itemBody = item.itemBody;
                   if (itemBody) {
                     const bodyStr = JSON.stringify(itemBody);
                     // Check for empty or whitespace-only content
                     const textContent = bodyStr.replace(/<[^>]+>/g, '').replace(/[{}"\[\],:]/g, '').trim();
                     
                     // SECURITY CHECK: Malicious Content
                     const dangerousTags = ['<script', '<iframe', '<object', '<embed', 'javascript:'];
                     const bodyContent = bodyStr || '';
                     
                     for (const tag of dangerousTags) {
                         if (bodyContent.toLowerCase().includes(tag)) {
                           report.errors.push(`Security Error: Potential malicious content (${tag}) detected in item ${item['@_identifier'] || fileHref}`);
                         }
                     }
                     

                   }
                   
                   // CANVAS CHECK: Identifier format (no special chars)
                   const identifier = item['@_identifier'];
                   if (identifier && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
                     report.warnings.push(`Identifier '${identifier}' contains special characters, may cause issues: ${fileHref}`);
                   }

                   // Response Consistency Check
                   const responseDecl = Array.isArray(item.responseDeclaration) 
                      ? item.responseDeclaration[0] 
                      : item.responseDeclaration;
                   
                   if (responseDecl) {
                     const cardinality = responseDecl['@_cardinality'];
                     const body = item.itemBody;
                     if (body) {
                        const choice = body.choiceInteraction;
                        // Check for choice interaction with no options
                     if (choice) {
                          const maxChoices = choice['@_maxChoices']; // "1" or "0" (unlimited)
                          // Multiple choice with single answer
                          if (cardinality === 'single' && (maxChoices === '0' || parseInt(maxChoices) > 1)) {
                             report.errors.push(`Mismatch: Cardinality 'single' but maxChoices '${maxChoices}' in ${fileHref}`);
                          }
                          // Multiple answers
                          if (cardinality === 'multiple' && maxChoices === '1') {
                             report.errors.push(`Mismatch: Cardinality 'multiple' but maxChoices '1' in ${fileHref}`);
                          }
                        }
                     }
                      
                      // CANVAS CHECK: Correct answer detection
                      const correctResponse = responseDecl.correctResponse;
                      const hasCorrectAnswer = correctResponse?.value && 
                        (Array.isArray(correctResponse.value) ? correctResponse.value.length > 0 : true);
                      
                      if (!hasCorrectAnswer && body?.choiceInteraction) {
                        report.errors.push(`Canvas import will fail: No correct answer defined in ${fileHref}`);
                      }
                    }
                    
                    // CANVAS CHECK: ResponseProcessing for auto-grading
                    const respProc = item.responseProcessing;
                    const body = item.itemBody; // Re-declare body for this scope if not already in scope
                    const hasChoiceInteraction = body?.choiceInteraction;
                    
                    if (!respProc && hasChoiceInteraction) {
                      report.warnings.push(`Missing responseProcessing (may need manual grading): ${fileHref}`);
                    }
                    
                    // CANVAS CHECK: Interaction type support
                    if (body) {
                      const unsupportedInteractions = [
                        'gapMatchInteraction',
                        'orderInteraction', 
                        'associateInteraction',
                        'graphicGapMatchInteraction',
                        'hotspotInteraction'
                      ];
                      for (const interaction of unsupportedInteractions) {
                        if (body[interaction]) {
                          report.errors.push(`Unsupported Canvas interaction '${interaction}' in ${fileHref}`);
                        }
                      }
                      
                      // Warn about limited support
                      if (body.matchInteraction) {
                        report.warnings.push(`matchInteraction has limited Canvas support: ${fileHref}`);
                      }
                      
                      // CANVAS CHECK: Image reference validation
                      // Extract img src from itemBody content
                      const bodyContent = JSON.stringify(body);
                      const imgMatches = bodyContent.match(/src=\\"([^"]+)\\"/g) || [];
                      const imgSrcMatches = bodyContent.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
                      
                      // Also check for object/embed elements (for embedded media)
                      const allMediaRefs = [...imgMatches, ...imgSrcMatches];
                      for (const ref of allMediaRefs) {
                        const srcMatch = ref.match(/["']([^"']+\.(?:png|jpg|jpeg|gif|svg|webp))["']/i);
                        if (srcMatch) {
                          const imgPath = srcMatch[1];
                          // Check if image file exists relative to items folder
                          const fullImgPath = join(checkDir, 'items', imgPath);
                          const altImgPath = join(checkDir, imgPath);
                          if (!existsSync(fullImgPath) && !existsSync(altImgPath)) {
                            report.errors.push(`Missing image file '${imgPath}' referenced in ${fileHref}`);
                          }
                        }
                      }
                    }
                  }
               } else if (type === 'imsqti_test_xmlv2p1') {
                 if (!xmlJson.assessmentTest) {
                    report.errors.push(`Invalid Test XML (missing assessmentTest): ${fileHref}`);
                 } else {
                    const test = xmlJson.assessmentTest;
                    if (test['@_identifier']) checkIdentifier(test['@_identifier'], `Test ${fileHref}`);

                    // Check item references
                    const sections = test.testPart?.assessmentSection;
                    // Handle single or array sections/items
                    const processSection = (sec: any) => {
                        if (!sec) return;
                        if (sec['@_identifier']) checkIdentifier(sec['@_identifier'], `Section in ${fileHref}`);
                        
                        const refs = sec.assessmentItemRef || [];
                        const refList = Array.isArray(refs) ? refs : [refs];
                        
                        refList.forEach((ref: any) => {
                            const refHref = ref['@_href'];
                            if (refHref && !existsSync(join(checkDir, refHref))) {
                                report.errors.push(`Test references missing item file: ${refHref}`);
                            }
                        });
                        
                        // Recurse if subsections exist
                        if (sec.assessmentSection) {
                             const subSecs = Array.isArray(sec.assessmentSection) ? sec.assessmentSection : [sec.assessmentSection];
                             subSecs.forEach(processSection);
                        }
                    };
                    
                    if (sections) {
                        const secList = Array.isArray(sections) ? sections : [sections];
                        secList.forEach(processSection);
                    }
                 }
               }
             } catch (e: any) {
                report.errors.push(`Invalid XML content in ${fileHref}: ${e.message}`);
             }
          }
        }
      }

      if (!report.details.testFound) {
        report.warnings.push('No assessmentTest resource found (imsqti_test_xmlv2p1). This may just be an item bank.');
      }

    } catch (error: any) {
      report.isValid = false;
      report.errors.push(`Validation Error: ${error.message}`);
    } finally {
      if (path.endsWith('.zip')) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }
    
    if (report.errors.length > 0) report.isValid = false;
    
    return report;
  }

  /**
   * Validate QTI 1.2 format (Canvas Classic Quizzes)
   * Expects <questestinterop> root with <assessment> and <item> elements
   *
   * In strict mode (for New Quizzes compatibility):
   * - Validates proper QTI structure more rigorously
   * - Checks for required metadata fields
   * - Validates response processing completeness
   * - Ensures all items have explicit point values
   */
  private validateQti12(json: any, filePath: string, report: DiagnosticReport, opts: ValidatorOptions = {}, rawXml?: string): DiagnosticReport {
    const strict = opts.strict || false;
    const qti = json.questestinterop;
    const assessment = qti.assessment;

    // Extract raw HTML content from mattext elements (preserves HTML tags)
    const mattextHtmlMap = rawXml ? this.extractMattextHtml(rawXml) : new Map<string, string>();

    if (!assessment) {
      report.errors.push('QTI 1.2: Missing <assessment> element');
      report.isValid = false;
      return report;
    }
    
    // Mark as found (no manifest in QTI 1.2)
    report.details.manifestFound = true;
    report.details.testFound = true;
    
    // Get assessment title
    const title = assessment['@_title'] || assessment['@_ident'] || 'Untitled';

    // Strict mode: check for required assessment attributes
    if (strict) {
      if (!assessment['@_ident']) {
        report.errors.push('Strict: Assessment missing required "ident" attribute');
      }
      if (!assessment['@_title']) {
        report.warnings.push('Strict: Assessment missing "title" attribute (recommended)');
      }
    }

    // Find items in sections
    const section = assessment.section;
    if (!section) {
      report.errors.push('QTI 1.2: Missing <section> element');
      report.isValid = false;
      return report;
    }
    
    // Handle single or multiple items
    const items = section.item || [];
    const itemList = Array.isArray(items) ? items : [items];
    report.details.itemCount = itemList.length;
    
    if (itemList.length === 0) {
      report.errors.push('QTI 1.2: No <item> elements found');
      report.isValid = false;
      return report;
    }

    // Quarto GFM compatibility tracking - scan ALL mattext elements for features
    let quartoStats = {
      itemsWithInlineCode: 0,
      itemsWithLatexMath: 0,
      itemsWithEscapedOperators: 0,
      itemsWithEscapedAnchors: 0,
      itemsWithUnconvertedMath: 0
    };

    // Pre-scan all mattext HTML for Quarto features
    mattextHtmlMap.forEach((html, key) => {
      if (html.includes('<code>') && html.includes('</code>')) {
        quartoStats.itemsWithInlineCode++;
      }
      if ((html.includes('\\(') && html.includes('\\)')) || (html.includes('\\[') && html.includes('\\]'))) {
        quartoStats.itemsWithLatexMath++;
      }
      if (html.includes('&lt;') || html.includes('&gt;')) {
        quartoStats.itemsWithEscapedOperators++;
      }
      if (html.includes('&lt;a href=') || html.includes('&lt;a class=')) {
        quartoStats.itemsWithEscapedAnchors++;
      }
      if (html.includes('$') && !html.includes('\\$') && !html.includes('\\(')) {
        quartoStats.itemsWithUnconvertedMath++;
      }
    });

    // Validate each item
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const itemIdent = item['@_ident'] || `item_${i + 1}`;

      // Check for presentation
      if (!item.presentation) {
        report.errors.push(`QTI 1.2: Item ${itemIdent} missing <presentation> element`);
        continue;
      }
      
      // Check for question text (mattext)
      const material = item.presentation.material;
      const mattext = material?.mattext;
      const parsedText = typeof mattext === 'string' ? mattext : mattext?.['#text'] || '';

      // Use raw HTML if available (preserves <code>, <img>, etc.), otherwise use parsed text
      const questionText = mattextHtmlMap.get(`mattext_${i}`) || parsedText;

      if (!questionText || questionText.trim().length < 3) {
        report.errors.push(`Canvas import may fail: Question stem appears empty or too short for item ${itemIdent}`);
      }

      // SECURITY CHECK: Malicious Content in QTI 1.2
      const dangerousTags = ['<script', '<iframe', '<object', '<embed', 'javascript:'];
      for (const tag of dangerousTags) {
          if (questionText.toLowerCase().includes(tag)) {
            report.errors.push(`Security Error: Potential malicious content (${tag}) detected in item ${itemIdent}`);
          }
      }

      // QUARTO GFM COMPATIBILITY CHECKS
      // Check for improperly escaped HTML anchor tags (Quarto cross-references should be stripped)
      if (questionText.includes('&lt;a href=') || questionText.includes('&lt;a class=')) {
        report.warnings.push(`Item ${itemIdent}: Escaped HTML anchor tag detected - Quarto cross-references may not have been stripped properly`);
        quartoStats.itemsWithEscapedAnchors++;
      }

      // Per-item checks for unescaped comparison operators (still useful for specific error reporting)
      const hasRawLt = questionText.match(/<(?![/a-zA-Z])/); // < not followed by tag
      const hasRawGt = questionText.match(/(?<![a-zA-Z])>/); // > not preceded by tag
      if (hasRawLt || hasRawGt) {
        report.warnings.push(`Item ${itemIdent}: Unescaped comparison operator detected - may render incorrectly in Canvas`);
      }

      // Check for answer options (response_lid with render_choice)
      const responseLid = item.presentation.response_lid;
      const responseStr = item.presentation.response_str;
      
      // Get question type from metadata
      const metadata = item.itemmetadata?.qtimetadata?.qtimetadatafield;
      let questionType = 'unknown';
      let pointsValue: number | null = null;

      if (metadata) {
        const metaFields = Array.isArray(metadata) ? metadata : [metadata];

        const typeField = metaFields.find((f: any) => f.fieldlabel === 'question_type');
        if (typeField) {
          questionType = typeField.fieldentry || 'unknown';
        }

        const pointsField = metaFields.find((f: any) => f.fieldlabel === 'points_possible');
        if (pointsField) {
          pointsValue = parseFloat(pointsField.fieldentry);
        }
      }

      // Strict mode: additional item-level validations
      if (strict) {
        // Check for required metadata
        if (!item.itemmetadata?.qtimetadata) {
          report.errors.push(`Strict: Item ${itemIdent} missing <itemmetadata> with <qtimetadata>`);
        }

        // Check for explicit point value
        if (pointsValue === null || isNaN(pointsValue)) {
          report.errors.push(`Strict: Item ${itemIdent} missing "points_possible" metadata`);
        } else if (pointsValue <= 0) {
          report.warnings.push(`Strict: Item ${itemIdent} has zero or negative points (${pointsValue})`);
        }

        // Check for question_type metadata (required for Canvas import)
        if (questionType === 'unknown') {
          report.errors.push(`Strict: Item ${itemIdent} missing "question_type" metadata`);
        }

        // Check for valid item identifier format
        if (!item['@_ident']) {
          report.errors.push(`Strict: Item missing required "ident" attribute`);
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(itemIdent)) {
          report.errors.push(`Strict: Item identifier "${itemIdent}" contains invalid characters`);
        }

        // Check item title (recommended for New Quizzes)
        if (!item['@_title']) {
          report.warnings.push(`Strict: Item ${itemIdent} missing "title" attribute (recommended)`);
        }
      }

      if (responseLid) {
        // Multiple choice / True-False
        const renderChoice = responseLid.render_choice;
        if (renderChoice) {
          const responseLabels = renderChoice.response_label || [];
          const labels = Array.isArray(responseLabels) ? responseLabels : [responseLabels];

          if (labels.length < 2) {
            report.errors.push(`Canvas import may fail: Less than 2 answer options for item ${itemIdent}`);
          }

          // Check answer option text for Quarto GFM compatibility issues
          labels.forEach((label: any, idx: number) => {
            const optionMaterial = label.material?.mattext;
            const optionText = typeof optionMaterial === 'string' ? optionMaterial : optionMaterial?.['#text'] || '';

            // Check for escaped HTML in options
            if (optionText.includes('&lt;a href=') || optionText.includes('&lt;a class=')) {
              report.warnings.push(`Item ${itemIdent}, option ${idx + 1}: Escaped HTML anchor tag detected`);
            }

            // Check for inline code formatting in options
            if (optionText.includes('<code>') && optionText.includes('</code>')) {
              // Good - inline code is properly formatted in options
            }

            // Check for LaTeX in options
            if (optionText.includes('$') && !optionText.includes('\\$') && !optionText.includes('\\(')) {
              report.warnings.push(`Item ${itemIdent}, option ${idx + 1}: Dollar signs detected - LaTeX may not be converted`);
            }
          });
        }
        
        // Check for correct answer in resprocessing
        const resprocessing = item.resprocessing;
        if (resprocessing) {
          const respcondition = resprocessing.respcondition;
          const condVar = respcondition?.conditionvar;
          const varequal = condVar?.varequal;
          const andBlock = condVar?.and;
          const hasCorrect = varequal || (andBlock && (andBlock.varequal || (Array.isArray(andBlock) && andBlock.some((a: any) => a.varequal))));

          if (!hasCorrect && questionType !== 'essay_question' && questionType !== 'short_answer_question') {
            report.errors.push(`Canvas import may fail: No correct answer defined for item ${itemIdent}`);
          }

          // Strict mode: validate resprocessing structure completeness
          if (strict) {
            // Check for setvar (score assignment)
            const setvar = respcondition?.setvar;
            if (!setvar) {
              report.warnings.push(`Strict: Item ${itemIdent} resprocessing missing <setvar> for score assignment`);
            } else {
              // Verify varname and action attributes
              const varname = setvar['@_varname'] || setvar['@_respident'];
              const action = setvar['@_action'] || setvar['@_actoin']; // Canvas uses "actoin" typo
              if (!varname && !action) {
                report.warnings.push(`Strict: Item ${itemIdent} setvar missing varname/action attributes`);
              }
            }

            // Check outcomes (decvar)
            const outcomes = resprocessing.outcomes;
            if (!outcomes?.decvar) {
              report.warnings.push(`Strict: Item ${itemIdent} missing <outcomes><decvar> declaration`);
            }
          }
        } else if (questionType !== 'essay_question' && questionType !== 'short_answer_question') {
          if (strict) {
            report.errors.push(`Strict: Item ${itemIdent} missing required <resprocessing> element`);
          } else {
            report.warnings.push(`Item ${itemIdent} missing <resprocessing> (may need manual grading)`);
          }
        }
      } else if (responseStr) {
        // Essay / Short Answer / Numeric - no options needed
        // These are manually graded so no correct answer check
      } else {
        report.errors.push(`QTI 1.2: Item ${itemIdent} missing response element (response_lid or response_str)`);
      }
      
      // Check for embedded images with data URIs (should work in Canvas)
      const bodyContent = JSON.stringify(item.presentation);
      if (bodyContent.includes('data:image')) {
        // Good - embedded image
      } else if (bodyContent.includes('<img') && bodyContent.includes('src=')) {
        // Check if it's a relative path (may not work)
        if (!bodyContent.includes('data:') && !bodyContent.includes('http')) {
          report.warnings.push(`Item ${itemIdent} has image with relative path - may not display in Canvas`);
        }
      }
    }

    // Add Quarto GFM compatibility summary to warnings (informational)
    // NOTE: Currently disabled due to runtime issue in item validation loop
    // TODO: Debug and re-enable Quarto feature statistics display
    /*
    if (quartoStats.itemsWithInlineCode > 0 || quartoStats.itemsWithLatexMath > 0 || quartoStats.itemsWithEscapedOperators > 0) {
      const features: string[] = [];
      if (quartoStats.itemsWithInlineCode > 0) {
        features.push(`${quartoStats.itemsWithInlineCode} with inline code`);
      }
      if (quartoStats.itemsWithLatexMath > 0) {
        features.push(`${quartoStats.itemsWithLatexMath} with LaTeX math`);
      }
      if (quartoStats.itemsWithEscapedOperators > 0) {
        features.push(`${quartoStats.itemsWithEscapedOperators} with comparison operators`);
      }
      report.warnings.push(`ℹ️  Quarto GFM features detected: ${features.join(', ')}`);
    }

    if (quartoStats.itemsWithEscapedAnchors > 0) {
      report.warnings.push(`⚠️  ${quartoStats.itemsWithEscapedAnchors} items have escaped HTML anchors - may display incorrectly`);
    }

    if (quartoStats.itemsWithUnconvertedMath > 0) {
      report.warnings.push(`⚠️  ${quartoStats.itemsWithUnconvertedMath} items have unconverted math ($...$) - may not render in Canvas`);
    }
    */

    if (report.errors.length > 0) {
      report.isValid = false;
    }

    return report;
  }
}

