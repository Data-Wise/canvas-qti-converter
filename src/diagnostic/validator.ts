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

export class QtiValidator {
  private parser: XMLParser;

  constructor() {
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

  async validatePackage(path: string): Promise<DiagnosticReport> {
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

      // 1. Check imsmanifest.xml
      const manifestPath = join(checkDir, 'imsmanifest.xml');
      if (!existsSync(manifestPath)) {
        report.isValid = false;
        report.errors.push('imsmanifest.xml not found in root');
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

                   // Response Consistency Check
                   const responseDecl = Array.isArray(item.responseDeclaration) 
                      ? item.responseDeclaration[0] 
                      : item.responseDeclaration;
                   
                   if (responseDecl) {
                     const cardinality = responseDecl['@_cardinality'];
                     const body = item.itemBody;
                     if (body) {
                        const choice = body.choiceInteraction;
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
}

