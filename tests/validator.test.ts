
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QtiValidator } from '../src/diagnostic/validator.js'; // Use .js extension for TS import resolution in Node if needed, or .ts if ts-node/vitest handles it. Vitest handles .ts.
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('QtiValidator', () => {
  let tempDir: string;
  let validator: QtiValidator;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'qti-test-'));
    validator = new QtiValidator();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should fail if path does not exist', async () => {
    const report = await validator.validatePackage(join(tempDir, 'non-existent'));
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('File not found');
  });

  it('should validate a valid folder structure with XML content', async () => {
    // Setup valid structure
    mkdirSync(join(tempDir, 'items'), { recursive: true });
    mkdirSync(join(tempDir, 'tests'), { recursive: true });
    
    // Valid Manifest
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="manifest_1" xmlns="...">
        <resources>
          <resource identifier="res_item_1" type="imsqti_item_xmlv2p1" href="items/item_1.xml">
            <file href="items/item_1.xml"/>
          </resource>
          <resource identifier="res_test_1" type="imsqti_test_xmlv2p1" href="tests/test.xml">
            <file href="tests/test.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    // Valid Item
    writeFileSync(join(tempDir, 'items', 'item_1.xml'), `
      <assessmentItem identifier="item_1">
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
           <defaultValue><value>1</value></defaultValue>
        </outcomeDeclaration>
        <itemBody><p>Test</p></itemBody>
      </assessmentItem>
    `);
    
    // Valid Test
    writeFileSync(join(tempDir, 'tests', 'test.xml'), `
      <assessmentTest identifier="test_1">
        <testPart identifier="part_1">
           <assessmentSection identifier="sec_1">
             <assessmentItemRef identifier="ref_1" href="items/item_1.xml"/>
           </assessmentSection>
        </testPart>
      </assessmentTest>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(true);
    expect(report.details.manifestFound).toBe(true);
    expect(report.details.itemCount).toBe(1);
    expect(report.details.testFound).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('should fail if resource file is missing', async () => {
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/missing.xml">
            <file href="items/missing.xml"/>
          </resource>
        </resources>
      </manifest>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('Resource main file not found'))).toBe(true);
  });
  
  it('should fail if XML is invalid', async () => {
    mkdirSync(join(tempDir, 'items'));
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/bad.xml">
            <file href="items/bad.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    writeFileSync(join(tempDir, 'items', 'bad.xml'), 'Not XML');

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    // fast-xml-parser might not throw on plain text, but will return object missing root
    expect(report.errors.some(e => 
      e.includes('Invalid XML content') || e.includes('Invalid Item XML')
    )).toBe(true);
  });
  
  it('should fail if Item XML is missing assessmentItem', async () => {
    mkdirSync(join(tempDir, 'items'));
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/wrong_root.xml">
            <file href="items/wrong_root.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    writeFileSync(join(tempDir, 'items', 'wrong_root.xml'), '<wrongRoot></wrongRoot>');

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('Invalid Item XML'))).toBe(true);
  });

  it('should fail if Test references missing item', async () => {
    mkdirSync(join(tempDir, 'items'));
    mkdirSync(join(tempDir, 'tests'));
    
    // Manifest lists the test, and maybe the item, but let's say test refs it and check fails
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="test_1" type="imsqti_test_xmlv2p1" href="tests/test.xml">
            <file href="tests/test.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    writeFileSync(join(tempDir, 'tests', 'test.xml'), `
      <assessmentTest identifier="test_1">
        <testPart identifier="part_1">
           <assessmentSection identifier="sec_1">
             <assessmentItemRef identifier="ref_1" href="items/missing_ref.xml"/>
           </assessmentSection>
        </testPart>
      </assessmentTest>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('Test references missing item file'))).toBe(true);
  });

  it('should fail if duplicate identifiers exist', async () => {
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test_dupe" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/item_1.xml">
            <file href="items/item_1.xml"/>
          </resource>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/item_2.xml">
            <file href="items/item_2.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes("Duplicate identifier used: 'item_1'"))).toBe(true);
  });

  it('should fail if interaction mismatches cardinality', async () => {
    mkdirSync(join(tempDir, 'items'));
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/mismatch.xml">
            <file href="items/mismatch.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    // Cardinality single but maxChoices > 1 (should be mismatch)
    writeFileSync(join(tempDir, 'items', 'mismatch.xml'), `
      <assessmentItem identifier="item_1">
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"><defaultValue><value>1</value></defaultValue></outcomeDeclaration>
        <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
           <correctResponse><value>A</value></correctResponse>
        </responseDeclaration>
        <itemBody>
           <choiceInteraction responseIdentifier="RESPONSE" maxChoices="2" shuffle="true">
             <simpleChoice identifier="A">A</simpleChoice>
             <simpleChoice identifier="B">B</simpleChoice>
           </choiceInteraction>
        </itemBody>
      </assessmentItem>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes("Mismatch: Cardinality 'single'"))).toBe(true);
  });

  // NEW: Canvas-specific validation tests
  it('should fail if choice item has no correct answer defined', async () => {
    mkdirSync(join(tempDir, 'items'));
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/no_answer.xml">
            <file href="items/no_answer.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    // Item with choiceInteraction but no correctResponse value
    writeFileSync(join(tempDir, 'items', 'no_answer.xml'), `
      <assessmentItem identifier="item_1">
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"><defaultValue><value>1</value></defaultValue></outcomeDeclaration>
        <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
           <!-- Missing correctResponse! -->
        </responseDeclaration>
        <itemBody>
           <choiceInteraction responseIdentifier="RESPONSE" maxChoices="1">
             <simpleChoice identifier="A">Option A</simpleChoice>
             <simpleChoice identifier="B">Option B</simpleChoice>
           </choiceInteraction>
        </itemBody>
      </assessmentItem>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('No correct answer defined'))).toBe(true);
  });

  it('should error on unsupported Canvas interaction types', async () => {
    mkdirSync(join(tempDir, 'items'));
    writeFileSync(join(tempDir, 'imsmanifest.xml'), `
      <manifest identifier="test" xmlns="...">
        <resources>
          <resource identifier="item_1" type="imsqti_item_xmlv2p1" href="items/unsupported.xml">
            <file href="items/unsupported.xml"/>
          </resource>
        </resources>
      </manifest>
    `);
    
    // Item with unsupported orderInteraction
    writeFileSync(join(tempDir, 'items', 'unsupported.xml'), `
      <assessmentItem identifier="item_1">
        <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"><defaultValue><value>1</value></defaultValue></outcomeDeclaration>
        <itemBody>
           <orderInteraction responseIdentifier="RESPONSE">
             <simpleChoice identifier="A">First</simpleChoice>
             <simpleChoice identifier="B">Second</simpleChoice>
           </orderInteraction>
        </itemBody>
      </assessmentItem>
    `);

    const report = await validator.validatePackage(tempDir);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes("Unsupported Canvas interaction 'orderInteraction'"))).toBe(true);
  });
});
