/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT TEMPLATE SEEDER
 * ================================================
 * 
 * Seeds all diagnostic report templates into the database
 * Run: node prisma/seeds/seedDiagnosticTemplates.js
 */

import { PrismaClient } from '@prisma/client';
import { HEMATOLOGY_TEMPLATES, BIOCHEMISTRY_TEMPLATES, MICROBIOLOGY_TEMPLATES, SEROLOGY_TEMPLATES } from './diagnosticTemplates.seed.js';
import { RADIOLOGY_TEMPLATES, RESPIRATORY_CARDIOLOGY_TEMPLATES, CLINICAL_NOTES_TEMPLATES, PACKAGE_TEMPLATES, NEUROLOGY_TEMPLATES } from './diagnosticTemplates.part2.seed.js';

const prisma = new PrismaClient();

// Combine all templates
const ALL_TEMPLATES = {
  ...HEMATOLOGY_TEMPLATES,
  ...BIOCHEMISTRY_TEMPLATES,
  ...MICROBIOLOGY_TEMPLATES,
  ...SEROLOGY_TEMPLATES,
  ...RADIOLOGY_TEMPLATES,
  ...RESPIRATORY_CARDIOLOGY_TEMPLATES,
  ...CLINICAL_NOTES_TEMPLATES,
  ...PACKAGE_TEMPLATES,
  ...NEUROLOGY_TEMPLATES
};

async function seedDiagnosticTemplates() {
  console.log('🌱 Starting Diagnostic Template Seeding...\n');
  
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  try {
    // Get hospital ID (assuming single tenant)
    const hospital = await prisma.hospital.findFirst();
    
    if (!hospital) {
      console.error('❌ No hospital found. Please run hospital setup first.');
      process.exit(1);
    }

    console.log(`🏥 Hospital: ${hospital.hospitalName} (${hospital.id})\n`);

    // Iterate through all templates
    for (const [key, template] of Object.entries(ALL_TEMPLATES)) {
      try {
        console.log(`📝 Processing: ${template.templateName} (${template.templateCode})`);

        // Check if template already exists
        const existingTemplate = await prisma.diagnosticReportTemplate.findFirst({
          where: {
            templateCode: template.templateCode,
            hospitalId: hospital.id
          }
        });

        const templateData = {
          templateCode: template.templateCode,
          templateName: template.templateName,
          shortName: template.shortName || template.templateName,
          description: template.description || '',
          category: template.category,
          department: template.department,
          subDepartment: template.subDepartment || '',
          testSubCategory: template.testSubCategory || '',
          templateType: template.templateType,
          
          // JSON fields
          headerConfig: template.headerConfig || {},
          sections: template.sections || [],
          fields: template.fields || [],
          referenceRanges: template.referenceRanges || {},
          criticalValueRules: template.criticalValueRules || {},
          calculatedFields: template.calculatedFields || [],
          specimenConfig: template.specimenConfig || {},
          supportsMultiSpecimen: template.supportsMultiSpecimen || false,
          specimenSchema: template.specimenSchema || [],
          attachmentConfig: template.attachmentConfig || {},
          repeatableSections: template.repeatableSections || [],
          signOffConfig: template.signOffConfig || {},
          footerConfig: template.footerConfig || {},
          styling: template.styling || {},
          printConfig: template.printConfig || {},
          
          // NOTE: hospital relation is connected on create below
          isActive: true,
          isSystemTemplate: false,
          version: 1
        };

        if (existingTemplate) {
          // Update existing template
          await prisma.diagnosticReportTemplate.update({
            where: { id: existingTemplate.id },
            data: templateData
          });
          console.log(`   ✅ Updated: ${template.templateName}`);
          updatedCount++;
        } else {
          // Create new template
          await prisma.diagnosticReportTemplate.create({
            data: {
              ...templateData,
              hospital: { connect: { id: hospital.id } }
            }
          });
          console.log(`   ✅ Created: ${template.templateName}`);
          createdCount++;
        }

      } catch (error) {
        console.error(`   ❌ Error processing ${template.templateName}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created:  ${createdCount} templates`);
    console.log(`🔄 Updated:  ${updatedCount} templates`);
    console.log(`⚠️  Skipped:  ${skippedCount} templates`);
    console.log(`📝 Total:    ${Object.keys(ALL_TEMPLATES).length} templates processed`);
    console.log('='.repeat(60) + '\n');

    // Display templates by category
    console.log('📂 TEMPLATES BY CATEGORY:\n');
    
    const categories = {};
    for (const [key, template] of Object.entries(ALL_TEMPLATES)) {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push(template.templateName);
    }

    for (const [category, templates] of Object.entries(categories)) {
      console.log(`\n${getCategoryIcon(category)} ${category} (${templates.length})`);
      templates.forEach(name => console.log(`   • ${name}`));
    }

    console.log('\n✅ Diagnostic template seeding completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getCategoryIcon(category) {
  const icons = {
    'PATHOLOGY': '🩸',
    'MICROBIOLOGY': '🧬',
    'SEROLOGY': '🧫',
    'RADIOLOGY': '🩻',
    'CARDIOLOGY': '❤️',
    'RESPIRATORY': '🫁',
    'CLINICAL': '🧑‍⚕️',
    'PACKAGE': '🧾',
    'BLOOD_BANK': '🩸',
    'NEUROLOGY': '🧠'
  };
  return icons[category] || '📄';
}

// Run seeder
seedDiagnosticTemplates()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
