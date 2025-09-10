/**
 * SQL Generation Utility
 * This utility provides functions to generate SQL INSERT statements
 * from JavaScript objects, which can be useful for creating test data.
 */

/**
 * Generate SQL INSERT statements for a study and its related entities
 * @param {Object} study The study object with nested arms, visits, and CRFs
 * @param {number} adminUserId The ID of the admin user to use as created_by
 * @returns {string} SQL INSERT statements
 */
function generateStudySQL(study, adminUserId = 1) {
  let sql = '';
  
  // Generate study insert
  sql += `-- Study: ${study.name}\n`;
  sql += `INSERT INTO studies (id, name, description, sponsor, protocol_number, phase, status, start_date, end_date, created_by)\n`;
  sql += `VALUES (${parseInt(study.id)}, '${escapeSqlString(study.name)}', '${escapeSqlString(study.description)}', \n`;
  sql += `        '${escapeSqlString(study.sponsor)}', 'PROTO-${study.id}', '${escapeSqlString(study.phase)}', '${study.status}', \n`;
  sql += `        '${study.startDate}', '${study.endDate}', ${adminUserId});\n\n`;
  
  // Generate arm inserts
  if (study.arms && study.arms.length > 0) {
    study.arms.forEach(arm => {
      sql += `-- Arm: ${arm.name}\n`;
      sql += `INSERT INTO study_arms (id, study_id, name, description)\n`;
      sql += `VALUES (${parseInt(arm.id)}, ${parseInt(study.id)}, '${escapeSqlString(arm.name)}', '${escapeSqlString(arm.description)}');\n\n`;
      
      // Generate visit inserts
      if (arm.visits && arm.visits.length > 0) {
        arm.visits.forEach(visit => {
          sql += `-- Visit: ${visit.name}\n`;
          sql += `INSERT INTO visit_definitions (id, study_id, arm_id, name, description, timepoint, visit_type)\n`;
          
          // Determine visit type based on name or timepoint
          let visitType = 'treatment';
          if (visit.name.toLowerCase().includes('screen')) visitType = 'screening';
          else if (visit.name.toLowerCase().includes('baseline') || visit.timepoint === 0) visitType = 'baseline';
          else if (visit.name.toLowerCase().includes('follow')) visitType = 'follow_up';
          
          sql += `VALUES (${parseInt(visit.id)}, ${parseInt(study.id)}, ${parseInt(arm.id)}, '${escapeSqlString(visit.name)}', '${escapeSqlString(visit.description)}', ${visit.timepoint}, '${visitType}');\n\n`;
          
          // Generate CRF inserts
          if (visit.crfs && visit.crfs.length > 0) {
            visit.crfs.forEach((crf, index) => {
              // First, create form definition if needed
              sql += `-- CRF: ${crf.name}\n`;
              sql += `INSERT INTO form_definitions (id, study_id, name, description, form_type, fields, created_by)\n`;
              sql += `VALUES (${parseInt(crf.id)}, ${parseInt(study.id)}, '${escapeSqlString(crf.name)}', '${escapeSqlString(crf.description)}', \n`;
              sql += `        '${crf.type}', \n`;
              sql += `        JSON_ARRAY(\n`;
              sql += `            JSON_OBJECT(\n`;
              sql += `                'id', 'field_${crf.id}_1',\n`;
              sql += `                'label', 'Sample Field 1',\n`;
              sql += `                'type', 'text',\n`;
              sql += `                'required', true\n`;
              sql += `            ),\n`;
              sql += `            JSON_OBJECT(\n`;
              sql += `                'id', 'field_${crf.id}_2',\n`;
              sql += `                'label', 'Sample Field 2',\n`;
              sql += `                'type', 'select',\n`;
              sql += `                'options', JSON_ARRAY('Option 1', 'Option 2', 'Option 3'),\n`;
              sql += `                'required', false\n`;
              sql += `            )\n`;
              sql += `        ),\n`;
              sql += `        ${adminUserId});\n\n`;
              
              // Then, associate form with visit
              sql += `-- Associate CRF with Visit\n`;
              sql += `INSERT INTO visit_forms (visit_definition_id, form_definition_id, sequence_number, is_required)\n`;
              sql += `VALUES (${parseInt(visit.id)}, ${parseInt(crf.id)}, ${index + 1}, true);\n\n`;
            });
          }
        });
      }
    });
  }
  
  return sql;
}

/**
 * Generate SQL INSERT statements for a form definition with fields
 * @param {Object} form The form definition object with fields array
 * @param {number} studyId The ID of the study
 * @param {number} adminUserId The ID of the admin user to use as created_by
 * @returns {string} SQL INSERT statement
 */
function generateFormSQL(form, studyId, adminUserId = 1) {
  let sql = '';
  
  // Generate JSON for fields array
  let fieldsJson = 'JSON_ARRAY(\n';
  
  if (form.fields && form.fields.length > 0) {
    form.fields.forEach((field, index) => {
      fieldsJson += '            JSON_OBJECT(\n';
      fieldsJson += `                'id', '${field.id}',\n`;
      fieldsJson += `                'label', '${escapeSqlString(field.label)}',\n`;
      fieldsJson += `                'type', '${field.type}'`;
      
      if (field.options) {
        fieldsJson += `,\n                'options', JSON_ARRAY(`;
        fieldsJson += field.options.map(opt => `'${escapeSqlString(opt)}'`).join(', ');
        fieldsJson += `)`;
      }
      
      if (field.min !== undefined) {
        fieldsJson += `,\n                'min', ${field.min}`;
      }
      
      if (field.max !== undefined) {
        fieldsJson += `,\n                'max', ${field.max}`;
      }
      
      if (field.step !== undefined) {
        fieldsJson += `,\n                'step', ${field.step}`;
      }
      
      fieldsJson += `,\n                'required', ${field.required ? 'true' : 'false'}\n`;
      fieldsJson += '            )';
      
      if (index < form.fields.length - 1) {
        fieldsJson += ',\n';
      } else {
        fieldsJson += '\n';
      }
    });
  }
  
  fieldsJson += '        )';
  
  // Generate form definition insert
  sql += `-- Form: ${form.name}\n`;
  sql += `INSERT INTO form_definitions (id, study_id, name, description, form_type, fields, created_by)\n`;
  sql += `VALUES (${parseInt(form.id)}, ${studyId}, '${escapeSqlString(form.name)}', '${escapeSqlString(form.description)}', \n`;
  sql += `        '${form.type}', \n`;
  sql += `        ${fieldsJson},\n`;
  sql += `        ${adminUserId});\n\n`;
  
  return sql;
}

/**
 * Escape special characters in a string for SQL insertion
 * @param {string} str The string to escape
 * @returns {string} Escaped string
 */
function escapeSqlString(str) {
  if (!str) return '';
  return str
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/\\/g, "\\\\");  // Escape backslashes
}

/**
 * Generate SQL INSERT statements for a subject
 * @param {Object} subject The subject object
 * @param {number} createdById The ID of the user who created the subject
 * @returns {string} SQL INSERT statement
 */
function generateSubjectSQL(subject, createdById = 1) {
  let sql = '';
  
  sql += `-- Subject: ${subject.protocolSubjectId}\n`;
  sql += `INSERT INTO subjects (id, protocol_subject_id, study_id, arm_id, enrollment_date, status, created_by)\n`;
  sql += `VALUES (${parseInt(subject.id)}, '${escapeSqlString(subject.protocolSubjectId)}', ${parseInt(subject.studyId)}, \n`;
  sql += `        ${parseInt(subject.armId)}, '${subject.enrollmentDate}', '${subject.status}', ${createdById});\n\n`;
  
  return sql;
}

export {
  generateStudySQL,
  generateFormSQL,
  generateSubjectSQL,
  escapeSqlString
};
